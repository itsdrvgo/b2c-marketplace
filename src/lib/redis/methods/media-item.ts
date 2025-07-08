import { queries } from "@/lib/db/queries";
import { generateCacheKey, parseToJSON } from "@/lib/utils";
import { CachedMediaItem, cachedMediaItemSchema } from "@/lib/validations";
import { getAllKeys, redis } from "..";

class MediaItemCache {
    private genKey: (...args: string[]) => string;

    constructor() {
        this.genKey = generateCacheKey({ prefix: "media-item" });
    }

    async scan(ids?: string[]) {
        if (ids && !!ids.length) {
            const keys = ids.map((id) => this.genKey(id));

            const [count, cached] = await Promise.all([
                queries.mediaItem.count(ids),
                redis.mget(...keys),
            ]);

            const parsed = cachedMediaItemSchema
                .array()
                .parse(
                    cached
                        .map((c) => parseToJSON(c))
                        .filter((c): c is CachedMediaItem => c !== null)
                )
                .sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                );

            if (parsed.length !== count) {
                await this.drop();

                const dbData = await queries.mediaItem.scan(ids);
                if (!dbData.length) return [];

                const cached = cachedMediaItemSchema.array().parse(dbData);

                await this.batch(cached);
                return cached;
            }

            return parsed;
        }

        const [count, keys] = await Promise.all([
            queries.mediaItem.count(),
            getAllKeys(this.genKey("*")),
        ]);

        if (count !== keys.length) {
            await this.drop();

            const dbData = await queries.mediaItem.scan();
            if (!dbData.length) return [];

            const cached = cachedMediaItemSchema.array().parse(dbData);

            await this.batch(cached);
            return cached;
        }
        if (!keys.length) return [];

        const cached = await redis.mget(...keys);
        return cachedMediaItemSchema
            .array()
            .parse(
                cached
                    .map((c) => parseToJSON(c))
                    .filter((c): c is CachedMediaItem => c !== null)
            );
    }

    async get(id: string) {
        const key = this.genKey(id);

        const cachedRaw = await redis.get(key);
        let cached = cachedMediaItemSchema
            .nullable()
            .parse(parseToJSON(cachedRaw));

        if (!cached) {
            const dbData = await queries.mediaItem.get(id);
            if (!dbData) return null;

            cached = cachedMediaItemSchema.parse(dbData);
            await this.add(cached);
        }

        return cached;
    }

    async add(values: CachedMediaItem) {
        const key = this.genKey(values.id);
        return await redis.set(key, JSON.stringify(values));
    }

    async batch(values: CachedMediaItem[]) {
        const multi = redis.multi();

        for (const value of values) {
            const key = this.genKey(value.id);
            multi.set(key, JSON.stringify(value));
        }

        return await multi.exec();
    }

    async remove(id: string) {
        const key = this.genKey(id);
        return await redis.del(key);
    }

    async drop() {
        const keys = await getAllKeys(this.genKey("*"));
        if (!keys.length) return 0;
        return await redis.del(...keys);
    }
}

export const mediaItemCache = new MediaItemCache();

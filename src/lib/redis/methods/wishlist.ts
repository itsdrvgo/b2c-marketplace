import { REDIS_RETENTIONS } from "@/config/const";
import { queries } from "@/lib/db/queries";
import { generateCustomCacheKey, parseToJSON } from "@/lib/utils";
import { CachedWishlist, cachedWishlistSchema } from "@/lib/validations";
import { getAllKeys, redis } from "..";

class WishlistCache {
    async scan(userId: string) {
        const [count, keys] = await Promise.all([
            queries.wishlist.count(userId),
            getAllKeys(generateCustomCacheKey([userId, undefined], "wishlist")),
        ]);

        if (count !== keys.length) {
            await this.drop(userId);

            const dbData = await queries.wishlist.scan(userId);
            if (!dbData) return [];

            const cached = cachedWishlistSchema
                .array()
                .parse(dbData)
                .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

            await this.batch(cached);
            return cached;
        }
        if (!keys.length) return [];

        const cached = await redis.mget(...keys);
        return cachedWishlistSchema
            .array()
            .parse(
                cached
                    .map((c) => parseToJSON(c))
                    .filter((c): c is CachedWishlist => c !== null)
            );
    }

    async get({ userId, productId }: { userId: string; productId: string }) {
        const key = generateCustomCacheKey([userId, productId], "wishlist");

        const cachedRaw = await redis.get(key);
        let cached = cachedWishlistSchema
            .nullable()
            .parse(parseToJSON(cachedRaw));

        if (!cached) {
            const dbData = await queries.wishlist.get({ userId, productId });
            if (!dbData) return null;

            cached = cachedWishlistSchema.parse(dbData);
            await this.add(cached);
        }

        return cached;
    }

    async add(values: CachedWishlist) {
        const key = generateCustomCacheKey(
            [values.userId, values.product.id],
            "wishlist"
        );
        return await redis.set(
            key,
            JSON.stringify(values),
            "EX",
            REDIS_RETENTIONS["1w"]
        );
    }

    async batch(values: CachedWishlist[]) {
        const multi = redis.multi();

        for (const value of values) {
            const key = generateCustomCacheKey(
                [value.userId, value.product.id],
                "wishlist"
            );
            multi.set(key, JSON.stringify(value), "EX", REDIS_RETENTIONS["1w"]);
        }

        return await multi.exec();
    }

    async remove({ userId, productId }: { userId: string; productId: string }) {
        const key = generateCustomCacheKey([userId, productId], "wishlist");
        return await redis.del(key);
    }

    async drop(userId?: string) {
        const keys = await getAllKeys(
            generateCustomCacheKey([userId, undefined], "wishlist")
        );
        if (!keys.length) return 0;
        return await redis.del(...keys);
    }
}

export const wishlistCache = new WishlistCache();

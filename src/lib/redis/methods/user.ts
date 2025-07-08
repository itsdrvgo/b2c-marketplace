import { REDIS_RETENTIONS } from "@/config/const";
import { queries } from "@/lib/db/queries";
import { generateCacheKey, parseToJSON } from "@/lib/utils";
import { CachedUser, cachedUserSchema } from "@/lib/validations/user";
import { getAllKeys, redis } from "..";

class UserCache {
    private genKey: (...args: string[]) => string;

    constructor() {
        this.genKey = generateCacheKey({ prefix: "user" });
    }

    async get(id: string) {
        const key = this.genKey(id);

        const cachedRaw = await redis.get(key);
        let cached = cachedUserSchema.nullable().parse(parseToJSON(cachedRaw));

        if (!cached) {
            const dbData = await queries.user.get(id);
            if (!dbData) return null;

            cached = cachedUserSchema.parse(dbData);
            await this.add(cached);
        }

        return cached;
    }

    async add(values: CachedUser) {
        const key = this.genKey(values.id);
        return await redis.set(
            key,
            JSON.stringify(values),
            "EX",
            REDIS_RETENTIONS["1d"]
        );
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

export const userCache = new UserCache();

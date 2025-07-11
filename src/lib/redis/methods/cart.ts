import { REDIS_RETENTIONS } from "@/config/const";
import { queries } from "@/lib/db/queries";
import { generateCustomCacheKey, parseToJSON } from "@/lib/utils";
import { CachedCart, cachedCartSchema } from "@/lib/validations";
import { getAllKeys, redis } from "..";

class CartCache {
    async scan(userId: string) {
        const [count, keys] = await Promise.all([
            queries.cart.count(userId),
            getAllKeys(
                generateCustomCacheKey([userId, undefined, undefined], "cart")
            ),
        ]);

        if (count !== keys.length) {
            await this.drop(userId);

            const dbData = await queries.cart.scan(userId);
            if (!dbData) return [];

            const cached = cachedCartSchema
                .array()
                .parse(dbData)
                .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

            await this.batch(cached);
            return cached;
        }
        if (!keys.length) return [];

        const cached = await redis.mget(...keys);
        return cachedCartSchema
            .array()
            .parse(
                cached
                    .map((c) => parseToJSON(c))
                    .filter((c): c is CachedCart => c !== null)
            );
    }

    async get({
        userId,
        productId,
        variantId,
    }: {
        userId: string;
        productId: string;
        variantId?: string;
    }) {
        const key = generateCustomCacheKey(
            [userId, productId, variantId],
            "cart"
        );

        const cachedRaw = await redis.get(key);
        let cached = cachedCartSchema.nullable().parse(parseToJSON(cachedRaw));

        if (!cached) {
            const dbData = await queries.cart.get({
                userId,
                productId,
                variantId,
            });
            if (!dbData) return null;

            cached = cachedCartSchema.parse(dbData);
            await this.add(cached);
        }

        return cached;
    }

    async add(values: CachedCart) {
        const key = generateCustomCacheKey(
            [values.userId, values.product.id, values.variant?.id],
            "cart"
        );
        return await redis.set(
            key,
            JSON.stringify(values),
            "EX",
            REDIS_RETENTIONS["1w"]
        );
    }

    async batch(values: CachedCart[]) {
        const multi = redis.multi();

        for (const value of values) {
            const key = generateCustomCacheKey(
                [value.userId, value.product.id, value.variant?.id],
                "cart"
            );
            multi.set(key, JSON.stringify(value), "EX", REDIS_RETENTIONS["1w"]);
        }

        return await multi.exec();
    }

    async remove({
        userId,
        productId,
        variantId,
    }: {
        userId: string;
        productId: string;
        variantId?: string;
    }) {
        const key = generateCustomCacheKey(
            [userId, productId, variantId],
            "cart"
        );
        return await redis.del(key);
    }

    async drop(userId?: string) {
        const keys = await getAllKeys(
            generateCustomCacheKey([userId, undefined, undefined], "cart")
        );
        if (!keys.length) return 0;
        return await redis.del(...keys);
    }
}

export const cartCache = new CartCache();

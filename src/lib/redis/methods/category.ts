import { REDIS_RETENTIONS } from "@/config/const";
import { queries } from "@/lib/db/queries";
import { generateCacheKey, parseToJSON } from "@/lib/utils";
import {
    CachedCategory,
    cachedCategorySchema,
    CachedProductType,
    cachedProductTypeSchema,
    CachedSubcategory,
    cachedSubcategorySchema,
} from "@/lib/validations";
import { getAllKeys, redis } from "..";

class CategoryCache {
    private genKey: (...args: string[]) => string;

    constructor() {
        this.genKey = generateCacheKey({ prefix: "category" });
    }

    async scan(): Promise<CachedCategory[]> {
        const [count, keys] = await Promise.all([
            queries.category.count(),
            getAllKeys(this.genKey("*")),
        ]);

        if (count !== keys.length) {
            await this.drop();

            const dbData = await queries.category.scan();
            if (!dbData.length) return [];

            const cached = cachedCategorySchema.array().parse(dbData);

            await this.batch(dbData);
            return cached;
        }
        if (!keys.length) return [];

        const cached = await redis.mget(...keys);
        return cachedCategorySchema
            .array()
            .parse(
                cached
                    .map((c) => parseToJSON(c))
                    .filter((c): c is CachedCategory => c !== null)
            );
    }

    async get(id: string): Promise<CachedCategory | null> {
        const key = this.genKey(id);

        const cachedRaw = await redis.get(key);
        let cached = cachedCategorySchema
            .nullable()
            .parse(parseToJSON(cachedRaw));

        if (!cached) {
            const dbData = await queries.category.get({ id });
            if (!dbData) return null;

            cached = cachedCategorySchema.parse(dbData);
            await this.add(cached);
        }

        return cached;
    }

    async add(values: CachedCategory) {
        const key = this.genKey(values.id);
        return await redis.set(
            key,
            JSON.stringify(values),
            "EX",
            REDIS_RETENTIONS["1w"]
        );
    }

    async batch(values: CachedCategory[]) {
        const multi = redis.multi();

        for (const value of values) {
            const key = this.genKey(value.id);
            multi.set(key, JSON.stringify(value), "EX", REDIS_RETENTIONS["1w"]);
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

class SubcategoryCache {
    private genKey: (...args: string[]) => string;

    constructor() {
        this.genKey = generateCacheKey({ prefix: "subcategory" });
    }

    async scan(): Promise<CachedSubcategory[]> {
        const [count, keys] = await Promise.all([
            queries.subcategory.count(),
            getAllKeys(this.genKey("*")),
        ]);

        if (count !== keys.length) {
            await this.drop();

            const dbData = await queries.subcategory.scan();
            if (!dbData.length) return [];

            const cached = cachedSubcategorySchema.array().parse(dbData);

            await this.batch(dbData);
            return cached;
        }
        if (!keys.length) return [];

        const cached = await redis.mget(...keys);
        return cachedSubcategorySchema
            .array()
            .parse(
                cached
                    .map((c) => parseToJSON(c))
                    .filter((c): c is CachedSubcategory => c !== null)
            );
    }

    async get(id: string): Promise<CachedSubcategory | null> {
        const key = this.genKey(id);

        const cachedRaw = await redis.get(key);
        let cached = cachedSubcategorySchema
            .nullable()
            .parse(parseToJSON(cachedRaw));

        if (!cached) {
            const dbData = await queries.subcategory.get({ id });
            if (!dbData) return null;

            cached = cachedSubcategorySchema.parse(dbData);
            await this.add(cached);
        }

        return cached;
    }

    async add(values: CachedSubcategory) {
        const key = this.genKey(values.id);
        return await redis.set(
            key,
            JSON.stringify(values),
            "EX",
            REDIS_RETENTIONS["1w"]
        );
    }

    async batch(values: CachedSubcategory[]) {
        const multi = redis.multi();

        for (const value of values) {
            const key = this.genKey(value.id);
            multi.set(key, JSON.stringify(value), "EX", REDIS_RETENTIONS["1w"]);
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

class ProductTypeCache {
    private genKey: (...args: string[]) => string;

    constructor() {
        this.genKey = generateCacheKey({ prefix: "product-type" });
    }

    async scan(): Promise<CachedProductType[]> {
        const [count, keys] = await Promise.all([
            queries.productType.count(),
            getAllKeys(this.genKey("*")),
        ]);

        if (count !== keys.length) {
            await this.drop();

            const dbData = await queries.productType.scan();
            if (!dbData.length) return [];

            const cached = cachedProductTypeSchema.array().parse(dbData);

            await this.batch(dbData);
            return cached;
        }
        if (!keys.length) return [];

        const cached = await redis.mget(...keys);
        return cachedProductTypeSchema
            .array()
            .parse(
                cached
                    .map((c) => parseToJSON(c))
                    .filter((c): c is CachedProductType => c !== null)
            );
    }

    async get(id: string): Promise<CachedProductType | null> {
        const key = this.genKey(id);

        const cachedRaw = await redis.get(key);
        let cached = cachedProductTypeSchema
            .nullable()
            .parse(parseToJSON(cachedRaw));

        if (!cached) {
            const dbData = await queries.productType.get({ id });
            if (!dbData) return null;

            cached = cachedProductTypeSchema.parse(dbData);
            await this.add(cached);
        }

        return cached;
    }

    async add(values: CachedProductType) {
        const key = this.genKey(values.id);
        return await redis.set(
            key,
            JSON.stringify(values),
            "EX",
            REDIS_RETENTIONS["1w"]
        );
    }

    async batch(values: CachedProductType[]) {
        const multi = redis.multi();

        for (const value of values) {
            const key = this.genKey(value.id);
            multi.set(key, JSON.stringify(value), "EX", REDIS_RETENTIONS["1w"]);
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

export const categoryCache = new CategoryCache();
export const subcategoryCache = new SubcategoryCache();
export const productTypeCache = new ProductTypeCache();

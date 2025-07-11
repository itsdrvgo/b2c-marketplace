import {
    CreateCategory,
    CreateProductType,
    CreateSubcategory,
    UpdateCategory,
    UpdateProductType,
    UpdateSubcategory,
} from "@/lib/validations";
import { eq, or } from "drizzle-orm";
import { db } from "..";
import { categories, productTypes, subcategories } from "../schemas";

class CategoryQuery {
    async count() {
        const data = await db.$count(categories);
        return +data || 0;
    }

    async scan() {
        const data = await db.query.categories.findMany({
            with: { subcategories: true },
            orderBy: (f, o) => [o.desc(f.createdAt)],
        });

        return data.map((d) => ({
            ...d,
            subcategories: d.subcategories.length || 0,
        }));
    }

    async get({ id, slug }: { id?: string; slug?: string }) {
        if (!id && !slug) throw new Error("Either id or slug must be provided");

        const data = await db.query.categories.findFirst({
            where: (f, o) =>
                o.or(
                    id ? o.eq(f.id, id) : undefined,
                    slug ? o.eq(f.slug, slug) : undefined
                ),
            with: { subcategories: true },
        });
        if (!data) return null;

        return {
            ...data,
            subcategories: data.subcategories.length || 0,
        };
    }

    async create(values: CreateCategory & { slug: string }) {
        const data = await db
            .insert(categories)
            .values(values)
            .returning()
            .then((res) => res[0]);

        return data;
    }

    async update(id: string, values: UpdateCategory & { slug: string }) {
        const data = await db
            .update(categories)
            .set({ ...values, updatedAt: new Date() })
            .where(eq(categories.id, id))
            .returning()
            .then((res) => res[0]);

        return data;
    }

    async delete(id: string) {
        const data = await db
            .delete(categories)
            .where(eq(categories.id, id))
            .returning()
            .then((res) => res[0]);

        return data;
    }
}

class SubcategoryQuery {
    async count(categoryId?: string) {
        const data = await db.$count(
            subcategories,
            categoryId ? eq(subcategories.categoryId, categoryId) : undefined
        );
        return +data || 0;
    }

    async scan(categoryId?: string) {
        const data = await db.query.subcategories.findMany({
            where: (f, o) =>
                o.and(categoryId ? o.eq(f.categoryId, categoryId) : undefined),
            with: { productTypes: true },
            orderBy: (f, o) => [o.desc(f.createdAt)],
        });

        return data.map((d) => ({
            ...d,
            productTypes: d.productTypes.length || 0,
        }));
    }

    async get({
        id,
        slug,
        categoryId,
    }: {
        id?: string;
        slug?: string;
        categoryId?: string;
    }) {
        if (!id && !slug) throw new Error("Either id or slug must be provided");

        const data = await db.query.subcategories.findFirst({
            where: (f, o) =>
                o.and(
                    o.or(
                        id ? o.eq(f.id, id) : undefined,
                        slug ? o.eq(f.slug, slug) : undefined
                    ),
                    categoryId ? o.eq(f.categoryId, categoryId) : undefined
                ),
            with: { productTypes: true },
        });
        if (!data) return null;

        return {
            ...data,
            productTypes: data.productTypes.length || 0,
        };
    }

    async create(values: CreateSubcategory & { slug: string }) {
        const data = await db
            .insert(subcategories)
            .values(values)
            .returning()
            .then((res) => res[0]);

        return data;
    }

    async update(id: string, values: UpdateSubcategory & { slug: string }) {
        const data = await db
            .update(subcategories)
            .set(values)
            .where(eq(subcategories.id, id))
            .returning()
            .then((res) => res[0]);

        return data;
    }

    async delete(id: string) {
        const data = await db
            .delete(subcategories)
            .where(eq(subcategories.id, id))
            .returning()
            .then((res) => res[0]);

        return data;
    }
}

class ProductTypeQuery {
    async count({
        categoryId,
        subcategoryId,
    }: {
        categoryId?: string;
        subcategoryId?: string;
    } = {}) {
        const data = await db.$count(
            productTypes,
            or(
                categoryId
                    ? eq(productTypes.categoryId, categoryId)
                    : undefined,
                subcategoryId
                    ? eq(productTypes.subcategoryId, subcategoryId)
                    : undefined
            )
        );
        return +data || 0;
    }

    async scan({
        categoryId,
        subcategoryId,
    }: {
        categoryId?: string;
        subcategoryId?: string;
    } = {}) {
        const data = await db.query.productTypes.findMany({
            where: (f, o) =>
                o.and(
                    or(
                        categoryId ? o.eq(f.categoryId, categoryId) : undefined,
                        subcategoryId
                            ? o.eq(f.subcategoryId, subcategoryId)
                            : undefined
                    )
                ),
            orderBy: (f, o) => [o.desc(f.createdAt)],
        });

        return data;
    }

    async get({
        id,
        slug,
        categoryId,
        subcategoryId,
    }: {
        id?: string;
        slug?: string;
        categoryId?: string;
        subcategoryId?: string;
    }) {
        if (!id && !slug) throw new Error("Either id or slug must be provided");

        const data = await db.query.productTypes.findFirst({
            where: (f, o) =>
                o.and(
                    o.or(
                        id ? o.eq(f.id, id) : undefined,
                        slug ? o.eq(f.slug, slug) : undefined
                    ),
                    categoryId ? o.eq(f.categoryId, categoryId) : undefined,
                    subcategoryId
                        ? o.eq(f.subcategoryId, subcategoryId)
                        : undefined
                ),
        });
        if (!data) return null;

        return data;
    }

    async create(values: CreateProductType & { slug: string }) {
        const data = await db
            .insert(productTypes)
            .values(values)
            .returning()
            .then((res) => res[0]);

        return data;
    }

    async update(id: string, values: UpdateProductType & { slug: string }) {
        const data = await db
            .update(productTypes)
            .set(values)
            .where(eq(productTypes.id, id))
            .returning()
            .then((res) => res[0]);

        return data;
    }

    async delete(id: string) {
        const data = await db
            .delete(productTypes)
            .where(eq(productTypes.id, id))
            .returning()
            .then((res) => res[0]);

        return data;
    }
}

export const categoryQueries = new CategoryQuery();
export const subcategoryQueries = new SubcategoryQuery();
export const productTypeQueries = new ProductTypeQuery();

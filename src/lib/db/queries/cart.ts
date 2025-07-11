import { cache } from "@/lib/redis/methods";
import { cachedCartSchema, CreateCart, UpdateCart } from "@/lib/validations";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "..";
import { carts } from "../schemas";

class CartQuery {
    async count(userId: string) {
        const data = await db.$count(carts, eq(carts.userId, userId));
        return +data || 0;
    }

    async scan(userId: string) {
        const data = await db.query.carts.findMany({
            with: {
                product: {
                    with: {
                        variants: true,
                        category: true,
                        subcategory: true,
                        productType: true,
                        options: true,
                    },
                },
                variant: true,
            },
            where: eq(carts.userId, userId),
        });
        if (!data.length) return [];

        const mediaIds = new Set<string>();
        data.forEach((item) => {
            item.product.media.forEach((media) => mediaIds.add(media.id));
            item.product.variants.forEach((variant) => {
                if (variant.image) mediaIds.add(variant.image);
            });
        });

        const mediaItems = await cache.mediaItem.scan(Array.from(mediaIds));
        const mediaMap = new Map(mediaItems.map((item) => [item.id, item]));

        const enhanced = data.map((item) => ({
            ...item,
            product: {
                ...item.product,
                media: item.product.media.map((media) => ({
                    ...media,
                    mediaItem: mediaMap.get(media.id),
                })),
                variants: item.product.variants.map((variant) => ({
                    ...variant,
                    mediaItem: variant.image
                        ? mediaMap.get(variant.image)
                        : null,
                })),
            },
        }));

        const parsed = cachedCartSchema.array().parse(enhanced);
        return parsed;
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
        const data = await db.query.carts.findFirst({
            with: {
                product: {
                    with: {
                        variants: true,
                        category: true,
                        subcategory: true,
                        productType: true,
                        options: true,
                    },
                },
                variant: true,
            },
            where: (f, o) =>
                o.and(
                    o.eq(carts.userId, userId),
                    o.eq(carts.productId, productId),
                    variantId ? o.eq(carts.variantId, variantId) : undefined
                ),
        });

        const product = data?.product;
        if (!product) return null;

        const mediaIds = new Set<string>();
        product.media.forEach((media) => mediaIds.add(media.id));
        product.variants.forEach((variant) => {
            if (variant.image) mediaIds.add(variant.image);
        });

        const mediaItems = await cache.mediaItem.scan(Array.from(mediaIds));
        const mediaMap = new Map(mediaItems.map((item) => [item.id, item]));

        const enhanced = {
            ...data,
            product: {
                ...product,
                media: product.media.map((media) => ({
                    ...media,
                    mediaItem: mediaMap.get(media.id),
                })),
                variants: product.variants.map((variant) => ({
                    ...variant,
                    mediaItem: variant.image
                        ? mediaMap.get(variant.image)
                        : null,
                })),
            },
        };

        const parsed = cachedCartSchema.parse(enhanced);
        return parsed;
    }

    async create(values: CreateCart) {
        const data = await db
            .insert(carts)
            .values(values)
            .returning()
            .then((res) => res[0]);

        return data;
    }

    async update(
        values:
            | { id: string; values: UpdateCart }
            | { ids: string[]; status: boolean }
    ) {
        if ("id" in values) {
            const data = await db
                .update(carts)
                .set({
                    ...values.values,
                    updatedAt: new Date(),
                })
                .where(eq(carts.id, values.id))
                .returning()
                .then((res) => res[0]);

            return data;
        } else {
            const data = await db
                .update(carts)
                .set({ status: values.status, updatedAt: new Date() })
                .where(inArray(carts.id, values.ids))
                .returning()
                .then((res) => res[0]);

            return data;
        }
    }

    async delete({ userId, ids }: { userId: string; ids: string[] }) {
        const data = await db
            .delete(carts)
            .where(and(eq(carts.userId, userId), inArray(carts.id, ids)))
            .returning()
            .then((res) => res[0]);

        return data;
    }

    async drop({ userId, status }: { userId: string; status?: boolean }) {
        const data = await db
            .delete(carts)
            .where(
                and(
                    eq(carts.userId, userId),
                    status ? eq(carts.status, status) : undefined
                )
            )
            .returning()
            .then((res) => res[0]);

        return data;
    }
}

export const cartQueries = new CartQuery();

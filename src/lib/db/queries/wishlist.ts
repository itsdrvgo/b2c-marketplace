import { cache } from "@/lib/redis/methods";
import { cachedWishlistSchema, CreateWishlist } from "@/lib/validations";
import { eq } from "drizzle-orm";
import { db } from "..";
import { wishlists } from "../schemas";

class WishlistQuery {
    async count(userId: string) {
        const data = await db.$count(wishlists, eq(wishlists.userId, userId));
        return +data || 0;
    }

    async scan(userId: string) {
        const data = await db.query.wishlists.findMany({
            with: {
                product: {
                    with: {
                        uploader: true,
                        variants: true,
                        category: true,
                        subcategory: true,
                        productType: true,
                        options: true,
                    },
                },
            },
            where: eq(wishlists.userId, userId),
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

        const parsed = cachedWishlistSchema.array().parse(enhanced);
        return parsed;
    }

    async get({ userId, productId }: { userId: string; productId: string }) {
        const data = await db.query.wishlists.findFirst({
            with: {
                product: {
                    with: {
                        uploader: true,
                        variants: true,
                        category: true,
                        subcategory: true,
                        productType: true,
                        options: true,
                    },
                },
            },
            where: (f, o) =>
                o.and(
                    eq(f.userId, userId),
                    productId ? eq(f.productId, productId) : undefined
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

        const parsed = cachedWishlistSchema.parse(enhanced);
        return parsed;
    }

    async create(values: CreateWishlist) {
        const data = await db
            .insert(wishlists)
            .values(values)
            .returning()
            .then((res) => res[0]);

        return data;
    }

    async delete(id: string) {
        const data = await db
            .delete(wishlists)
            .where(eq(wishlists.id, id))
            .returning()
            .then((res) => res[0]);

        return data;
    }

    async drop(userId: string) {
        const data = await db
            .delete(wishlists)
            .where(eq(wishlists.userId, userId))
            .returning()
            .then((res) => res[0]);

        return data;
    }
}

export const wishlistQueries = new WishlistQuery();

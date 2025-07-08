import {
    DEFAULT_PRODUCT_PAGINATION_LIMIT,
    DEFAULT_PRODUCT_PAGINATION_PAGE,
} from "@/config/const";
import { cache } from "@/lib/redis/methods";
import { convertDollarToCent } from "@/lib/utils";
import { FullProduct, fullProductSchema, Product } from "@/lib/validations";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "..";
import { products, productVariants } from "../schemas";

class ProductQuery {
    async count({
        isActive,
        isAvailable,
        isDeleted,
        isPublished,
        verificationStatus,
    }: {
        isDeleted?: boolean;
        isAvailable?: boolean;
        isPublished?: boolean;
        isActive?: boolean;
        verificationStatus?: Product["verificationStatus"];
    }) {
        const data = await db.$count(
            products,
            and(
                isDeleted !== undefined
                    ? eq(products.isDeleted, isDeleted)
                    : undefined,
                isAvailable !== undefined
                    ? eq(products.isAvailable, isAvailable)
                    : undefined,
                isPublished !== undefined
                    ? eq(products.isPublished, isPublished)
                    : undefined,
                isActive !== undefined
                    ? eq(products.isActive, isActive)
                    : undefined,
                verificationStatus !== undefined
                    ? eq(products.verificationStatus, verificationStatus)
                    : undefined
            )
        );

        return +data || 0;
    }

    async paginate({
        limit = DEFAULT_PRODUCT_PAGINATION_LIMIT,
        page = DEFAULT_PRODUCT_PAGINATION_PAGE,
        search,
        minPrice,
        maxPrice,
        categoryId,
        subcategoryId,
        productTypeId,
        isActive,
        isAvailable,
        isPublished,
        isDeleted,
        verificationStatus,
        sortBy = "createdAt",
        sortOrder = "desc",
    }: {
        limit?: number;
        page?: number;
        search?: string;
        minPrice?: number | null;
        maxPrice?: number | null;
        categoryId?: string;
        subcategoryId?: string;
        productTypeId?: string;
        isActive?: boolean;
        isAvailable?: boolean;
        isPublished?: boolean;
        isDeleted?: boolean;
        verificationStatus?: Product["verificationStatus"];
        sortBy?: "price" | "createdAt";
        sortOrder?: "asc" | "desc";
    }) {
        const searchQuery = !!search?.length
            ? sql`(
            setweight(to_tsvector('english', ${products.title}), 'A') ||
            setweight(to_tsvector('english', ${products.description}), 'B'))
            @@ plainto_tsquery('english', ${search})`
            : undefined;

        minPrice = !!minPrice
            ? minPrice < 0
                ? 0
                : convertDollarToCent(minPrice)
            : null;
        maxPrice = !!maxPrice
            ? maxPrice > 10000
                ? null
                : convertDollarToCent(maxPrice)
            : null;

        const filters = [
            searchQuery,
            !!minPrice
                ? sql`(
                    COALESCE(${products.price}, 0) >= ${minPrice} 
                    OR EXISTS (
                        SELECT 1 FROM ${productVariants} pv
                        WHERE pv.product_id = ${products.id}
                        AND COALESCE(pv.price, 0) >= ${minPrice}
                        AND pv.is_deleted = false
                    )
                )`
                : undefined,
            !!maxPrice
                ? sql`(
                    COALESCE(${products.price}, 0) <= ${maxPrice}
                    OR EXISTS (
                        SELECT 1 FROM ${productVariants} pv
                        WHERE pv.product_id = ${products.id}
                        AND COALESCE(pv.price, 0) <= ${maxPrice}
                        AND pv.is_deleted = false
                    )
                )`
                : undefined,
            isActive !== undefined
                ? eq(products.isActive, isActive)
                : undefined,
            isAvailable !== undefined
                ? eq(products.isAvailable, isAvailable)
                : undefined,
            isPublished !== undefined
                ? eq(products.isPublished, isPublished)
                : undefined,
            isDeleted !== undefined
                ? eq(products.isDeleted, isDeleted)
                : undefined,
            categoryId ? eq(products.categoryId, categoryId) : undefined,
            subcategoryId
                ? eq(products.subcategoryId, subcategoryId)
                : undefined,
            productTypeId
                ? eq(products.productTypeId, productTypeId)
                : undefined,
            verificationStatus
                ? eq(products.verificationStatus, verificationStatus)
                : undefined,
        ];

        const data = await db.query.products.findMany({
            with: {
                uploader: true,
                variants: true,
                category: true,
                subcategory: true,
                productType: true,
                options: true,
            },
            where: and(...filters),
            limit,
            offset: (page - 1) * limit,
            orderBy: searchQuery
                ? [
                      sortOrder === "asc"
                          ? asc(products[sortBy])
                          : desc(products[sortBy]),
                      desc(sql`ts_rank(
                        setweight(to_tsvector('english', ${products.title}), 'A') ||
                        setweight(to_tsvector('english', ${products.description}), 'B'),
                        plainto_tsquery('english', ${search})
                      )`),
                  ]
                : [
                      sortOrder === "asc"
                          ? asc(products[sortBy])
                          : desc(products[sortBy]),
                  ],
            extras: {
                count: db
                    .$count(products, and(...filters))
                    .as("products_count"),
            },
        });

        const mediaIds = new Set<string>();
        for (const product of data) {
            product.media.forEach((media) => mediaIds.add(media.id));
            product.variants.forEach((variant) => {
                if (variant.image) mediaIds.add(variant.image);
            });
        }

        const mediaItems = await cache.mediaItem.scan(Array.from(mediaIds));
        const mediaMap = new Map(mediaItems.map((item) => [item.id, item]));

        const enhanced = data.map((product) => ({
            ...product,
            media: product.media.map((media) => ({
                ...media,
                mediaItem: mediaMap.get(media.id),
            })),
            variants: product.variants.map((variant) => ({
                ...variant,
                mediaItem: variant.image ? mediaMap.get(variant.image) : null,
            })),
        }));

        const items = +data?.[0]?.count || 0;
        const pages = Math.ceil(items / limit);

        const parsed: FullProduct[] = fullProductSchema.array().parse(enhanced);

        return {
            data: parsed,
            items,
            pages,
        };
    }
}

export const productQueries = new ProductQuery();

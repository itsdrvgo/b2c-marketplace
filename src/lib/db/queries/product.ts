import {
    DEFAULT_PRODUCT_PAGINATION_LIMIT,
    DEFAULT_PRODUCT_PAGINATION_PAGE,
} from "@/config/const";
import { cache } from "@/lib/redis/methods";
import { convertDollarToCent } from "@/lib/utils";
import {
    CreateProduct,
    FullProduct,
    fullProductSchema,
    Product,
    UpdateProduct,
} from "@/lib/validations";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "..";
import { productOptions, products, productVariants } from "../schemas";

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

    async get({
        id,
        isActive,
        isAvailable,
        isPublished,
        isDeleted,
        verificationStatus,
        sku,
        slug,
    }: {
        id?: string;
        sku?: string;
        slug?: string;
        isDeleted?: boolean;
        isAvailable?: boolean;
        isPublished?: boolean;
        isActive?: boolean;
        verificationStatus?: Product["verificationStatus"];
    }) {
        if (!id && !sku && !slug)
            throw new Error("Must provide id, sku or slug");

        const data = await db.query.products.findFirst({
            with: {
                uploader: true,
                variants: true,
                category: true,
                subcategory: true,
                productType: true,
                options: true,
            },
            where: (f, o) =>
                o.and(
                    o.or(
                        id ? o.eq(products.id, id) : undefined,
                        sku ? o.eq(products.sku, sku) : undefined,
                        slug ? o.eq(products.slug, slug) : undefined
                    ),
                    isDeleted !== undefined
                        ? o.eq(products.isDeleted, isDeleted)
                        : undefined,
                    isAvailable !== undefined
                        ? o.eq(products.isAvailable, isAvailable)
                        : undefined,
                    isPublished !== undefined
                        ? o.eq(products.isPublished, isPublished)
                        : undefined,
                    isActive !== undefined
                        ? o.eq(products.isActive, isActive)
                        : undefined,
                    verificationStatus !== undefined
                        ? o.eq(products.verificationStatus, verificationStatus)
                        : undefined
                ),
        });
        if (!data) return null;

        const mediaIds = new Set<string>();
        data.media.forEach((media) => mediaIds.add(media.id));
        data.variants.forEach((variant) => {
            if (variant.image) mediaIds.add(variant.image);
        });

        const mediaItems = await cache.mediaItem.scan(Array.from(mediaIds));
        const mediaMap = new Map(mediaItems.map((item) => [item.id, item]));

        const enhanced = {
            ...data,
            media: data.media.map((media) => ({
                ...media,
                mediaItem: mediaMap.get(media.id),
            })),
            variants: data.variants.map((variant) => ({
                ...variant,
                mediaItem: variant.image ? mediaMap.get(variant.image) : null,
            })),
        };

        return enhanced;
    }

    async batch(values: (CreateProduct & { slug: string })[]) {
        const data = await db.transaction(async (tx) => {
            const newProducts = await tx
                .insert(products)
                .values(values)
                .returning()
                .then((res) => res);

            const optionsToInsert = values.flatMap((value, index) =>
                value.options.map((option) => ({
                    ...option,
                    productId: newProducts[index].id,
                }))
            );
            const variantsToInsert = values.flatMap((value, index) =>
                value.variants.map((variant) => ({
                    ...variant,
                    productId: newProducts[index].id,
                }))
            );

            const [newOptions, newVariants] = await Promise.all([
                !!optionsToInsert.length
                    ? tx
                          .insert(productOptions)
                          .values(optionsToInsert)
                          .returning()
                    : [],
                !!variantsToInsert.length
                    ? tx
                          .insert(productVariants)
                          .values(variantsToInsert)
                          .returning()
                    : [],
            ]);

            return newProducts.map((product) => ({
                ...product,
                options: newOptions.filter((o) => o.productId === product.id),
                variants: newVariants.filter((v) => v.productId === product.id),
            }));
        });

        return data;
    }

    async update(id: string, values: UpdateProduct) {
        const data = await db.transaction(async (tx) => {
            const updatedProduct = await tx
                .update(products)
                .set({
                    ...values,
                    updatedAt: new Date(),
                })
                .where(eq(products.id, id))
                .returning()
                .then((res) => res[0]);

            const [existingOptions, existingVariants] = await Promise.all([
                tx.query.productOptions.findMany({
                    where: eq(productOptions.productId, id),
                }),
                tx.query.productVariants.findMany({
                    where: eq(productVariants.productId, id),
                }),
            ]);

            const optionsToBeAdded =
                values.options?.filter(
                    (option) => !existingOptions.find((o) => o.id === option.id)
                ) || [];
            const optionsToBeUpdated =
                values.options?.filter((option) => {
                    const existing = existingOptions.find(
                        (o) => o.id === option.id
                    );
                    return (
                        existing &&
                        JSON.stringify(option) !== JSON.stringify(existing)
                    );
                }) || [];
            const optionsToBeDeleted =
                existingOptions.filter(
                    (option) => !values.options?.find((o) => o.id === option.id)
                ) || [];

            const variantsToBeAdded =
                values.variants?.filter(
                    (variant) =>
                        !existingVariants.find((v) => v.id === variant.id)
                ) || [];
            const variantsToBeUpdated =
                values.variants?.filter((variant) => {
                    const existing = existingVariants.find(
                        (v) => v.id === variant.id
                    );
                    return (
                        existing &&
                        JSON.stringify(variant) !== JSON.stringify(existing)
                    );
                }) || [];
            const variantsToBeDeleted =
                existingVariants.filter(
                    (variant) =>
                        !values.variants?.find((v) => v.id === variant.id)
                ) || [];

            await Promise.all([
                optionsToBeAdded.length &&
                    tx.insert(productOptions).values(optionsToBeAdded),
                variantsToBeAdded.length &&
                    tx
                        .insert(productVariants)
                        .values(variantsToBeAdded)
                        .returning(),
                ...optionsToBeUpdated.map((option) =>
                    tx
                        .update(productOptions)
                        .set(option)
                        .where(
                            and(
                                eq(productOptions.productId, id),
                                eq(productOptions.id, option.id)
                            )
                        )
                ),
                ...variantsToBeUpdated.map((variant) =>
                    tx
                        .update(productVariants)
                        .set(variant)
                        .where(
                            and(
                                eq(productVariants.productId, id),
                                eq(productVariants.id, variant.id)
                            )
                        )
                ),
            ]);

            await Promise.all([
                tx
                    .update(productOptions)
                    .set({
                        isDeleted: true,
                        deletedAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .where(
                        and(
                            eq(productOptions.productId, id),
                            inArray(
                                productOptions.id,
                                optionsToBeDeleted.map((o) => o.id)
                            )
                        )
                    ),
                tx
                    .update(productVariants)
                    .set({
                        isDeleted: true,
                        deletedAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .where(
                        and(
                            eq(productVariants.productId, id),
                            inArray(
                                productVariants.id,
                                variantsToBeDeleted.map((v) => v.id)
                            )
                        )
                    ),
            ]);

            const [updatedOptions, updatedVariants] = await Promise.all([
                tx.query.productOptions.findMany({
                    where: eq(productOptions.productId, id),
                }),
                tx.query.productVariants.findMany({
                    where: eq(productVariants.productId, id),
                }),
            ]);

            return {
                ...updatedProduct,
                options: updatedOptions,
                variants: updatedVariants,
            };
        });

        return data;
    }

    async stock(
        values: {
            productId: string;
            variantId?: string;
            stock: number;
        }[]
    ) {
        const data = await db.transaction(async (tx) => {
            const updated = await Promise.all(
                values.map(async (item) => {
                    if (item.variantId) {
                        const res = await tx
                            .update(productVariants)
                            .set({
                                quantity: item.stock,
                                updatedAt: new Date(),
                            })
                            .where(
                                and(
                                    eq(
                                        productVariants.productId,
                                        item.productId
                                    ),
                                    eq(productVariants.id, item.variantId)
                                )
                            )
                            .returning();
                        return res[0];
                    }

                    const res = await tx
                        .update(products)
                        .set({
                            quantity: item.stock,
                            updatedAt: new Date(),
                        })
                        .where(eq(products.id, item.productId))
                        .returning();
                    return res[0];
                })
            );

            return updated;
        });

        return data;
    }

    async delete(id: string) {
        const data = await db
            .update(products)
            .set({
                isDeleted: true,
                isActive: false,
                isPublished: false,
                isAvailable: false,
                deletedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(products.id, id))
            .returning()
            .then((res) => res[0]);

        return data;
    }
}

export const productQueries = new ProductQuery();

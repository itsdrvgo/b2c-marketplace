import { env } from "@/../env";
import {
    DEFAULT_PRODUCT_PAGINATION_LIMIT,
    DEFAULT_PRODUCT_PAGINATION_PAGE,
    ERROR_MESSAGES,
} from "@/config/const";
import { queries } from "@/lib/db/queries";
import { cache } from "@/lib/redis/methods";
import {
    AppError,
    CResponse,
    generateProductSlug,
    generateSKU,
    handleError,
} from "@/lib/utils";
import { createProductSchema, Product } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const limit = searchParams.get("limit")
            ? parseInt(searchParams.get("limit") as string)
            : DEFAULT_PRODUCT_PAGINATION_LIMIT;
        const page = searchParams.get("page")
            ? parseInt(searchParams.get("page") as string)
            : DEFAULT_PRODUCT_PAGINATION_PAGE;
        const search = searchParams.get("search") || undefined;
        const minPrice = searchParams.get("minPrice")
            ? parseInt(searchParams.get("minPrice") as string)
            : undefined;
        const maxPrice = searchParams.get("maxPrice")
            ? parseInt(searchParams.get("maxPrice") as string)
            : undefined;
        const categoryId = searchParams.get("categoryId") || undefined;
        const subcategoryId = searchParams.get("subcategoryId") || undefined;
        const productTypeId = searchParams.get("productTypeId") || undefined;
        const isActive = searchParams.get("isActive")
            ? searchParams.get("isActive") === "true"
            : undefined;
        const isAvailable = searchParams.get("isAvailable")
            ? searchParams.get("isAvailable") === "true"
            : undefined;
        const isPublished = searchParams.get("isPublished")
            ? searchParams.get("isPublished") === "true"
            : undefined;
        const isDeleted = searchParams.get("isDeleted")
            ? searchParams.get("isDeleted") === "true"
            : undefined;
        const verificationStatus = searchParams.get("verificationStatus")
            ? (searchParams.get(
                  "verificationStatus"
              ) as Product["verificationStatus"])
            : undefined;
        const sortBy = searchParams.get("sortBy")
            ? (searchParams.get("sortBy") as "price" | "createdAt")
            : undefined;
        const sortOrder = searchParams.get("sortOrder")
            ? (searchParams.get("sortOrder") as "asc" | "desc")
            : undefined;

        const data = await queries.product.paginate({
            limit,
            page,
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
            sortBy,
            sortOrder,
        });

        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}

export async function POST(req: NextRequest) {
    try {
        if (env.IS_API_AUTHENTICATED) {
            const { userId } = await auth();
            if (!userId)
                throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, "UNAUTHORIZED");

            const user = await cache.user.get(userId);
            if (!user || user.role === "user")
                throw new AppError(ERROR_MESSAGES.FORBIDDEN, "FORBIDDEN");
        }

        const body = await req.json();
        const parsed = createProductSchema.array().parse(body);

        const categoryIds = [...new Set(parsed.map((p) => p.categoryId))];
        const subcategoryIds = [...new Set(parsed.map((p) => p.subcategoryId))];
        const productTypeIds = [...new Set(parsed.map((p) => p.productTypeId))];

        const [allCategories, allSubcategories, allProductTypes] =
            await Promise.all([
                cache.category.scan(),
                cache.subcategory.scan(),
                cache.productType.scan(),
            ]);

        const categoryMap = new Map(
            allCategories
                .filter((c) => categoryIds.includes(c.id))
                .map((c) => [c.id, c])
        );
        const subcategoryMap = new Map(
            allSubcategories
                .filter((s) => subcategoryIds.includes(s.id))
                .map((s) => [s.id, s])
        );
        const productTypeMap = new Map(
            allProductTypes
                .filter((pt) => productTypeIds.includes(pt.id))
                .map((pt) => [pt.id, pt])
        );

        const productsWithSkus = parsed.map((product) => {
            const category = categoryMap.get(product.categoryId);
            const subcategory = subcategoryMap.get(product.subcategoryId);
            const productType = productTypeMap.get(product.productTypeId);

            if (!category || !subcategory || !productType)
                throw new AppError(
                    "Invalid category, subcategory, or product type",
                    "BAD_REQUEST"
                );

            if (!product.productHasVariants) {
                product.nativeSku = generateSKU({
                    category: category.name,
                    subcategory: subcategory.name,
                    productType: productType.name,
                });
            } else {
                product.nativeSku = generateSKU({
                    category: category.name,
                    subcategory: subcategory.name,
                    productType: productType.name,
                });

                if (product.variants && product.variants.length > 0) {
                    for (const variant of product.variants) {
                        const optionCombinations = Object.entries(
                            variant.combinations
                        ).map(([optionId, valueId]) => {
                            const option = product.options.find(
                                (opt) => opt.id === optionId
                            );
                            const value = option?.values.find(
                                (val) => val.id === valueId
                            );
                            return {
                                name: option?.name ?? "",
                                value: value?.name ?? "",
                            };
                        });

                        variant.nativeSku = generateSKU({
                            category: category.name,
                            subcategory: subcategory.name,
                            productType: productType.name,
                            options: optionCombinations,
                        });
                    }
                }
            }

            return {
                ...product,
                slug: generateProductSlug(product.title),
            };
        });

        const data = await queries.product.batch(productsWithSkus);

        return CResponse({ message: "CREATED", data });
    } catch (err) {
        return handleError(err);
    }
}

import { env } from "@/../env";
import { ERROR_MESSAGES } from "@/config/const";
import { queries } from "@/lib/db/queries";
import { cache } from "@/lib/redis/methods";
import { AppError, CResponse, generateSKU, handleError } from "@/lib/utils";
import { Product, updateProductSchema } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

interface RouteProps {
    params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
    try {
        const { id } = await params;

        const { searchParams } = new URL(req.url);

        const isDeleted = searchParams.get("isDeleted")
            ? searchParams.get("isDeleted") === "true"
            : undefined;
        const isAvailable = searchParams.get("isAvailable")
            ? searchParams.get("isAvailable") === "true"
            : undefined;
        const isPublished = searchParams.get("isPublished")
            ? searchParams.get("isPublished") === "true"
            : undefined;
        const isActive = searchParams.get("isActive")
            ? searchParams.get("isActive") === "true"
            : undefined;
        const verificationStatus = searchParams.get("verificationStatus")
            ? (searchParams.get(
                  "verificationStatus"
              ) as Product["verificationStatus"])
            : undefined;

        const data = await queries.product.get({
            id,
            isDeleted,
            isAvailable,
            isPublished,
            isActive,
            verificationStatus,
        });
        if (!data) throw new AppError(ERROR_MESSAGES.NOT_FOUND, "NOT_FOUND");

        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
    try {
        if (env.IS_API_AUTHENTICATED) {
            const { userId } = await auth();
            if (!userId)
                throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, "UNAUTHORIZED");

            const user = await cache.user.get(userId);
            if (!user || user.role === "user")
                throw new AppError(ERROR_MESSAGES.FORBIDDEN, "FORBIDDEN");
        }

        const { id } = await params;

        const body = await req.json();
        const parsed = updateProductSchema.parse(body);

        const existingData = await queries.product.get({
            id,
            isDeleted: false,
        });
        if (!existingData)
            throw new AppError(ERROR_MESSAGES.NOT_FOUND, "NOT_FOUND");

        const [existingCategory, existingSubcategory, existingProductType] =
            await Promise.all([
                cache.category.get(
                    parsed.categoryId ?? existingData.categoryId
                ),
                cache.subcategory.get(
                    parsed.subcategoryId ?? existingData.subcategoryId
                ),
                cache.productType.get(
                    parsed.productTypeId ?? existingData.productTypeId
                ),
            ]);

        if (!existingCategory)
            throw new AppError(
                "The specified category does not exist or is invalid.",
                "BAD_REQUEST"
            );
        if (!existingSubcategory)
            throw new AppError(
                "The specified subcategory does not exist or is invalid.",
                "BAD_REQUEST"
            );
        if (!existingProductType)
            throw new AppError(
                "The specified product type does not exist or is invalid.",
                "BAD_REQUEST"
            );

        if (
            existingData.isActive &&
            existingData.media.length === 0 &&
            parsed.media?.length === 0
        )
            throw new AppError(
                "At least one media item is required for active products.",
                "BAD_REQUEST"
            );

        if (parsed.productHasVariants) {
            if (!parsed.variants || parsed.variants.length === 0)
                throw new AppError(
                    "Product variants are required",
                    "BAD_REQUEST"
                );

            const existingVariants = existingData.variants;
            const newlyAddedVariants = parsed.variants.filter(
                (variant) => !existingVariants.some((v) => v.id === variant.id)
            );

            for (const variant of newlyAddedVariants) {
                const optionCombinations = Object.entries(
                    variant.combinations
                ).map(([optionId, valueId]) => {
                    const option = parsed.options?.find(
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
                    category: existingCategory.name,
                    subcategory: existingSubcategory.name,
                    productType: existingProductType.name,
                    options: optionCombinations,
                });
            }
        }

        const data = await queries.product.update(id, parsed);
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
    try {
        const { id } = await params;

        const existingData = await queries.product.get({
            id,
            isDeleted: false,
        });
        if (!existingData)
            throw new AppError(ERROR_MESSAGES.NOT_FOUND, "NOT_FOUND");

        await Promise.all([queries.product.delete(id), cache.wishlist.drop()]);
        return CResponse();
    } catch (err) {
        return handleError(err);
    }
}

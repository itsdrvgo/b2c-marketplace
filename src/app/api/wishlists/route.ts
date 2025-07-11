import { ERROR_MESSAGES } from "@/config/const";
import { queries } from "@/lib/db/queries";
import { cache } from "@/lib/redis/methods";
import { AppError, CResponse, handleError } from "@/lib/utils";
import { createWishlistSchema } from "@/lib/validations";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { z } from "zod";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId)
            throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, "UNAUTHORIZED");

        const { searchParams } = new URL(req.url);

        const uId = searchParams.get("userId");
        if (!uId) throw new AppError("User ID is required", "BAD_REQUEST");

        if (uId !== userId)
            throw new AppError(ERROR_MESSAGES.FORBIDDEN, "FORBIDDEN");

        const data = await cache.wishlist.scan(uId);
        return CResponse({ data });
    } catch (err) {
        return handleError(err);
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId)
            throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, "UNAUTHORIZED");

        const body = await req.json();
        const parsed = createWishlistSchema.parse(body);

        if (parsed.userId !== userId)
            throw new AppError(ERROR_MESSAGES.FORBIDDEN, "FORBIDDEN");

        const [existingWishlist, existingProduct] = await Promise.all([
            cache.wishlist.get({
                userId,
                productId: parsed.productId,
            }),
            queries.product.get({
                id: parsed.productId,
                verificationStatus: "approved",
                isPublished: true,
                isActive: true,
                isAvailable: true,
                isDeleted: false,
            }),
        ]);
        if (existingWishlist)
            throw new AppError(
                ERROR_MESSAGES.PRODUCT_ALREADY_IN_WISHLIST,
                "CONFLICT"
            );
        if (!existingProduct)
            throw new AppError(ERROR_MESSAGES.PRODUCT_NOT_FOUND, "NOT_FOUND");

        const data = await queries.wishlist.create(parsed);
        return CResponse({ message: "CREATED", data });
    } catch (err) {
        return handleError(err);
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId)
            throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, "UNAUTHORIZED");

        const { searchParams } = new URL(req.url);

        const uId = searchParams.get("userId");
        const productId = searchParams.get("productId");

        if (!uId || !productId)
            throw new AppError(
                "User ID and Product ID are required",
                "BAD_REQUEST"
            );

        if (uId !== userId)
            throw new AppError(ERROR_MESSAGES.FORBIDDEN, "FORBIDDEN");

        const existingData = await cache.wishlist.get({
            userId,
            productId,
        });
        if (!existingData)
            throw new AppError(ERROR_MESSAGES.NOT_FOUND, "NOT_FOUND");

        await Promise.all([
            queries.wishlist.delete(existingData.id),
            cache.wishlist.remove({ userId, productId }),
        ]);

        return CResponse();
    } catch (err) {
        return handleError(err);
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId)
            throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, "UNAUTHORIZED");

        const body = await req.json();
        const parsed = z
            .object({
                userId: z.string(),
                productId: z.string().uuid(),
                variantId: z.string().uuid().nullable().optional(),
                quantity: z.number().int().positive().default(1),
                action: z.literal("moveToCart"),
            })
            .parse(body);

        if (parsed.userId !== userId)
            throw new AppError(ERROR_MESSAGES.FORBIDDEN, "FORBIDDEN");

        // Check if product exists in wishlist
        const existingWishlist = await cache.wishlist.get({
            userId,
            productId: parsed.productId,
        });
        if (!existingWishlist)
            throw new AppError("Product not found in wishlist", "NOT_FOUND");

        // Validate product is still available
        if (
            !existingWishlist.product.isAvailable ||
            !existingWishlist.product.isActive ||
            existingWishlist.product.isDeleted ||
            existingWishlist.product.verificationStatus !== "approved" ||
            !existingWishlist.product.isPublished
        )
            throw new AppError("This product is not available", "BAD_REQUEST");

        // Validate variant if provided
        if (parsed.variantId) {
            const variant = existingWishlist.product.variants.find(
                (v) => v.id === parsed.variantId
            );
            if (!variant || variant.isDeleted)
                throw new AppError("Product variant not found", "NOT_FOUND");

            if (variant.quantity < parsed.quantity)
                throw new AppError("Not enough stock available", "BAD_REQUEST");
        } else if ((existingWishlist.product.quantity ?? 0) < parsed.quantity) {
            throw new AppError("Not enough stock available", "BAD_REQUEST");
        }

        // Check if product already exists in cart
        const existingCart = await cache.cart.get({
            userId,
            productId: parsed.productId,
            variantId: parsed.variantId || undefined,
        });

        // Perform the move operation
        if (!existingCart) {
            // Create new cart item
            await Promise.all([
                queries.cart.create({
                    userId,
                    productId: parsed.productId,
                    variantId: parsed.variantId || null,
                    quantity: parsed.quantity,
                }),
                queries.wishlist.delete(existingWishlist.id),
                cache.wishlist.remove({ userId, productId: parsed.productId }),
            ]);
        } else {
            // Update existing cart item quantity
            await Promise.all([
                queries.cart.update({
                    id: existingCart.id,
                    values: {
                        userId,
                        productId: parsed.productId,
                        variantId: parsed.variantId || null,
                        quantity: existingCart.quantity + parsed.quantity,
                    },
                }),
                queries.wishlist.delete(existingWishlist.id),
                cache.cart.remove({
                    userId,
                    productId: parsed.productId,
                    variantId: parsed.variantId || undefined,
                }),
                cache.wishlist.remove({ userId, productId: parsed.productId }),
            ]);
        }

        return CResponse({
            message: "OK",
            data: { moved: "toCart" },
        });
    } catch (err) {
        return handleError(err);
    }
}

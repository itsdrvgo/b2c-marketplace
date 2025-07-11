import { ERROR_MESSAGES } from "@/config/const";
import { db } from "@/lib/db";
import { queries } from "@/lib/db/queries";
import { cache } from "@/lib/redis/methods";
import { AppError, CResponse, handleError } from "@/lib/utils";
import { createCartSchema, updateCartSchema } from "@/lib/validations";
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

        const data = await cache.cart.scan(uId);
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
        const parsed = createCartSchema.parse(body);

        if (parsed.userId !== userId)
            throw new AppError(ERROR_MESSAGES.FORBIDDEN, "FORBIDDEN");

        if (parsed.variantId) {
            const existingVariant = await db.query.productVariants.findFirst({
                where: (f, o) =>
                    o.and(
                        parsed.variantId
                            ? o.eq(f.id, parsed.variantId)
                            : undefined,
                        o.eq(f.productId, parsed.productId),
                        o.gte(f.quantity, parsed.quantity),
                        o.eq(f.isDeleted, false)
                    ),
                with: {
                    product: true,
                },
            });
            if (!existingVariant)
                throw new AppError(
                    "The product variant was not found",
                    "NOT_FOUND"
                );

            if (
                !existingVariant.product.isAvailable ||
                !existingVariant.product.isActive ||
                existingVariant.product.isDeleted ||
                existingVariant.product.verificationStatus !== "approved" ||
                !existingVariant.product.isPublished
            )
                throw new AppError(
                    "The product variant is not available",
                    "FORBIDDEN"
                );

            const existingCart = await cache.cart.get({
                userId,
                productId: parsed.productId,
                variantId: parsed.variantId,
            });

            if (!existingCart) await queries.cart.create(parsed);
            else {
                await Promise.all([
                    queries.cart.update({
                        id: existingCart.id,
                        values: {
                            ...parsed,
                            quantity: existingCart.quantity + parsed.quantity,
                            status: true,
                        },
                    }),
                    cache.cart.remove({
                        userId,
                        productId: parsed.productId,
                        variantId: parsed.variantId,
                    }),
                ]);
            }

            return CResponse({
                message: existingCart ? "OK" : "CREATED",
                data: existingCart ? "updated" : "created",
            });
        } else {
            const existingProduct = await queries.product.get({
                id: parsed.productId,
                isAvailable: true,
                isActive: true,
                isDeleted: false,
                verificationStatus: "approved",
                isPublished: true,
            });
            if (!existingProduct)
                throw new AppError(
                    ERROR_MESSAGES.PRODUCT_NOT_FOUND,
                    "NOT_FOUND"
                );

            if (existingProduct.quantity! <= parsed.quantity)
                throw new AppError(
                    "The product is not available in the requested quantity",
                    "FORBIDDEN"
                );

            const existingCart = await cache.cart.get({
                userId,
                productId: parsed.productId,
                variantId: parsed.variantId || undefined,
            });

            if (!existingCart) await queries.cart.create(parsed);
            else {
                await Promise.all([
                    queries.cart.update({
                        id: existingCart.id,
                        values: {
                            ...parsed,
                            quantity: existingCart.quantity + parsed.quantity,
                            status: true,
                        },
                    }),
                    cache.cart.remove({
                        userId,
                        productId: parsed.productId,
                        variantId: parsed.variantId || undefined,
                    }),
                ]);
            }

            return CResponse({
                message: existingCart ? "OK" : "CREATED",
                data: existingCart ? "updated" : "created",
            });
        }
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

        // Check if this is a move to wishlist action
        if (body.action === "moveToWishlist") {
            const moveSchema = z.object({
                userId: z.string(),
                productId: z.string().uuid(),
                variantId: z.string().uuid().nullable().optional(),
                action: z.literal("moveToWishlist"),
            });

            const parsed = moveSchema.parse(body);

            if (parsed.userId !== userId)
                throw new AppError(ERROR_MESSAGES.FORBIDDEN, "FORBIDDEN");

            // Check if product exists in cart
            const existingCart = await cache.cart.get({
                userId,
                productId: parsed.productId,
                variantId: parsed.variantId || undefined,
            });
            if (!existingCart)
                throw new AppError("Cart item not found", "NOT_FOUND");

            // Validate product is still available
            if (
                !existingCart.product.isAvailable ||
                !existingCart.product.isActive ||
                existingCart.product.isDeleted ||
                existingCart.product.verificationStatus !== "approved" ||
                !existingCart.product.isPublished
            )
                throw new AppError(
                    "This product is not available",
                    "BAD_REQUEST"
                );

            // Check if product already exists in wishlist
            const existingWishlist = await cache.wishlist.get({
                userId,
                productId: parsed.productId,
            });

            if (existingWishlist)
                throw new AppError(
                    ERROR_MESSAGES.PRODUCT_ALREADY_IN_WISHLIST,
                    "CONFLICT"
                );

            // Perform the move operation
            await Promise.all([
                queries.wishlist.create({
                    userId,
                    productId: parsed.productId,
                }),
                queries.cart.delete({
                    userId,
                    ids: [existingCart.id],
                }),
                cache.cart.remove({
                    userId,
                    productId: parsed.productId,
                    variantId: parsed.variantId || undefined,
                }),
            ]);

            return CResponse({
                message: "OK",
                data: { moved: "toWishlist" },
            });
        }

        const parsed = updateCartSchema.parse(body);

        if (parsed.userId !== userId)
            throw new AppError(ERROR_MESSAGES.FORBIDDEN, "FORBIDDEN");

        if (parsed.productId) {
            const existingCart = await cache.cart.get({
                userId,
                productId: parsed.productId,
                variantId: parsed.variantId || undefined,
            });
            if (!existingCart)
                throw new AppError("Cart item not found", "NOT_FOUND");

            if (
                !existingCart.product.isAvailable ||
                !existingCart.product.isActive ||
                existingCart.product.isDeleted ||
                existingCart.product.verificationStatus !== "approved" ||
                !existingCart.product.isPublished ||
                existingCart.variant?.isDeleted
            )
                throw new AppError(
                    "This product is not available",
                    "BAD_REQUEST"
                );

            if (parsed.quantity !== undefined) {
                if (parsed.quantity === existingCart.quantity)
                    throw new AppError("No changes detected", "BAD_REQUEST");

                if (parsed.variantId && existingCart.variant) {
                    if (existingCart.variant.quantity < parsed.quantity)
                        throw new AppError(
                            "Not enough stock available",
                            "BAD_REQUEST"
                        );
                } else if (
                    (existingCart.product.quantity ?? 0) < parsed.quantity
                )
                    throw new AppError(
                        "Not enough stock available",
                        "BAD_REQUEST"
                    );
            }

            const updateValues = {
                userId: parsed.userId,
                productId: parsed.productId,
                variantId: parsed.variantId,
                ...(parsed.quantity !== undefined && {
                    quantity: parsed.quantity,
                }),
                ...(parsed.status !== undefined && { status: parsed.status }),
            };

            const [data] = await Promise.all([
                queries.cart.update({
                    id: existingCart.id,
                    values: updateValues,
                }),
                cache.cart.remove({
                    userId,
                    productId: parsed.productId,
                    variantId: parsed.variantId || undefined,
                }),
            ]);

            return CResponse({
                message: "OK",
                data,
            });
        }

        if (parsed.status !== undefined && !parsed.productId) {
            const existingCarts = await cache.cart.scan(userId);
            if (existingCarts.length === 0)
                throw new AppError("No cart items found", "NOT_FOUND");

            const cartIds = existingCarts.map((cart) => cart.id);
            const [data] = await Promise.all([
                queries.cart.update({
                    ids: cartIds,
                    status: parsed.status,
                }),
                cache.cart.drop(userId),
            ]);

            return CResponse({
                message: "OK",
                data,
            });
        }

        throw new AppError(
            "No valid update operation specified",
            "BAD_REQUEST"
        );
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
        const ids = searchParams.getAll("ids");

        if (!uId || !ids.length)
            throw new AppError(
                "User ID and Item IDs are required",
                "BAD_REQUEST"
            );

        if (uId !== userId)
            throw new AppError(ERROR_MESSAGES.FORBIDDEN, "FORBIDDEN");

        const existingCart = await cache.cart.scan(uId);
        if (existingCart.length === 0)
            throw new AppError(ERROR_MESSAGES.NOT_FOUND, "NOT_FOUND");

        const itemsToDelete = existingCart.filter((item) =>
            ids.includes(item.id)
        );
        if (itemsToDelete.length === 0)
            throw new AppError("No matching items found", "NOT_FOUND");

        await Promise.all([
            queries.cart.delete({
                userId: uId,
                ids: itemsToDelete.map((item) => item.id),
            }),
            cache.cart.drop(uId),
        ]);

        return CResponse();
    } catch (err) {
        return handleError(err);
    }
}

import { z } from "zod";
import { convertEmptyStringToNull } from "../utils";
import { generateDateSchema, generateIdSchema, idSchema } from "./general";
import {
    enhancedProductVariantSchema,
    fullProductSchema,
    productVariantSchema,
} from "./product";

export const cartSchema = z.object({
    id: idSchema,
    userId: generateIdSchema({
        required_error: "User ID is required",
        invalid_type_error: "User ID must be a string",
    }),
    productId: generateIdSchema({
        required_error: "Product ID is required",
        invalid_type_error: "Product ID must be a string",
    }),
    variantId: z.preprocess(
        convertEmptyStringToNull,
        z
            .string({
                invalid_type_error: "Variant ID must be a string",
            })
            .uuid("Variant ID is invalid")
            .nullable()
    ),
    quantity: z
        .number({
            required_error: "Quantity is required",
            invalid_type_error: "Quantity must be a number",
        })
        .int("Quantity must be an integer")
        .positive("Quantity must be positive"),
    status: z.boolean({
        required_error: "Status is required",
        invalid_type_error: "Status must be a boolean",
    }),
    createdAt: generateDateSchema({
        required_error: "Created at is required",
        invalid_type_error: "Created at must be a date",
    }),
    updatedAt: generateDateSchema({
        required_error: "Updated at is required",
        invalid_type_error: "Updated at must be a date",
    }),
});

export const createCartSchema = cartSchema.pick({
    userId: true,
    productId: true,
    variantId: true,
    quantity: true,
});

export const updateCartSchema = createCartSchema
    .extend({
        status: z.boolean({
            required_error: "Status is required",
            invalid_type_error: "Status must be a boolean",
        }),
    })
    .partial({
        quantity: true,
        status: true,
    });

export const cartWithProductSchema = cartSchema.extend({
    product: fullProductSchema,
});

export const cachedCartSchema = cartSchema.extend({
    product: fullProductSchema
        .pick({
            categoryId: true,
            subcategoryId: true,
            productTypeId: true,
            compareAtPrice: true,
            price: true,
            title: true,
            slug: true,
            id: true,
            media: true,
            variants: true,
            options: true,
            sku: true,
            nativeSku: true,
            quantity: true,
            isActive: true,
            isPublished: true,
            isAvailable: true,
            verificationStatus: true,
            isDeleted: true,
        })
        .extend({
            variants: enhancedProductVariantSchema
                .pick({
                    id: true,
                    sku: true,
                    nativeSku: true,
                    price: true,
                    compareAtPrice: true,
                    quantity: true,
                    image: true,
                    mediaItem: true,
                    productId: true,
                    isDeleted: true,
                    combinations: true,
                })
                .array(),
        }),
    variant: productVariantSchema
        .pick({
            id: true,
            sku: true,
            nativeSku: true,
            isDeleted: true,
            quantity: true,
        })
        .nullable(),
});

export type Cart = z.infer<typeof cartSchema>;
export type CreateCart = z.infer<typeof createCartSchema>;
export type UpdateCart = z.infer<typeof updateCartSchema>;
export type CartWithProduct = z.infer<typeof cartWithProductSchema>;
export type CachedCart = z.infer<typeof cachedCartSchema>;

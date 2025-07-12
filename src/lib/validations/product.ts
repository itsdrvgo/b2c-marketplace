import { PRODUCT_VERIFICATION_STATUSES } from "@/config/const";
import { z } from "zod";
import { convertEmptyStringToNull } from "../utils";
import {
    categorySchema,
    productTypeSchema,
    subcategorySchema,
} from "./category";
import {
    generateDateSchema,
    generateIdSchema,
    idSchema,
    priceSchema,
} from "./general";
import { cachedMediaItemSchema } from "./media-item";
import { userSchema } from "./user";

export const productOptionValueSchema = z.object({
    id: idSchema,
    name: z
        .string({
            required_error: "Name is required",
            invalid_type_error: "Name must be a string",
        })
        .min(1, "Name must be at least 1 characters long"),
    position: z
        .number({
            required_error: "Position is required",
            invalid_type_error: "Position must be a number",
        })
        .int("Position must be an integer")
        .nonnegative("Position must be a non-negative number"),
});

export const productMediaSchema = z.object({
    id: idSchema,
    position: z
        .number({
            required_error: "Position is required",
            invalid_type_error: "Position must be a number",
        })
        .int("Position must be an integer")
        .nonnegative("Position must be a non-negative number"),
});

export const enhancedProductMediaSchema = productMediaSchema.extend({
    mediaItem: cachedMediaItemSchema.nullable(),
});

export const productSchema = z.object({
    // BASIC INFO
    id: idSchema,
    title: z
        .string({
            required_error: "Title is required",
            invalid_type_error: "Title must be a string",
        })
        .min(3, "Title must be at least 3 characters long"),
    slug: z
        .string({
            required_error: "Slug is required",
            invalid_type_error: "Slug must be a string",
        })
        .min(3, "Slug must be at least 3 characters long"),
    description: z.preprocess(
        convertEmptyStringToNull,
        z
            .string({
                invalid_type_error: "Description must be a string",
            })
            .min(3, "Description must be at least 3 characters long")
            .nullable()
    ),
    uploaderId: userSchema.shape.id,
    isAvailable: z.boolean({
        required_error: "Availability is required",
        invalid_type_error: "Availability must be a boolean",
    }),
    isActive: z.boolean({
        required_error: "Active status is required",
        invalid_type_error: "Active status must be a boolean",
    }),
    isPublished: z.boolean({
        required_error: "Published status is required",
        invalid_type_error: "Published status must be a boolean",
    }),
    publishedAt: generateDateSchema({
        required_error: "Published at is required",
        invalid_type_error: "Published at must be a date",
    }).nullable(),
    media: productMediaSchema.array().default([]),
    productHasVariants: z.boolean({
        required_error: "Product has variants status is required",
        invalid_type_error: "Product has variants status must be a boolean",
    }),

    // CATEGORY
    categoryId: z
        .string({
            required_error: "Category ID is required",
            invalid_type_error: "Category ID must be a string",
        })
        .uuid("Category ID is invalid"),
    subcategoryId: z
        .string({
            required_error: "Subcategory ID is required",
            invalid_type_error: "Subcategory ID must be a string",
        })
        .uuid("Subcategory ID is invalid"),
    productTypeId: z
        .string({
            required_error: "Product Type ID is required",
            invalid_type_error: "Product Type ID must be a string",
        })
        .uuid("Product Type ID is invalid"),

    // PRICING
    price: priceSchema.nullable(),
    compareAtPrice: priceSchema.nullable(),
    costPerItem: priceSchema.nullable(),

    // INVENTORY
    nativeSku: z.preprocess(
        convertEmptyStringToNull,
        z
            .string({
                invalid_type_error: "Native SKU must be a string",
            })
            .min(3, "Native SKU must be at least 3 characters long")
            .nullable()
    ),
    sku: z.preprocess(
        convertEmptyStringToNull,
        z
            .string({
                required_error: "SKU is required",
                invalid_type_error: "SKU must be a string",
            })
            .min(3, "SKU must be at least 3 characters long")
            .nullable()
    ),
    barcode: z.preprocess(
        convertEmptyStringToNull,
        z
            .string({
                invalid_type_error: "Barcode must be a string",
            })
            .min(3, "Barcode must be at least 3 characters long")
            .nullable()
    ),
    quantity: z
        .union([z.string(), z.number()])
        .transform((val) => Number(val))
        .pipe(
            z
                .number()
                .int()
                .nonnegative("Quantity must be a non-negative number")
        )
        .nullable(),

    // SHIPPING
    weight: z
        .union([z.string(), z.number()])
        .transform((val) => Number(val))
        .pipe(
            z.number().int().nonnegative("Weight must be a non-negative number")
        )
        .nullable(),
    length: z
        .union([z.string(), z.number()])
        .transform((val) => Number(val))
        .pipe(
            z.number().int().nonnegative("Length must be a non-negative number")
        )
        .nullable(),
    width: z
        .union([z.string(), z.number()])
        .transform((val) => Number(val))
        .pipe(
            z.number().int().nonnegative("Width must be a non-negative number")
        )
        .nullable(),
    height: z
        .union([z.string(), z.number()])
        .transform((val) => Number(val))
        .pipe(
            z.number().int().nonnegative("Height must be a non-negative number")
        )
        .nullable(),
    originCountry: z.preprocess(
        convertEmptyStringToNull,
        z
            .string({
                invalid_type_error: "Origin country must be a string",
            })
            .min(1, "Origin country must be at least 1 characters long")
            .nullable()
    ),
    hsCode: z.preprocess(
        convertEmptyStringToNull,
        z
            .string({
                invalid_type_error: "HS code must be a string",
            })
            .min(1, "HS code must be at least 1 characters long")
            .nullable()
    ),

    // SEO
    metaTitle: z.preprocess(
        convertEmptyStringToNull,
        z
            .string({
                invalid_type_error: "Meta title must be a string",
            })
            .min(3, "Meta title must be at least 3 characters long")
            .max(70, "Meta title must be at most 70 characters long")
            .nullable()
    ),
    metaDescription: z.preprocess(
        convertEmptyStringToNull,
        z
            .string({
                invalid_type_error: "Meta description must be a string",
            })
            .min(3, "Meta description must be at least 3 characters long")
            .max(160, "Meta description must be at most 160 characters long")
            .nullable()
    ),
    metaKeywords: z
        .array(
            z
                .string({
                    required_error: "Meta keyword is required",
                    invalid_type_error: "Meta keyword must be a string",
                })
                .min(1, "Meta keyword must be at least 1 characters long")
        )
        .default([]),

    // OTHER
    verificationStatus: z.enum(PRODUCT_VERIFICATION_STATUSES),
    isDeleted: z.boolean({
        required_error: "Deleted status is required",
        invalid_type_error: "Deleted status must be a boolean",
    }),
    deletedAt: generateDateSchema({
        required_error: "Deleted at is required",
        invalid_type_error: "Deleted at must be a date",
    }).nullable(),
    rejectedAt: generateDateSchema({
        required_error: "Rejected at is required",
        invalid_type_error: "Rejected at must be a date",
    }).nullable(),
    rejectionReason: z.preprocess(
        convertEmptyStringToNull,
        z
            .string({
                invalid_type_error: "Rejection reason must be a string",
            })
            .nullable()
    ),
    lastReviewedAt: generateDateSchema({
        required_error: "Last reviewed at is required",
        invalid_type_error: "Last reviewed at must be a date",
    }).nullable(),
    createdAt: generateDateSchema({
        required_error: "Created at is required",
        invalid_type_error: "Created at must be a date",
    }),
    updatedAt: generateDateSchema({
        required_error: "Updated at is required",
        invalid_type_error: "Updated at must be a date",
    }),
});

export const productOptionSchema = z.object({
    id: z
        .string({
            required_error: "ID is required",
            invalid_type_error: "ID must be a string",
        })
        .uuid("ID is invalid"),
    productId: z
        .string({
            required_error: "Product ID is required",
            invalid_type_error: "Product ID must be a string",
        })
        .uuid("Product ID is invalid"),
    name: z
        .string({
            required_error: "Name is required",
            invalid_type_error: "Name must be a string",
        })
        .min(1, "Name must be at least 1 characters long"),
    values: z.array(productOptionValueSchema),
    position: z
        .number({
            required_error: "Position is required",
            invalid_type_error: "Position must be a number",
        })
        .int("Position must be an integer")
        .nonnegative("Position must be a non-negative number"),
    isDeleted: z.boolean({
        required_error: "Deleted status is required",
        invalid_type_error: "Deleted status must be a boolean",
    }),
    deletedAt: generateDateSchema({
        required_error: "Deleted at is required",
        invalid_type_error: "Deleted at must be a date",
    }).nullable(),
    createdAt: generateDateSchema({
        required_error: "Created at is required",
        invalid_type_error: "Created at must be a date",
    }),
    updatedAt: generateDateSchema({
        required_error: "Updated at is required",
        invalid_type_error: "Updated at must be a date",
    }),
});

export const productVariantSchema = z.object({
    // BASIC INFO
    id: idSchema,
    productId: generateIdSchema({
        invalid_type_error: "Product ID must be a string",
        required_error: "Product ID is required",
    }),
    image: z.preprocess(
        convertEmptyStringToNull,
        z
            .string({
                invalid_type_error: "Image must be a string",
            })
            .uuid("Image is invalid")
            .nullable()
    ),
    combinations: z.record(z.string(), z.string()),

    // PRICING
    price: priceSchema,
    compareAtPrice: priceSchema.nullable(),
    costPerItem: priceSchema.nullable(),

    // INVENTORY
    nativeSku: z
        .string({
            required_error: "Native SKU is required",
            invalid_type_error: "Native SKU must be a string",
        })
        .min(3, "Native SKU must be at least 3 characters long"),
    sku: z.preprocess(
        convertEmptyStringToNull,
        z
            .string({
                invalid_type_error: "SKU must be a string",
            })
            .min(3, "SKU must be at least 3 characters long")
            .nullable()
    ),
    barcode: z.preprocess(
        convertEmptyStringToNull,
        z
            .string({
                invalid_type_error: "Barcode must be a string",
            })
            .min(3, "Barcode must be at least 3 characters long")
            .nullable()
    ),
    quantity: z
        .union([z.string(), z.number()])
        .transform((val) => Number(val))
        .pipe(
            z
                .number()
                .int()
                .nonnegative("Quantity must be a non-negative number")
        ),

    // SHIPPING
    weight: z
        .union([z.string(), z.number()])
        .transform((val) => Number(val))
        .pipe(
            z.number().int().nonnegative("Weight must be a non-negative number")
        ),
    length: z
        .union([z.string(), z.number()])
        .transform((val) => Number(val))
        .pipe(
            z.number().int().nonnegative("Length must be a non-negative number")
        ),
    width: z
        .union([z.string(), z.number()])
        .transform((val) => Number(val))
        .pipe(
            z.number().int().nonnegative("Width must be a non-negative number")
        ),
    height: z
        .union([z.string(), z.number()])
        .transform((val) => Number(val))
        .pipe(
            z.number().int().nonnegative("Height must be a non-negative number")
        ),
    originCountry: z.preprocess(
        convertEmptyStringToNull,
        z
            .string({
                invalid_type_error: "Origin country must be a string",
            })
            .min(1, "Origin country must be at least 1 characters long")
            .nullable()
    ),
    hsCode: z.preprocess(
        convertEmptyStringToNull,
        z
            .string({
                invalid_type_error: "HS code must be a string",
            })
            .min(1, "HS code must be at least 1 characters long")
            .nullable()
    ),
    isDeleted: z.boolean({
        required_error: "Deleted status is required",
        invalid_type_error: "Deleted status must be a boolean",
    }),
    deletedAt: generateDateSchema({
        required_error: "Deleted at is required",
        invalid_type_error: "Deleted at must be a date",
    }).nullable(),
    createdAt: generateDateSchema({
        required_error: "Created at is required",
        invalid_type_error: "Created at must be a date",
    }),
    updatedAt: generateDateSchema({
        required_error: "Updated at is required",
        invalid_type_error: "Updated at must be a date",
    }),
});

export const enhancedProductVariantSchema = productVariantSchema.extend({
    mediaItem: cachedMediaItemSchema.nullable(),
});

export const productVariantGroupSchema = z.object({
    key: z
        .string({
            required_error: "Key is required",
            invalid_type_error: "Key must be a string",
        })
        .min(1, "Key must be at least 1 characters long"),
    value: z
        .string({
            required_error: "Value is required",
            invalid_type_error: "Value must be a string",
        })
        .min(1, "Value must be at least 1 characters long"),
    variants: z.array(productVariantSchema),
    totalQuantity: z
        .union([z.string(), z.number()])
        .transform((val) => Number(val))
        .pipe(
            z
                .number()
                .int()
                .nonnegative("Total quantity must be a non-negative number")
        ),
});

export const fullProductSchema = productSchema.extend({
    uploader: z.lazy(() => userSchema),
    options: z.array(productOptionSchema),
    variants: z.array(enhancedProductVariantSchema),
    media: z.array(enhancedProductMediaSchema),
    category: categorySchema,
    subcategory: subcategorySchema,
    productType: productTypeSchema,
});

const createProductSchemaRaw = productSchema
    .omit({
        id: true,
        slug: true,
        deletedAt: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
    })
    .extend({
        options: z.array(productOptionSchema),
        variants: z.array(productVariantSchema),
    });

export const createProductSchema = createProductSchemaRaw.superRefine(
    (data, ctx) => {
        if (!data.productHasVariants) {
            if (
                data.price === null ||
                data.quantity === null ||
                data.weight === null ||
                data.length === null ||
                data.width === null ||
                data.height === null
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message:
                        "Product without variants must have price, quantity, and dimensions",
                    path: ["price"],
                });
                return false;
            }

            if (data.options.length > 0 || data.variants.length > 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message:
                        "Product without variants cannot have options or variants",
                    path: ["options"],
                });
                return false;
            }

            return true;
        }

        if (data.options.length === 0 || data.variants.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                    "Product with variants must have both options and variants defined",
                path: ["productHasVariants"],
            });
            return false;
        }

        const hasEmptyOptions = data.options.some(
            (option) => option.values.length === 0
        );
        if (hasEmptyOptions) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "All options must have at least one value",
                path: ["options"],
            });
            return false;
        }

        const optionIds = data.options.map((opt) => opt.id);

        for (const variant of data.variants) {
            const variantKeys = Object.keys(variant.combinations);

            if (variantKeys.length !== optionIds.length) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Each variant must specify all options",
                    path: ["variants"],
                });
                return false;
            }

            for (const key of variantKeys) {
                if (!optionIds.includes(key)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `Unknown option ID "${key}" in variant`,
                        path: ["variants"],
                    });
                    return false;
                }

                const option = data.options.find((opt) => opt.id === key);
                const isValidValue = option?.values.some(
                    (val) => val.id === variant.combinations[key]
                );

                if (!isValidValue) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `Invalid value for option "${option?.name}"`,
                        path: ["variants"],
                    });
                    return false;
                }
            }
        }

        return true;
    }
);

export const updateProductSchema = createProductSchemaRaw.partial();

export const rejectProductSchema = productSchema.pick({
    id: true,
    rejectionReason: true,
});

export type Product = z.infer<typeof productSchema>;
export type ProductOptionValue = z.infer<typeof productOptionValueSchema>;
export type ProductMedia = z.infer<typeof productMediaSchema>;
export type ProductOption = z.infer<typeof productOptionSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type ProductVariantGroup = z.infer<typeof productVariantGroupSchema>;
export type FullProduct = z.infer<typeof fullProductSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type RejectProduct = z.infer<typeof rejectProductSchema>;

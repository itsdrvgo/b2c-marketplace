import { z } from "zod";
import { convertEmptyStringToNull } from "../utils";
import { generateDateSchema } from "./general";

export const categorySchema = z.object({
    id: z
        .string({
            required_error: "ID is required",
            invalid_type_error: "ID must be a string",
        })
        .uuid("ID is invalid"),
    name: z
        .string({
            required_error: "Name is required",
            invalid_type_error: "Name must be a string",
        })
        .min(3, "Name must be at least 3 characters long"),
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
                required_error: "Description is required",
                invalid_type_error: "Description must be a string",
            })
            .min(3, "Description must be at least 3 characters long")
            .nullable()
    ),
    createdAt: generateDateSchema({
        required_error: "Created at is required",
        invalid_type_error: "Created at must be a date",
    }),
    updatedAt: generateDateSchema({
        required_error: "Updated at is required",
        invalid_type_error: "Updated at must be a date",
    }),
});

export const subcategorySchema = z.object({
    id: z
        .string({
            required_error: "ID is required",
            invalid_type_error: "ID must be a string",
        })
        .uuid("ID is invalid"),
    categoryId: z
        .string({
            required_error: "Category ID is required",
            invalid_type_error: "Category ID must be a string",
        })
        .uuid("Category ID is invalid"),
    name: z
        .string({
            required_error: "Name is required",
            invalid_type_error: "Name must be a string",
        })
        .min(3, "Name must be at least 3 characters long"),
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
                required_error: "Description is required",
                invalid_type_error: "Description must be a string",
            })
            .min(3, "Description must be at least 3 characters long")
            .nullable()
    ),
    createdAt: generateDateSchema({
        required_error: "Created at is required",
        invalid_type_error: "Created at must be a date",
    }),
    updatedAt: generateDateSchema({
        required_error: "Updated at is required",
        invalid_type_error: "Updated at must be a date",
    }),
});

export const productTypeSchema = z.object({
    id: z
        .string({
            required_error: "ID is required",
            invalid_type_error: "ID must be a string",
        })
        .uuid("ID is invalid"),
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
    name: z
        .string({
            required_error: "Name is required",
            invalid_type_error: "Name must be a string",
        })
        .min(3, "Name must be at least 3 characters long"),
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
                required_error: "Description is required",
                invalid_type_error: "Description must be a string",
            })
            .min(3, "Description must be at least 3 characters long")
            .nullable()
    ),
    createdAt: generateDateSchema({
        required_error: "Created at is required",
        invalid_type_error: "Created at must be a date",
    }),
    updatedAt: generateDateSchema({
        required_error: "Updated at is required",
        invalid_type_error: "Updated at must be a date",
    }),
});

export const createCategorySchema = categorySchema.omit({
    id: true,
    slug: true,
    createdAt: true,
    updatedAt: true,
});
export const createSubcategorySchema = subcategorySchema.omit({
    id: true,
    slug: true,
    createdAt: true,
    updatedAt: true,
});
export const createProductTypeSchema = productTypeSchema.omit({
    id: true,
    slug: true,
    createdAt: true,
    updatedAt: true,
});

export const updateCategorySchema = createCategorySchema.partial();
export const updateSubcategorySchema = createSubcategorySchema.partial();
export const updateProductTypeSchema = createProductTypeSchema.partial();

export const cachedCategorySchema = categorySchema.extend({
    subcategories: z.number({
        required_error: "Subcategories is required",
        invalid_type_error: "Subcategories must be a number",
    }),
});
export const cachedSubcategorySchema = subcategorySchema.extend({
    productTypes: z.number({
        required_error: "Product types is required",
        invalid_type_error: "Product types must be a number",
    }),
});
export const cachedProductTypeSchema = productTypeSchema;

export type Category = z.infer<typeof categorySchema>;
export type Subcategory = z.infer<typeof subcategorySchema>;
export type ProductType = z.infer<typeof productTypeSchema>;

export type CreateCategory = z.infer<typeof createCategorySchema>;
export type CreateSubcategory = z.infer<typeof createSubcategorySchema>;
export type CreateProductType = z.infer<typeof createProductTypeSchema>;

export type UpdateCategory = z.infer<typeof updateCategorySchema>;
export type UpdateSubcategory = z.infer<typeof updateSubcategorySchema>;
export type UpdateProductType = z.infer<typeof updateProductTypeSchema>;

export type CachedCategory = z.infer<typeof cachedCategorySchema>;
export type CachedSubcategory = z.infer<typeof cachedSubcategorySchema>;
export type CachedProductType = z.infer<typeof cachedProductTypeSchema>;

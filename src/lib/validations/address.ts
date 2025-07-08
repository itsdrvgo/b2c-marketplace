import { z } from "zod";
import { generateDateSchema, idSchema, phoneSchema } from "./general";

export const addressSchema = z.object({
    id: idSchema,
    alias: z
        .string({
            required_error: "Alias is required",
            invalid_type_error: "Alias must be a string",
        })
        .min(1, "Alias is required"),
    aliasSlug: z
        .string({
            required_error: "Alias slug is required",
            invalid_type_error: "Alias slug must be a string",
        })
        .min(1, "Alias slug is required"),
    fullName: z
        .string({
            required_error: "Full name is required",
            invalid_type_error: "Full name must be a string",
        })
        .min(5, "Full name is required")
        .refine(
            (value) =>
                value.includes(" ") &&
                value.split(" ").every((part) => part.length >= 2),
            "Full name must contain first and last name, each at least 2 characters long"
        ),
    street: z
        .string({
            required_error: "Street is required",
            invalid_type_error: "Street must be a string",
        })
        .min(1, "Street is required"),
    city: z
        .string({
            required_error: "City is required",
            invalid_type_error: "City must be a string",
        })
        .min(1, "City is required"),
    state: z
        .string({
            required_error: "State is required",
            invalid_type_error: "State must be a string",
        })
        .min(1, "State is required"),
    zip: z
        .string({
            required_error: "Zip is required",
            invalid_type_error: "Zip must be a string",
        })
        .min(1, "Zip is required"),
    phone: phoneSchema,
    type: z.enum(["home", "work", "other"], {
        required_error: "Type is required",
        invalid_type_error: "Type must be home, work or other",
    }),
    isPrimary: z.boolean({
        required_error: "Is primary is required",
        invalid_type_error: "Is primary must be a boolean",
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

export const createAddressSchema = addressSchema.omit({
    id: true,
    aliasSlug: true,
    createdAt: true,
    updatedAt: true,
});

export const updateAddressSchema = createAddressSchema;

export type Address = z.infer<typeof addressSchema>;
export type CreateAddress = z.infer<typeof createAddressSchema>;
export type UpdateAddress = z.infer<typeof updateAddressSchema>;

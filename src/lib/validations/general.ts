import { z } from "zod";

export const idSchema = z
    .string({
        invalid_type_error: "ID must be a string",
        required_error: "ID is required",
    })
    .uuid("Please provide a valid ID");

export function generateIdSchema(options?: {
    invalid_type_error?: string;
    required_error?: string;
}): z.ZodString {
    return z
        .string({
            invalid_type_error:
                options?.invalid_type_error || "ID must be a string",
            required_error: options?.required_error || "ID is required",
        })
        .uuid("Please provide a valid ID");
}

export const emailSchema = z
    .string({
        invalid_type_error: "Invalid type for Email",
        required_error: "Email is required",
    })
    .email("Email address is invalid");

export const phoneSchema = z
    .string({
        invalid_type_error: "Phone number must be a string",
        required_error: "Phone number is required",
    })
    .regex(
        /^\+?\d{0,3}?\d{0,2}?\d{10}$/,
        "Phone number must be a valid 10 digit number with optional country and area code"
    );

export const passwordSchema = z
    .string({
        invalid_type_error: "Password must be a string",
        required_error: "Password is required",
    })
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s:]).{8,}$/,
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character"
    );

export const dateSchema = z
    .union([z.string(), z.date()], {
        required_error: "Date is required",
        invalid_type_error: "Date must be a date",
    })
    .transform((v) => new Date(v));

export function generateDateSchema(options?: {
    required_error?: string;
    invalid_type_error?: string;
}): z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodDate]>, Date, string | Date> {
    return z
        .union([z.string(), z.date()], {
            required_error: options?.required_error || "Date is required",
            invalid_type_error:
                options?.invalid_type_error || "Date must be a date",
        })
        .transform((v) => new Date(v));
}

export const priceSchema = z
    .union([z.number(), z.string()])
    .transform((v) => Number(v))
    .pipe(
        z
            .number({
                invalid_type_error: "Price must be a number",
                required_error: "Price is required",
            })
            .nonnegative("Price must be non-negative")
    );

import { z } from "zod";
import { emailSchema, passwordSchema } from "./general";
import { userSchema } from "./user";

export const signUpSchema = userSchema
    .pick({
        firstName: true,
        lastName: true,
        email: true,
    })
    .extend({
        password: passwordSchema,
        confirmPassword: passwordSchema,
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Confirm Password must match Password",
        path: ["confirmPassword"],
    });

export const signInSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export const otpSchema = z.object({
    otp: z.string().length(6, "OTP must be 6 characters long"),
});

export const updateEmailSchema = userSchema.pick({
    email: true,
});

export const updatePasswordSchema = z
    .object({
        currentPassword: passwordSchema,
        newPassword: passwordSchema,
        confirmPassword: passwordSchema,
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const deleteAccountSchema = z.object({
    text: z.literal("DELETE"),
});

export const forgotPasswordS1Schema = userSchema.pick({
    email: true,
});

export const forgotPasswordS2Schema = z
    .object({
        otp: otpSchema.shape.otp,
        password: passwordSchema,
        confirmPassword: passwordSchema,
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type SignUp = z.infer<typeof signUpSchema>;
export type SignIn = z.infer<typeof signInSchema>;
export type OTP = z.infer<typeof otpSchema>;
export type UpdateEmail = z.infer<typeof updateEmailSchema>;
export type UpdatePassword = z.infer<typeof updatePasswordSchema>;
export type DeleteAccount = z.infer<typeof deleteAccountSchema>;
export type ForgotPasswordS1 = z.infer<typeof forgotPasswordS1Schema>;
export type ForgotPasswordS2 = z.infer<typeof forgotPasswordS2Schema>;

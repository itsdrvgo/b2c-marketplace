import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
        CLERK_WEBHOOK_SECRET: z
            .string()
            .min(1, "CLERK_WEBHOOK_SECRET is required"),

        DATABASE_URL: z.string({
            required_error: "DATABASE_URL is required",
        }),
        REDIS_URL: z.string().url("REDIS_URL is required").regex(/redis/),

        UPLOADTHING_TOKEN: z
            .string({
                required_error: "UPLOADTHING_TOKEN is required",
            })
            .min(1, "UPLOADTHING_TOKEN must not be empty"),

        IS_API_AUTHENTICATED: z
            .string()
            .optional()
            .default("false")
            .transform((val) => val === "true" || val === "1"),
    },
    client: {
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
            .string()
            .min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),

        NEXT_PUBLIC_BACKEND_URL: z
            .string({
                required_error: "NEXT_PUBLIC_BACKEND_URL is required",
            })
            .url("NEXT_PUBLIC_BACKEND_URL must be a valid URL"),

        NEXT_PUBLIC_DEPLOYMENT_URL: z
            .string()
            .url("NEXT_PUBLIC_DEPLOYMENT_URL must be a valid URL")
            .optional(),
    },
    runtimeEnv: {
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
        CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
        REDIS_URL: process.env.REDIS_URL,
        UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
        IS_API_AUTHENTICATED: process.env.IS_API_AUTHENTICATED,

        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
            process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
        NEXT_PUBLIC_DEPLOYMENT_URL: process.env.NEXT_PUBLIC_DEPLOYMENT_URL,
    },
});

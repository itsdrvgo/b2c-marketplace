import { z } from "zod";
import { convertEmptyStringToNull } from "../utils";
import { dateSchema, generateIdSchema, idSchema } from "./general";

export const mediaItemSchema = z.object({
    id: idSchema,
    uploaderId: generateIdSchema({
        invalid_type_error: "Uploader ID must be a string",
        required_error: "Uploader ID is required",
    }).nullable(),
    url: z
        .string({
            required_error: "Media URL is required",
            invalid_type_error: "Media URL must be a string",
        })
        .url("Media URL is invalid"),
    type: z
        .string({
            required_error: "Media type is required",
            invalid_type_error: "Media type must be a string",
        })
        .min(1, "Media type is required"),
    name: z
        .string({
            required_error: "Media name is required",
            invalid_type_error: "Media name must be a string",
        })
        .min(1, "Media name is required"),
    alt: z.preprocess(
        convertEmptyStringToNull,
        z
            .string({
                invalid_type_error: "Media alt must be a string",
            })
            .min(1, "Media alt is required")
            .nullable()
    ),
    size: z
        .number({
            required_error: "Media size is required",
            invalid_type_error: "Media size must be a string",
        })
        .int("Media size must be an integer")
        .min(0, "Media size must be greater than or equal to 0"),
    createdAt: dateSchema,
    updatedAt: dateSchema,
});

export const createMediaItemSchema = mediaItemSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const updateMediaItemSchema = mediaItemSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const cachedMediaItemSchema = mediaItemSchema;

export type MediaItem = z.infer<typeof mediaItemSchema>;
export type CreateMediaItem = z.infer<typeof createMediaItemSchema>;
export type UpdateMediaItem = z.infer<typeof updateMediaItemSchema>;
export type CachedMediaItem = z.infer<typeof cachedMediaItemSchema>;

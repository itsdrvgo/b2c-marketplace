import { auth as clerkAuth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

const f = createUploadthing();
export const utApi = new UTApi();

export const uploadRouter = {
    mediaUploader: f({
        image: { maxFileCount: 9999, maxFileSize: "1024GB" },
        video: { maxFileCount: 9999, maxFileSize: "1024GB" },
        audio: { maxFileCount: 9999, maxFileSize: "1024GB" },
        pdf: { maxFileCount: 9999, maxFileSize: "1024GB" },
        blob: { maxFileCount: 9999, maxFileSize: "1024GB" },
        text: { maxFileCount: 9999, maxFileSize: "1024GB" },
    })
        .middleware(async () => {
            const auth = await clerkAuth();
            if (!auth.userId)
                throw new UploadThingError({
                    code: "FORBIDDEN",
                    message: "You're not authorized",
                });

            return { userId: auth.userId };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return {
                uploaderId: metadata.userId,
                name: file.name,
                size: file.size,
                key: file.key,
                url: file.ufsUrl,
            };
        }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;

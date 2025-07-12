"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { axios } from "../axios";
import { useUploadThing } from "../uploadthing";
import { handleClientError, slugify } from "../utils";
import { CreateMediaItem, MediaItem, ResponseData } from "../validations";

export function useMediaItem() {
    const router = useRouter();

    const { startUpload } = useUploadThing("mediaUploader", {
        onUploadError: (e) => {
            toast.error(e.message);
        },
    });

    const useScan = <T extends MediaItem[]>({
        initialData,
    }: {
        initialData?: T;
    }) => {
        return useQuery({
            queryKey: ["media-items"],
            queryFn: async () => {
                const response =
                    await axios.get<ResponseData<T>>("/media-items");
                if (!response.data.success)
                    throw new Error(response.data.longMessage);
                return response.data.data;
            },
            initialData,
        });
    };

    const useCreate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading(
                    "Uploading media items, do not close the tab..."
                );
                return { toastId };
            },
            mutationFn: async ({
                files,
                uploaderId,
            }: {
                files: File[];
                uploaderId: string;
            }) => {
                const res = await startUpload(files);
                if (!res?.length) throw new Error("Failed to upload media");

                const values: CreateMediaItem[] = res.map((item) => ({
                    name: item.name,
                    url: item.ufsUrl,
                    type: item.type,
                    size: item.size,
                    uploaderId,
                    alt: slugify(item.name),
                }));

                const response = await axios.post<ResponseData<MediaItem[]>>(
                    "/media-items",
                    values
                );
                if (!response.data.success)
                    throw new Error(response.data.longMessage);
                return response.data.data;
            },
            onSuccess: (_, __, { toastId }) => {
                toast.success("Media items added!", { id: toastId });
                router.refresh();
            },
            onError: (err, _, ctx) => {
                handleClientError(err, ctx?.toastId);
            },
        });
    };

    return { useScan, useCreate };
}

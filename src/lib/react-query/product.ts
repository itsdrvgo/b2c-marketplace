"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { axios } from "../axios";
import { handleClientError } from "../utils";
import {
    CreateProduct,
    FullProduct,
    Product,
    ResponseData,
    UpdateProduct,
} from "../validations";

export function useProduct() {
    const router = useRouter();

    const usePaginate = <
        T extends {
            data: FullProduct[];
            items: number;
            pages: number;
        },
    >(input: {
        limit?: number;
        page?: number;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
        categoryId?: string;
        subcategoryId?: string;
        productTypeId?: string;
        isActive?: boolean;
        isAvailable?: boolean;
        isPublished?: boolean;
        isDeleted?: boolean;
        verificationStatus?: Product["verificationStatus"];
        sortBy?: "price" | "createdAt";
        sortOrder?: "asc" | "desc";
        initialData?: T;
        enabled?: boolean;
    }) => {
        const {
            limit,
            page,
            search,
            minPrice,
            maxPrice,
            categoryId,
            subcategoryId,
            productTypeId,
            isActive,
            isAvailable,
            isPublished,
            isDeleted,
            verificationStatus,
            sortBy,
            sortOrder,
            ...rest
        } = input;

        return useQuery({
            queryKey: [
                "products",
                limit,
                page,
                search,
                minPrice,
                maxPrice,
                categoryId,
                subcategoryId,
                productTypeId,
                isActive,
                isAvailable,
                isPublished,
                isDeleted,
                verificationStatus,
                sortBy,
                sortOrder,
            ],
            queryFn: async () => {
                const response = await axios.get<ResponseData<T>>("/products", {
                    params: {
                        limit,
                        page,
                        search,
                        minPrice,
                        maxPrice,
                        categoryId,
                        subcategoryId,
                        productTypeId,
                        isActive,
                        isAvailable,
                        isPublished,
                        isDeleted,
                        verificationStatus,
                        sortBy,
                        sortOrder,
                    },
                });
                if (!response.data.success)
                    throw new Error(response.data.longMessage);
                return response.data.data;
            },
            staleTime: 1000,
            refetchOnWindowFocus: false,
            retry: 1,
            ...rest,
        });
    };

    const useCreate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Adding new product...");
                return { toastId };
            },
            mutationFn: async (values: CreateProduct[]) => {
                const response = await axios.post<ResponseData<Product[]>>(
                    "/products",
                    values
                );
                if (!response.data.success)
                    throw new Error(response.data.longMessage);
                return response.data.data;
            },
            onSuccess: (_, __, { toastId }) => {
                toast.success("Product added!", { id: toastId });
                router.refresh();
            },
            onError: (err, _, ctx) => {
                return handleClientError(err, ctx?.toastId);
            },
        });
    };

    const useUpdate = () => {
        return useMutation({
            onMutate: () => {
                const toastId = toast.loading("Updating product...");
                return { toastId };
            },
            mutationFn: async ({
                id,
                values,
            }: {
                id: string;
                values: UpdateProduct;
            }) => {
                const response = await axios.patch<ResponseData<Product>>(
                    `/products/${id}`,
                    values
                );
                if (!response.data.success)
                    throw new Error(response.data.longMessage);
                return response.data.data;
            },
            onSuccess: (_, __, { toastId }) => {
                toast.success("Product updated!", { id: toastId });
                router.refresh();
            },
            onError: (err, _, ctx) => {
                return handleClientError(err, ctx?.toastId);
            },
        });
    };

    return { usePaginate, useCreate, useUpdate };
}

import { useQuery } from "@tanstack/react-query";
import { axios } from "../axios";
import {
    Category,
    ProductType,
    ResponseData,
    Subcategory,
} from "../validations";

export function useCategory() {
    const useScan = <T extends (Category & { subcategories: number })[]>({
        initialData,
    }: {
        initialData?: T;
    }) => {
        return useQuery({
            queryKey: ["category", "scan"],
            queryFn: async () => {
                const response =
                    await axios.get<ResponseData<T>>("/categories");
                if (!response.data.success)
                    throw new Error(response.data.longMessage);
                return response.data.data;
            },
            initialData,
        });
    };

    const useGet = <T extends Category & { subcategories: Subcategory[] }>({
        id,
        initialData,
    }: {
        id: string;
        initialData?: T;
    }) => {
        return useQuery({
            queryKey: ["category", "get", id],
            queryFn: async () => {
                const response = await axios.get<ResponseData<T>>(
                    `/categories/${id}`
                );
                if (!response.data.success)
                    throw new Error(response.data.longMessage);
                return response.data.data;
            },
            initialData,
        });
    };

    return { useScan, useGet };
}

export function useSubcategory() {
    const useScan = <T extends (Subcategory & { productTypes: number })[]>({
        initialData,
    }: {
        initialData?: T;
    }) => {
        return useQuery({
            queryKey: ["subcategory", "scan"],
            queryFn: async () => {
                const response =
                    await axios.get<ResponseData<T>>("/subcategories");
                if (!response.data.success)
                    throw new Error(response.data.longMessage);
                return response.data.data;
            },
            initialData,
        });
    };

    const useGet = <
        T extends Subcategory & {
            productTypes: ProductType[];
        },
    >({
        id,
        initialData,
    }: {
        id: string;
        initialData?: T;
    }) => {
        return useQuery({
            queryKey: ["subcategory", "get", id],
            queryFn: async () => {
                const response = await axios.get<ResponseData<T>>(
                    `/subcategories/${id}`
                );
                if (!response.data.success)
                    throw new Error(response.data.longMessage);
                return response.data.data;
            },
            initialData,
        });
    };

    return { useScan, useGet };
}

export function useProductType() {
    const useScan = <T extends ProductType[]>({
        initialData,
    }: {
        initialData?: T;
    }) => {
        return useQuery({
            queryKey: ["productType", "scan"],
            queryFn: async () => {
                const response =
                    await axios.get<ResponseData<T>>("/product-types");
                if (!response.data.success)
                    throw new Error(response.data.longMessage);
                return response.data.data;
            },
            initialData,
        });
    };

    const useGet = <T extends ProductType>({
        id,
        initialData,
    }: {
        id: string;
        initialData?: T;
    }) => {
        return useQuery({
            queryKey: ["productType", "get", id],
            queryFn: async () => {
                const response = await axios.get<ResponseData<T>>(
                    `/product-types/${id}`
                );
                if (!response.data.success)
                    throw new Error(response.data.longMessage);
                return response.data.data;
            },
            initialData,
        });
    };

    return { useScan, useGet };
}

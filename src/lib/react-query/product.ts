"use client";

import { useQuery } from "@tanstack/react-query";
import { axios } from "../axios";
import { FullProduct, ResponseData } from "../validations";

export function useProduct() {
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
        initialData?: T;
        enabled?: boolean;
    }) => {
        const { limit, page, search, ...rest } = input;

        return useQuery({
            queryKey: ["products", limit, page, search],
            queryFn: async () => {
                const response = await axios.get<ResponseData<T>>("/products", {
                    params: { limit, page, search },
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

    return { usePaginate };
}

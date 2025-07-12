import { ProductsTable } from "@/components/dashboard/products";
import { GeneralShell } from "@/components/globals/layouts";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
    DEFAULT_PAGINATION_LIMIT,
    DEFAULT_PAGINATION_PAGE,
} from "@/config/const";
import { queries } from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import Link from "next/link";
import { unauthorized } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Products",
    description: "Manage your products",
};

interface PageProps {
    searchParams: Promise<{
        limit?: string;
        page?: string;
        search?: string;
    }>;
}

export default function Page({ searchParams }: PageProps) {
    return (
        <GeneralShell>
            <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
                <div>
                    <h1 className="text-2xl font-bold">Products</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        Manage your products here
                    </p>
                </div>

                <Button asChild size="sm">
                    <Link href="/dashboard/products/create">
                        <Icons.Plus />
                        Create Product
                    </Link>
                </Button>
            </div>

            <Suspense>
                <ProductsFetch searchParams={searchParams} />
            </Suspense>
        </GeneralShell>
    );
}

async function ProductsFetch({ searchParams }: PageProps) {
    const {
        page: pageRaw,
        limit: limitRaw,
        search: searchRaw,
    } = await searchParams;

    const limit =
        limitRaw && !isNaN(parseInt(limitRaw))
            ? parseInt(limitRaw)
            : DEFAULT_PAGINATION_LIMIT;
    const page =
        pageRaw && !isNaN(parseInt(pageRaw))
            ? parseInt(pageRaw)
            : DEFAULT_PAGINATION_PAGE;
    const search = !!searchRaw?.length ? searchRaw : undefined;

    const { userId } = await auth();
    if (!userId) unauthorized();

    const data = await queries.product.paginate({
        limit,
        page,
        search,
    });

    return <ProductsTable initialData={data} />;
}

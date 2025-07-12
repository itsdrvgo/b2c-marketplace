import { ProductManageForm } from "@/components/globals/forms";
import { GeneralShell } from "@/components/globals/layouts";
import { cache } from "@/lib/redis/methods";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { unauthorized } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Create Product",
    description: "Create a new product",
};

export default function Page() {
    return (
        <GeneralShell>
            <div className="flex flex-col justify-between gap-2 md:flex-row">
                <div className="text-center md:text-start">
                    <h1 className="text-2xl font-bold">Create Product</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        Create a new product for your catalog
                    </p>
                </div>
            </div>

            <Suspense>
                <ProductFetch />
            </Suspense>
        </GeneralShell>
    );
}

async function ProductFetch() {
    const { userId } = await auth();
    if (!userId) unauthorized();

    const user = await cache.user.get(userId);
    if (!user) unauthorized();

    const [categories, subcategories, productTypes, media] = await Promise.all([
        cache.category.scan(),
        cache.subcategory.scan(),
        cache.productType.scan(),
        cache.mediaItem.scan(),
    ]);

    return (
        <ProductManageForm
            categories={categories}
            subcategories={subcategories}
            productTypes={productTypes}
            initialMedia={media}
            user={user}
        />
    );
}

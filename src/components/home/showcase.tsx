"use client";

import { Button } from "@/components/ui/button";
import { useProduct } from "@/lib/react-query/product";
import { cn, convertCentToDollar, formatPriceTag } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Icons } from "../icons";

export function Showcase({ className, ...props }: GenericProps) {
    const { usePaginate } = useProduct();

    const { data: productsData, isLoading } = usePaginate({
        limit: 3,
        page: 1,
        enabled: true,
        verificationStatus: "approved",
        isPublished: true,
        isAvailable: true,
        isActive: true,
    });

    const products = productsData?.data || [];

    return (
        <div
            className={cn(
                "grid grid-cols-1 items-center gap-12 lg:grid-cols-5",
                className
            )}
            {...props}
        >
            {/* Left Section - Text Area */}
            <div className="col-span-2 flex-1 space-y-6">
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
                        Shop New Arrivals
                    </h2>
                    <p className="max-w-md text-lg text-muted-foreground">
                        Check out the latest styles handpicked just for you.
                        Discover sustainable fashion that makes a difference.
                    </p>
                </div>

                <Button size="lg" className="mt-6" asChild>
                    <Link href="/shop">
                        View All Products
                        <Icons.Heart className="ml-2 size-4" />
                    </Link>
                </Button>
            </div>

            {/* Right Section - Product Grid */}
            <div className="col-span-3 flex-1">
                {isLoading ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(3)].map((_, index) => (
                            <div
                                key={index}
                                className="overflow-hidden rounded-lg"
                            >
                                {/* Image skeleton */}
                                <div className="aspect-[4/5] animate-pulse bg-gradient-to-br from-gray-100 to-gray-200" />

                                {/* Content skeleton */}
                                <div className="space-y-3 p-5">
                                    <div className="space-y-2">
                                        <div className="h-5 animate-pulse rounded-lg bg-gray-200" />
                                        <div className="h-4 w-3/4 animate-pulse rounded-lg bg-gray-200" />
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="h-6 w-20 animate-pulse rounded-lg bg-gray-200" />
                                            <div className="h-5 w-12 animate-pulse rounded-full bg-gray-200" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="size-3.5 animate-pulse rounded bg-gray-200"
                                                />
                                            ))}
                                        </div>
                                        <div className="ml-1 h-3 w-12 animate-pulse rounded bg-gray-200" />
                                    </div>

                                    <div className="mt-4 h-10 animate-pulse rounded-xl bg-gray-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => {
                            const mainImage =
                                product.media?.[0]?.mediaItem?.url;

                            // Handle pricing based on whether product has variants
                            let priceDisplay: string;
                            if (!product.productHasVariants) {
                                const price = formatPriceTag(
                                    convertCentToDollar(product.price ?? 0),
                                    true
                                );
                                priceDisplay = price;
                            } else {
                                const minPriceRaw = Math.min(
                                    ...product.variants.map((x) => x.price)
                                );

                                const minPrice = formatPriceTag(
                                    convertCentToDollar(minPriceRaw),
                                    true
                                );

                                priceDisplay = minPrice;
                            }

                            return (
                                <div
                                    key={product.id}
                                    className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Product Image */}
                                    <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                                        {mainImage ? (
                                            <Image
                                                src={mainImage}
                                                alt={product.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Icons.Heart className="size-12 text-gray-300" />
                                            </div>
                                        )}

                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                        {/* Heart icon for wishlist */}
                                        <button className="absolute top-3 right-3 rounded-full bg-white/80 p-2 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 hover:scale-110 hover:bg-white">
                                            <Icons.Heart className="size-4 text-gray-600 transition-colors hover:text-red-500" />
                                        </button>
                                    </div>

                                    {/* Product Info */}
                                    <div className="space-y-3 py-5">
                                        {/* Title and Price */}
                                        <div className="space-y-2">
                                            <h3 className="line-clamp-2 text-base leading-tight font-semibold text-gray-900">
                                                {product.title.length > 26
                                                    ? `${product.title.slice(0, 26)}...`
                                                    : product.title}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xl font-bold text-gray-900">
                                                    {priceDisplay}
                                                </p>
                                                {/* Badge for new arrivals */}
                                                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                                                    New
                                                </span>
                                            </div>
                                        </div>

                                        {/* Rating */}
                                        <div className="flex items-center gap-1">
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg
                                                        key={i}
                                                        className={cn(
                                                            "size-3.5",
                                                            i < 4
                                                                ? "fill-current text-amber-400"
                                                                : "fill-current text-gray-300"
                                                        )}
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span className="ml-1 text-sm text-gray-500">
                                                4.0 (24)
                                            </span>
                                        </div>

                                        {/* Add to Cart Button */}
                                        <Button className="mt-4 w-full transform rounded-xl bg-gray-900 py-2.5 font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:bg-gray-800 active:scale-[0.98]">
                                            Add to Cart
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!isLoading && products.length === 0 && (
                    <div className="py-12 text-center">
                        <Icons.Heart className="mx-auto mb-4 size-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-semibold text-foreground">
                            No products available
                        </h3>
                        <p className="text-muted-foreground">
                            Check back soon for new arrivals!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

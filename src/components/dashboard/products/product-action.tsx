"use client";

import { Icons } from "@/components/icons";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    DEFAULT_PAGINATION_LIMIT,
    DEFAULT_PAGINATION_PAGE,
} from "@/config/const";
import { useProduct } from "@/lib/react-query";
import { FullProduct, UpdateProduct } from "@/lib/validations";
import Link from "next/link";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";

interface PageProps {
    data: FullProduct;
}

export function ProductAction({ data }: PageProps) {
    const [page] = useQueryState(
        "page",
        parseAsInteger.withDefault(DEFAULT_PAGINATION_PAGE)
    );
    const [limit] = useQueryState(
        "limit",
        parseAsInteger.withDefault(DEFAULT_PAGINATION_LIMIT)
    );
    const [search] = useQueryState("search", { defaultValue: "" });

    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

    const { usePaginate, useUpdate } = useProduct();
    const { refetch } = usePaginate({
        limit,
        page,
        search,
    });

    const { mutateAsync: updateProduct, isPending: isUpdating } = useUpdate();

    const handleUpdate = async (values: UpdateProduct) => {
        await updateProduct({
            id: data.id,
            values: {
                ...data,
                ...values,
            },
        });

        refetch();
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="size-8">
                        <span className="sr-only">Open menu</span>
                        <Icons.MoreVertical className="size-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>

                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/products/p/${data.id}`}>
                                <Icons.Pencil className="size-4" />
                                <span>Edit</span>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => setIsPublishModalOpen(true)}
                            disabled={data.isPublished || isUpdating}
                        >
                            {data.isPublished ? (
                                <>
                                    <Icons.Unlock className="size-4" />
                                    <span>Unpublish</span>
                                </>
                            ) : (
                                <>
                                    <Icons.Lock className="size-4" />
                                    <span>Publish</span>
                                </>
                            )}
                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem>
                        <Icons.Trash2 className="size-4" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog
                open={isPublishModalOpen}
                onOpenChange={setIsPublishModalOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure you want to publish this product?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            People will be able to see and purchase this
                            product. Are you sure you want to publish it?
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => setIsPublishModalOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() =>
                                handleUpdate({
                                    isPublished: true,
                                    publishedAt: new Date(),
                                })
                            }
                        >
                            Publish
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

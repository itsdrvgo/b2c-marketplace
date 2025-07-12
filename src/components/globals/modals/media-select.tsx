"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMediaItem } from "@/lib/react-query";
import { cn } from "@/lib/utils";
import { MediaItem } from "@/lib/validations";
import Image from "next/image";
import React, {
    Dispatch,
    SetStateAction,
    useMemo,
    useRef,
    useState,
} from "react";

interface PageProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    selected: MediaItem[];
    data: MediaItem[];
    multiple?: boolean;
    accept?: string;
    onSelectionComplete?: (items: MediaItem[]) => void;
    uploaderId: string;
}

export function MediaSelectModal({
    isOpen,
    setIsOpen,
    selected,
    data,
    multiple = false,
    accept = "*",
    onSelectionComplete,
    uploaderId,
}: PageProps) {
    const [search, setSearch] = useState("");
    const [selectedItems, setSelectedItems] = useState<MediaItem[]>(selected);

    const inputRef = useRef<HTMLInputElement>(null!);

    const itemsToMap = useMemo(() => {
        if (search.length === 0) return data;
        return data.filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [data, search]);

    const { useScan, useCreate } = useMediaItem();
    const { refetch } = useScan({ initialData: data });

    const { mutateAsync, isPending } = useCreate();

    const handleSelectionChange = (media: MediaItem, isSelected: boolean) => {
        setSelectedItems((prev) => {
            if (!multiple) return isSelected ? [media] : [];
            return isSelected
                ? [...prev, media]
                : prev.filter((x) => x.id !== media.id);
        });
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        await mutateAsync({
            uploaderId,
            files: Array.from(e.target.files),
        });

        refetch();
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Select file</DialogTitle>
                    <DialogDescription>
                        Select existing media or upload new media
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <Button
                        className="h-9 w-full px-3 text-xs md:h-10 md:px-4 md:text-sm"
                        disabled={isPending}
                        onClick={() => inputRef.current.click()}
                    >
                        <Icons.CloudUpload className="size-5" />
                        Upload Media
                    </Button>

                    <input
                        ref={inputRef}
                        multiple
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={handleUpload}
                    />

                    <div className="relative h-px w-full bg-foreground/20">
                        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm font-medium">
                            OR
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Input
                            type="search"
                            placeholder="Search files..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="grid max-h-80 grid-cols-2 gap-4 overflow-scroll rounded-lg border p-2 md:grid-cols-6">
                        {itemsToMap.map((media) => (
                            <ProductMediaSelectSingle
                                key={media.id}
                                media={media}
                                selectedItems={selectedItems}
                                multiple={multiple}
                                onSelectionChange={(isSelected) =>
                                    handleSelectionChange(media, isSelected)
                                }
                            />
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="reset" variant="ghost" size="sm">
                            Cancel
                        </Button>
                    </DialogClose>

                    <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                            onSelectionComplete?.(selectedItems);
                            setIsOpen(false);
                        }}
                    >
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface CompProps {
    media: MediaItem;
    onSelectionChange: (isSelected: boolean) => void;
    selectedItems: MediaItem[];
    multiple: boolean;
}

function ProductMediaSelectSingle({
    media,
    onSelectionChange,
    selectedItems,
    multiple,
}: CompProps) {
    const fileType = media.name.split(".").pop();
    const fileName = media.name.split(".").slice(0, -1).join(".");

    const isMediaImage = media.type.includes("image");

    const isSelected = selectedItems.some((item) => item.id === media.id);

    const handleSelection = (value: boolean) => {
        if (!multiple && value) {
            onSelectionChange(true);
            return;
        }
        onSelectionChange(value);
    };

    return (
        <div key={media.id} className="space-y-2">
            <div
                className={cn(
                    "relative aspect-square overflow-hidden rounded-md border p-2 transition-all ease-in-out hover:bg-muted",
                    isSelected && "border-primary"
                )}
                onClick={() => handleSelection(!isSelected)}
            >
                {isMediaImage ? (
                    <Image
                        src={media.url}
                        alt={media.alt || media.name}
                        height={500}
                        width={500}
                        className="size-full rounded-sm object-cover"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center">
                        <div className="flex aspect-square size-10 items-center justify-center overflow-hidden rounded-md bg-gray-200 text-gray-500">
                            <Icons.FileText className="size-5" />
                        </div>
                    </div>
                )}

                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(value) => handleSelection(!!value)}
                    className="absolute top-3 left-3 bg-background"
                />
            </div>

            <div className="space-y-1 text-center">
                <p className="truncate text-xs font-semibold">{fileName}</p>

                <p className="text-sm font-medium text-muted-foreground uppercase">
                    {fileType}
                </p>
            </div>
        </div>
    );
}

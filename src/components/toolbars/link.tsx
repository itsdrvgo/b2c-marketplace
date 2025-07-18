"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, getUrlFromString } from "@/lib/utils";
import { PopoverClose } from "@radix-ui/react-popover";
import { X } from "lucide-react";
import React, { type FormEvent } from "react";
import { useToolbar } from "./toolbar-provider";

const LinkToolbar = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, ...props }, ref) => {
        const { editor } = useToolbar();
        const [link, setLink] = React.useState("");

        const handleSubmit = (e: FormEvent) => {
            e.preventDefault();
            const url = getUrlFromString(link);
            if (url) {
                editor
                    ?.chain()
                    .focus()
                    .extendMarkRange("link")
                    .setLink({ href: url })
                    .run();
            }
        };

        React.useEffect(() => {
            setLink(editor?.getAttributes("link").href || "");
        }, [editor]);

        return (
            <Popover>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger
                            disabled={
                                !editor
                                    ?.can()
                                    .chain()
                                    .setLink({ href: "" })
                                    .run()
                            }
                            asChild
                        >
                            <Button
                                variant="ghost"
                                type="button"
                                size="sm"
                                className={cn(
                                    "w-max px-3 font-normal",
                                    editor?.isActive("link") &&
                                        "bg-muted text-foreground",
                                    "hover:text-foreground",
                                    className
                                )}
                                ref={ref}
                                {...props}
                            >
                                <p className="text-base">↗</p>
                                <p
                                    className={
                                        "decoration-gray-7 underline underline-offset-4"
                                    }
                                >
                                    Link
                                </p>
                            </Button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <span>Link</span>
                    </TooltipContent>
                </Tooltip>

                <PopoverContent
                    onCloseAutoFocus={(e) => {
                        e.preventDefault();
                    }}
                    asChild
                    className="relative px-3 py-2.5"
                >
                    <div className="relative">
                        <PopoverClose className="absolute top-3 right-3">
                            <X className="size-4" />
                        </PopoverClose>

                        <form onSubmit={handleSubmit}>
                            <Label>Link</Label>
                            <p className="text-gray-11 text-sm">
                                Attach a link to the selected text
                            </p>
                            <div className="mt-3 flex flex-col items-end justify-end gap-3">
                                <Input
                                    value={link}
                                    onChange={(e) => {
                                        setLink(e.target.value);
                                    }}
                                    className="w-full"
                                    placeholder="https://example.com"
                                />
                                <div className="flex items-center gap-1">
                                    {editor?.getAttributes("link").href && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="text-gray-11 h-8"
                                            variant="ghost"
                                            onClick={() => {
                                                editor
                                                    ?.chain()
                                                    .focus()
                                                    .unsetLink()
                                                    .run();
                                                setLink("");
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        type="submit"
                                        className="h-8"
                                    >
                                        {editor?.getAttributes("link").href
                                            ? "Update"
                                            : "Confirm"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </PopoverContent>
            </Popover>
        );
    }
);

LinkToolbar.displayName = "LinkToolbar";

export { LinkToolbar };

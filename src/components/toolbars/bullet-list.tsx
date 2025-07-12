"use client";

import { useToolbar } from "@/components/toolbars/toolbar-provider";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";
import React from "react";

const BulletListToolbar = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, onClick, children, ...props }, ref) => {
        const { editor } = useToolbar();

        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        type="button"
                        size="icon"
                        className={cn(
                            "size-8",
                            editor?.isActive("bulletList") &&
                                "bg-muted text-foreground",
                            "hover:text-foreground",
                            className
                        )}
                        onClick={(e) => {
                            editor?.chain().focus().toggleBulletList().run();
                            onClick?.(e);
                        }}
                        disabled={
                            !editor
                                ?.can()
                                .chain()
                                .focus()
                                .toggleBulletList()
                                .run()
                        }
                        ref={ref}
                        {...props}
                    >
                        {children || <List className="size-4" />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <span>Bullet list</span>
                </TooltipContent>
            </Tooltip>
        );
    }
);

BulletListToolbar.displayName = "BulletListToolbar";

export { BulletListToolbar };

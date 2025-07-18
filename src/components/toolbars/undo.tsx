"use client";

import { useToolbar } from "@/components/toolbars/toolbar-provider";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CornerUpLeft } from "lucide-react";
import React from "react";

const UndoToolbar = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, onClick, children, ...props }, ref) => {
        const { editor } = useToolbar();

        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        className={cn(
                            "size-8",
                            "hover:text-foreground",
                            className
                        )}
                        onClick={(e) => {
                            editor?.chain().focus().undo().run();
                            onClick?.(e);
                        }}
                        disabled={!editor?.can().chain().focus().undo().run()}
                        ref={ref}
                        {...props}
                    >
                        {children || <CornerUpLeft className="size-4" />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <span>Undo</span>
                </TooltipContent>
            </Tooltip>
        );
    }
);

UndoToolbar.displayName = "UndoToolbar";

export { UndoToolbar };

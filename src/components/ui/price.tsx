import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import * as React from "react";

interface PriceInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    currency?: string;
    currencySymbol?: string;
    classNames?: {
        outerWrapper?: ClassValue;
        innerWrapper?: ClassValue;
        input?: ClassValue;
    };
}

export function PriceInput({
    currency,
    currencySymbol,
    classNames,
    ...props
}: PriceInputProps) {
    return (
        <div className={cn("*:not-first:mt-2", classNames?.outerWrapper)}>
            <div
                className={cn(
                    "relative flex rounded-md shadow-xs",
                    classNames?.innerWrapper
                )}
            >
                {!!currencySymbol && (
                    <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm text-muted-foreground">
                        {currencySymbol}
                    </span>
                )}

                <Input
                    className={cn(
                        "z-10 -me-px shadow-none",
                        classNames?.input,
                        !!currencySymbol && "ps-6",
                        !!currency && "rounded-e-none"
                    )}
                    placeholder="0.00"
                    type="text"
                    {...props}
                />

                {!!currency && (
                    <span className="inline-flex items-center rounded-e-md border border-input bg-background px-3 text-sm text-muted-foreground">
                        {currency}
                    </span>
                )}
            </div>
        </div>
    );
}

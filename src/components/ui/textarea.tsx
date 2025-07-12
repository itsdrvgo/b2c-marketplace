import { cn } from "@/lib/utils";
import * as React from "react";
import TextareaAutoResize, {
    TextareaAutosizeProps,
} from "react-textarea-autosize";

export interface TextareaProps extends TextareaAutosizeProps {
    showCounter?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        { className, showCounter, maxLength, value, defaultValue, ...props },
        ref
    ) => {
        const [charCount, setCharCount] = React.useState(
            value?.toString().length || defaultValue?.toString().length || 0
        );

        React.useEffect(() => {
            if (value !== undefined) setCharCount(value.toString().length);
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setCharCount(e.target.value.length);
            props.onChange?.(e);
        };

        return (
            <div className="relative">
                <TextareaAutoResize
                    className={cn(
                        "flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
                        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
                        className
                    )}
                    value={value}
                    defaultValue={defaultValue}
                    ref={ref}
                    maxLength={maxLength}
                    onChange={handleChange}
                    {...props}
                />
                {showCounter && maxLength && (
                    <div className="absolute right-2 bottom-2 text-xs text-muted-foreground">
                        {maxLength - charCount}
                    </div>
                )}
            </div>
        );
    }
);
Textarea.displayName = "Textarea";

export { Textarea };

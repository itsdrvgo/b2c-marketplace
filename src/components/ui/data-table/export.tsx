"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Reorder } from "motion/react";
import Papa from "papaparse";
import { useState } from "react";

// Helper type for nested paths
type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;

// Create a type for all possible nested paths in an object
export type NestedPaths<T, D extends number = 10> = [D] extends [never]
    ? never
    : T extends object
      ? {
            [K in keyof T]-?: K extends string | number
                ? `${K}` | `${K}${DotPrefix<NestedPaths<T[K], Prev[D]>>}`
                : never;
        }[keyof T]
      : "";

// Helper type for previous number in depth calculation
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// Get value from object using a dot-notation path
function getValueByPath<T extends Record<string, unknown>>(
    obj: T,
    path: string
): unknown {
    if (!path) return undefined;

    return path.split(".").reduce((acc, part) => {
        if (acc === null || acc === undefined) return acc;
        return acc[part];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, obj as any);
}

export interface FieldMapping<T extends Record<string, unknown>> {
    // Use literal type for source (keyof T or dot-notation path)
    source: keyof T | NestedPaths<T>;
    target: string; // Name to use in the CSV
    include: boolean; // Whether to include this field
    order: number; // Order in the CSV
    // Custom formatter for complex transformations
    formatter?: (row: T) => string | number | boolean | null | undefined;
}

export interface ExportDialogProps<T extends Record<string, unknown>> {
    isOpen: boolean;
    onClose: () => void;
    data: T[];
    filename?: string;
    fields?: FieldMapping<T>[];
}

export function ExportDialog<T extends Record<string, unknown>>({
    isOpen,
    onClose,
    data,
    filename = "export.csv",
    fields: initialFields,
}: ExportDialogProps<T>) {
    // Generate initial field mappings if none provided
    const generateFields = (): FieldMapping<T>[] => {
        if (initialFields) return [...initialFields];
        if (!data.length) return [];

        // Create mappings from the first data item
        const sampleData = data[0];
        return Object.keys(sampleData).map((key, index) => ({
            source: key as keyof T,
            target: key,
            include: true,
            order: index,
        }));
    };

    // Properly typed state to preserve key types
    const [fields, setFields] = useState<FieldMapping<T>[]>(generateFields);
    const [exportFilename, setExportFilename] = useState(filename);

    // Update fields when data changes
    useState(() => {
        if (data.length && !fields.length) {
            setFields(generateFields());
        }
    });

    // Handle field inclusion toggle
    const toggleField = (fieldSource: string, checked: boolean) => {
        setFields((prev) =>
            prev.map((field) =>
                field.source === fieldSource
                    ? { ...field, include: checked }
                    : field
            )
        );
    };

    // Handle field name change
    const updateFieldName = (fieldSource: string, name: string) => {
        setFields((prev) =>
            prev.map((field) =>
                field.source === fieldSource
                    ? { ...field, target: name }
                    : field
            )
        );
    };

    // Generate and download CSV
    const handleExport = () => {
        if (!data.length) return;

        // Filter and transform data based on field configuration
        const processedData = data.map((item) => {
            const newItem: Record<string, unknown> = {};

            // Process only included fields in the specified order
            fields
                .filter((field) => field.include)
                .forEach((field) => {
                    // If a custom formatter is provided, use it
                    if (field.formatter) {
                        newItem[field.target] = field.formatter(item);
                    }
                    // Handle nested paths with dot notation
                    else if (
                        typeof field.source === "string" &&
                        field.source.includes(".")
                    ) {
                        newItem[field.target] = getValueByPath(
                            item,
                            field.source
                        );
                    }
                    // Standard field access
                    else {
                        newItem[field.target] = item[field.source as keyof T];
                    }
                });

            return newItem;
        });

        // Convert to CSV
        const csv = Papa.unparse(processedData);

        // Create download
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            exportFilename.endsWith(".csv")
                ? exportFilename
                : `${exportFilename}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Export to CSV</DialogTitle>
                    <DialogDescription>
                        Select the fields to include in your CSV export,
                        customize their names, and drag to reorder.
                    </DialogDescription>
                </DialogHeader>

                <div className="my-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="filename">Filename</Label>
                        <Input
                            id="filename"
                            value={exportFilename}
                            onChange={(e) => setExportFilename(e.target.value)}
                            placeholder="export.csv"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Fields to Export (drag to reorder)</Label>

                        <ScrollArea className="h-[300px]">
                            <div className="overflow-hidden rounded-md border p-4">
                                <Reorder.Group
                                    axis="y"
                                    values={fields}
                                    onReorder={setFields}
                                    className="space-y-2"
                                >
                                    {fields.map((field) => (
                                        <Reorder.Item
                                            key={String(field.source)}
                                            value={field}
                                            style={{
                                                cursor: "grab",
                                            }}
                                        >
                                            <div className="mb-2 flex items-center gap-2 rounded-md border bg-background p-3">
                                                <div className="flex touch-none items-center">
                                                    <Icons.GripVertical className="h-5 w-5 text-muted-foreground" />
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`field-${String(field.source)}`}
                                                        checked={field.include}
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            toggleField(
                                                                field.source as string,
                                                                !!checked
                                                            )
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`field-${String(field.source)}`}
                                                        className="min-w-24"
                                                    >
                                                        {String(field.source)}
                                                    </Label>
                                                </div>

                                                <div className="flex flex-1 items-center">
                                                    <Input
                                                        value={field.target}
                                                        onChange={(e) =>
                                                            updateFieldName(
                                                                field.source as string,
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Field name in CSV"
                                                        disabled={
                                                            !field.include
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter>
                    <Button size="sm" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>

                    <Button size="sm" onClick={handleExport}>
                        Export CSV
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

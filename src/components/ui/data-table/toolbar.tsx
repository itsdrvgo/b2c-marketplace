"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import * as React from "react";
import { useDataTable } from "./data-table";
import { DataTableViewOptions } from "./view-options";

interface DataTableToolbarProps {
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    children?: React.ReactNode;
    filters?: React.ReactNode[];
    bulkActions?: React.ReactNode;
    searchDebounce?: number;
    disableSearch?: boolean;
}

export function DataTableToolbar<TData>({
    searchPlaceholder = "Search...",
    searchValue = "",
    onSearchChange,
    children,
    filters,
    bulkActions,
    searchDebounce = 500,
    disableSearch = false,
}: DataTableToolbarProps) {
    const { table } = useDataTable<TData>();
    const isFiltered = table.getState().columnFilters.length > 0;
    const [localSearchValue, setLocalSearchValue] = React.useState(searchValue);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            if (localSearchValue !== searchValue) {
                onSearchChange?.(localSearchValue);
            }
        }, searchDebounce);

        return () => clearTimeout(handler);
    }, [localSearchValue, onSearchChange, searchDebounce, searchValue]);

    // Update local value when prop changes (e.g., when reset)
    React.useEffect(() => {
        setLocalSearchValue(searchValue);
    }, [searchValue]);

    return (
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-1 flex-wrap items-center gap-2">
                {!disableSearch && (
                    <Input
                        placeholder={searchPlaceholder}
                        value={localSearchValue}
                        onChange={(event) =>
                            setLocalSearchValue(event.target.value)
                        }
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                onSearchChange?.(localSearchValue);
                            }
                        }}
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                )}

                {filters && filters.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        {filters.map((filter, index) => (
                            <React.Fragment key={index}>
                                {filter}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {children}

                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <X />
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-2">
                {bulkActions}
                <DataTableViewOptions />
            </div>
        </div>
    );
}

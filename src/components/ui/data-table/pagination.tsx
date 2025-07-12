"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronFirst,
    ChevronLast,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useDataTable } from "./data-table";

// Renamed from DataTablePaginationProps to PaginationProps
interface PaginationProps {
    currentPage: number;
    pageCount: number;
    pageSize: number;
    totalItems?: number;
    isLoading?: boolean;
    onPageChange: (page: number) => void;
    onRowsPerPageChange?: (value: number) => void;
}

// Renamed from DataTablePagination to Pagination
export function Pagination({
    currentPage,
    pageCount,
    pageSize,
    totalItems = 0,
    isLoading = false,
    onPageChange,
    onRowsPerPageChange,
}: PaginationProps) {
    const { table } = useDataTable();
    const selectedRowsCount = Object.keys(
        table.getState().rowSelection || {}
    ).length;

    return (
        <div className="flex flex-col items-center justify-between gap-2 py-4 md:flex-row">
            <div className="text-sm text-muted-foreground">
                {selectedRowsCount} of {totalItems} row(s) selected.
            </div>

            <div className="flex flex-col items-center gap-2 md:flex-row md:gap-6">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => {
                            onRowsPerPageChange?.(Number(value));
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pageSize.toString()} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((size) => (
                                <SelectItem key={size} value={size.toString()}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Page {currentPage} of {pageCount === 0 ? 1 : pageCount}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onPageChange(1)}
                            disabled={currentPage === 1 || isLoading}
                        >
                            <ChevronFirst className="h-4 w-4" />
                            <span className="sr-only">First page</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1 || isLoading}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Previous page</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage >= pageCount - 1 || isLoading}
                        >
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Next page</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onPageChange(pageCount - 1)}
                            disabled={currentPage >= pageCount - 1 || isLoading}
                        >
                            <ChevronLast className="h-4 w-4" />
                            <span className="sr-only">Last page</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import {
    getCoreRowModel,
    OnChangeFn,
    useReactTable,
    type ColumnDef,
    type RowSelectionState,
    type TableOptions,
    type Table as TableType,
} from "@tanstack/react-table";
import * as React from "react";

type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount?: number;
    isLoading?: boolean;
    pageSize?: number;
    manualPagination?: boolean;
    enableRowSelection?: boolean;
    state?: Partial<{
        pagination: {
            pageIndex: number;
            pageSize: number;
        };
        rowSelection: RowSelectionState;
        columnVisibility: Record<string, boolean>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        columnFilters: any[];
        globalFilter: string;
    }>;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
    getRowId?: (row: TData) => string;
    tableOptions?: Partial<TableOptions<TData>>;
};

type DataTableContextType<TData> = {
    table: TableType<TData>;
};

const DataTableContext = React.createContext<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DataTableContextType<any> | undefined
>(undefined);

export function useDataTable<TData>() {
    const context = React.useContext(DataTableContext);
    if (!context)
        throw new Error("useDataTable must be used within a DataTableProvider");

    return context as DataTableContextType<TData>;
}

function Root<TData, TValue>({
    columns,
    data,
    pageCount,
    manualPagination = false,
    enableRowSelection = false,
    state,
    onRowSelectionChange,
    getRowId,
    tableOptions,
    children,
}: React.PropsWithChildren<DataTableProps<TData, TValue>>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination,
        pageCount,
        enableRowSelection,
        onRowSelectionChange,
        getRowId,
        ...tableOptions,
        state: {
            ...state,
        },
        enableMultiRowSelection: true,
    });

    const contextValue = React.useMemo(() => ({ table }), [table]);

    return (
        <DataTableContext.Provider value={contextValue}>
            <div className="space-y-4">{children}</div>
        </DataTableContext.Provider>
    );
}

// Export namespace object with all components
export const DataTable = {
    Root,
    // Other components will be imported and re-exported in index.ts
};

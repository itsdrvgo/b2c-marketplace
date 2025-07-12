"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useDataTable } from "./data-table";

export interface BulkAction<TData> {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (
        selectedRowIds: string[],
        getSelectedRows?: () => TData[]
    ) => void;
    variant?: "default" | "destructive";
    disabled?: boolean;
    alert?: {
        title: string;
        description: string;
        confirm: string;
    };
}

interface DataTableBulkActionsProps<TData> {
    actions: BulkAction<TData>[];
    /**
     * Optional function to get all data items for the selected rows
     * Use this when you need access to the full data for selected rows across all pages
     */
    getSelectedRows?: (ids: string[]) => TData[];
}

export function DataTableBulkActions<TData>({
    actions,
    getSelectedRows,
}: DataTableBulkActionsProps<TData>) {
    const { table } = useDataTable<TData>();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedAction, setSelectedAction] =
        useState<BulkAction<TData> | null>(null);

    // Get the selection state which contains all selected rows across all pages
    const rowSelection = table.getState().rowSelection;
    const selectedRowIds = Object.keys(rowSelection).filter(
        (id) => rowSelection[id]
    );
    const selectedCount = selectedRowIds.length;

    // Don't render if no rows are selected
    if (selectedCount === 0) return null;

    // Current page's selected row data (may be partial if selections span multiple pages)
    const visibleSelectedRows = () =>
        table.getFilteredSelectedRowModel().rows.map((row) => row.original);

    // Function to get either all selected rows (if provided) or just the visible ones
    const getSelectedData = () => {
        if (getSelectedRows) return getSelectedRows(selectedRowIds);

        // Fall back to visible rows only
        return visibleSelectedRows();
    };

    // Handle clicking on an action dropdown item
    const handleActionClick = (action: BulkAction<TData>) => {
        if (action.alert) {
            setSelectedAction(action);
            setIsConfirmOpen(true);
        } else {
            // Execute immediately if no confirmation required
            action.onClick(selectedRowIds, getSelectedData);
        }
    };

    // Execute the selected action after confirmation
    const handleConfirm = () => {
        if (selectedAction) {
            selectedAction.onClick(selectedRowIds, getSelectedData);
            setIsConfirmOpen(false);
            setSelectedAction(null);
        }
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                    {selectedCount} selected
                </span>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                            Actions
                            <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="start">
                        {actions.map((action, index) => (
                            <DropdownMenuItem
                                key={index}
                                onClick={() => handleActionClick(action)}
                                className={
                                    action.variant === "destructive"
                                        ? "text-destructive focus:text-destructive"
                                        : ""
                                }
                                disabled={action.disabled}
                            >
                                {action.icon && <action.icon />}
                                {action.label}
                            </DropdownMenuItem>
                        ))}

                        {actions.length > 0 && <DropdownMenuSeparator />}

                        <DropdownMenuItem
                            onClick={() => table.resetRowSelection()}
                        >
                            Clear selection
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog
                open={isConfirmOpen}
                onOpenChange={(open) => {
                    setIsConfirmOpen(open);
                    if (!open) setSelectedAction(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {selectedAction?.alert?.title || "Confirm Action"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedAction?.alert?.description ||
                                `Are you sure you want to perform this action on ${selectedCount} items?`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirm}
                            className={
                                selectedAction?.variant === "destructive"
                                    ? "bg-destructive text-white hover:bg-destructive/90"
                                    : ""
                            }
                        >
                            {selectedAction?.alert?.confirm || "Confirm"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

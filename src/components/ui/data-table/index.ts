import { Content } from "./content";
import { DataTable as DataTableNamespace } from "./data-table";
import { Header } from "./header";
import { Pagination } from "./pagination";

export * from "./data-table";
export * from "./faceted-filter";
export * from "./toolbar";
export * from "./view-options";
export * from "./filters"; // Add this line to export filters
export * from "./bulk-actions"; // Add this line to export bulk actions
export * from "./export"; // Export the new export component

// Re-export the pagination component with the original name for backward compatibility
export { Pagination as DataTablePagination } from "./pagination";

// Create and export the full DataTable namespace with all its parts
export const DataTable = {
    ...DataTableNamespace,
    Content,
    Header,
    Pagination,
};

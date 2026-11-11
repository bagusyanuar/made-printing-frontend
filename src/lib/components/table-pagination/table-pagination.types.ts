export interface TablePaginationProps {
	/** Current active page (1-based index, bindable). */
	currentPage: number;
	/** Number of items displayed per page (bindable). */
	pageSize: number;
	/** Total count of items matching the current filter/query. */
	totalItems: number;
	/** Available page size choices in the dropdown. Defaults to `[5, 10, 20, 50]`. */
	pageSizeOptions?: number[];
	/** Plural/collective noun for items displayed in the info text (e.g. 'kategori', 'produk', 'transaksi'). Defaults to 'data'. */
	itemLabel?: string;
	/** Text for the page size select label. Defaults to 'Baris per halaman:'. */
	rowsPerPageLabel?: string;
	/** Additional CSS classes for the root wrapper. */
	class?: string;
	/** Callback invoked when the current page changes. */
	onPageChange?: (page: number) => void;
	/** Callback invoked when the page size changes. */
	onPageSizeChange?: (pageSize: number) => void;
}

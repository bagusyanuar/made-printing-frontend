export interface PaginationParams {
	page?: number;
	per_page?: number;
	search?: string;
}

export interface PaginationMeta {
	page: number;
	per_page: number;
	total_data: number;
	total_pages: number;
}

export interface PaginatedResult<T> {
	items: T[];
	meta: PaginationMeta;
}

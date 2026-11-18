import { axiosClient } from '$lib/shared/infrastructure/api/axios-client';
import { parseApiResponse, parseApiResponseWithMeta } from '$lib/shared/infrastructure/api/api-schema';
import { safeApiCall } from '$lib/shared/infrastructure/api/safe-api-call';
import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type { PaginatedResult } from '$lib/shared/domain/types/pagination';
import type {
	TicketOrder,
	SaveDraftTicketOrderInput,
	TicketOrderListParams
} from '../domain/ticket-order.entity';
import type { TicketOrderRepository } from '../domain/ticket-order.repository';
import { orderResponseDtoSchema, orderListResponseDtoSchema } from './ticket-order.validator';
import { mapOrderDtoToEntity, mapSaveDraftInputToDto } from './ticket-order.mapper';

export class TicketOrderRepositoryImpl implements TicketOrderRepository {
	async list(params?: TicketOrderListParams): Promise<Result<PaginatedResult<TicketOrder>, AppError>> {
		return safeApiCall(async () => {
			const queryParams: Record<string, string | number> = {};
			if (params?.page) queryParams.page = params.page;
			if (params?.limit) queryParams.limit = params.limit;
			if (params?.status) queryParams.status = params.status;
			if (params?.search) queryParams.search = params.search;

			const response = await axiosClient.get('/orders', { params: queryParams });
			const { data: dtos, meta } = parseApiResponseWithMeta(orderListResponseDtoSchema, response.data);
			const items = dtos.map(mapOrderDtoToEntity);

			return {
				items,
				meta: meta ?? {
					page: params?.page ?? 1,
					per_page: params?.limit ?? 10,
					total_data: items.length,
					total_pages: Math.max(1, Math.ceil(items.length / (params?.limit ?? 10)))
				}
			};
		});
	}

	async getById(id: string): Promise<Result<TicketOrder, AppError>> {
		return safeApiCall(async () => {
			const response = await axiosClient.get(`/orders/${id}`);
			const dto = parseApiResponse(orderResponseDtoSchema, response.data);
			return mapOrderDtoToEntity(dto);
		});
	}

	async saveDraft(input: SaveDraftTicketOrderInput): Promise<Result<TicketOrder, AppError>> {
		return safeApiCall(async () => {
			const payload = mapSaveDraftInputToDto(input);
			const response = await axiosClient.post('/orders/draft', payload);
			const dto = parseApiResponse(orderResponseDtoSchema, response.data);
			return mapOrderDtoToEntity(dto);
		});
	}

	async updateDraft(
		id: string,
		input: SaveDraftTicketOrderInput
	): Promise<Result<TicketOrder, AppError>> {
		return safeApiCall(async () => {
			const payload = mapSaveDraftInputToDto(input);
			const response = await axiosClient.put(`/orders/draft/${id}`, payload);
			const dto = parseApiResponse(orderResponseDtoSchema, response.data);
			return mapOrderDtoToEntity(dto);
		});
	}

	async submitToCashier(id: string): Promise<Result<TicketOrder, AppError>> {
		return safeApiCall(async () => {
			const response = await axiosClient.post(`/orders/${id}/submit`);
			const dto = parseApiResponse(orderResponseDtoSchema, response.data);
			return mapOrderDtoToEntity(dto);
		});
	}

	async cancel(id: string, reason: string): Promise<Result<TicketOrder, AppError>> {
		return safeApiCall(async () => {
			const response = await axiosClient.post(`/orders/${id}/cancel`, { reason });
			const dto = parseApiResponse(orderResponseDtoSchema, response.data);
			return mapOrderDtoToEntity(dto);
		});
	}
}

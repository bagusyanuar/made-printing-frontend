import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type { PaginatedResult } from '$lib/shared/domain/types/pagination';
import type {
	TicketOrder,
	SaveDraftTicketOrderInput,
	TicketOrderListParams
} from './ticket-order.entity';

export interface TicketOrderRepository {
	list(params?: TicketOrderListParams): Promise<Result<PaginatedResult<TicketOrder>, AppError>>;
	getById(id: string): Promise<Result<TicketOrder, AppError>>;
	saveDraft(input: SaveDraftTicketOrderInput): Promise<Result<TicketOrder, AppError>>;
	updateDraft(id: string, input: SaveDraftTicketOrderInput): Promise<Result<TicketOrder, AppError>>;
	submitToCashier(id: string): Promise<Result<TicketOrder, AppError>>;
	cancel(id: string, reason: string): Promise<Result<TicketOrder, AppError>>;
}

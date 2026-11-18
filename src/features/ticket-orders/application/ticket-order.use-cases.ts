import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type { PaginatedResult } from '$lib/shared/domain/types/pagination';
import type {
	TicketOrder,
	SaveDraftTicketOrderInput,
	TicketOrderListParams
} from '../domain/ticket-order.entity';
import type { TicketOrderRepository } from '../domain/ticket-order.repository';

export class GetTicketOrdersUseCase {
	constructor(private readonly repository: TicketOrderRepository) {}

	async execute(params?: TicketOrderListParams): Promise<Result<PaginatedResult<TicketOrder>, AppError>> {
		return this.repository.list(params);
	}
}

export class GetTicketOrderByIdUseCase {
	constructor(private readonly repository: TicketOrderRepository) {}

	async execute(id: string): Promise<Result<TicketOrder, AppError>> {
		return this.repository.getById(id);
	}
}

export class SaveDraftTicketOrderUseCase {
	constructor(private readonly repository: TicketOrderRepository) {}

	async execute(input: SaveDraftTicketOrderInput): Promise<Result<TicketOrder, AppError>> {
		return this.repository.saveDraft(input);
	}
}

export class UpdateDraftTicketOrderUseCase {
	constructor(private readonly repository: TicketOrderRepository) {}

	async execute(
		id: string,
		input: SaveDraftTicketOrderInput
	): Promise<Result<TicketOrder, AppError>> {
		return this.repository.updateDraft(id, input);
	}
}

export class SubmitTicketOrderToCashierUseCase {
	constructor(private readonly repository: TicketOrderRepository) {}

	async execute(id: string): Promise<Result<TicketOrder, AppError>> {
		return this.repository.submitToCashier(id);
	}
}

export class CancelTicketOrderUseCase {
	constructor(private readonly repository: TicketOrderRepository) {}

	async execute(id: string, reason: string): Promise<Result<TicketOrder, AppError>> {
		return this.repository.cancel(id, reason);
	}
}

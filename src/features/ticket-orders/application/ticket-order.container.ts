import { MOCK_FLAGS } from '$lib/shared/infrastructure/di/mock-config';
import type { TicketOrderRepository } from '../domain/ticket-order.repository';
import { TicketOrderRepositoryImpl } from '../infrastructure/ticket-order.repository.impl';
import { TicketOrderRepositoryMock } from '../infrastructure/ticket-order.repository.mock';

const ticketOrderRepositoryImpl = new TicketOrderRepositoryImpl();
const ticketOrderRepositoryMock = new TicketOrderRepositoryMock();

export const ticketOrderRepositoryInstance: TicketOrderRepository =
	MOCK_FLAGS.ticketOrders ? ticketOrderRepositoryMock : ticketOrderRepositoryImpl;

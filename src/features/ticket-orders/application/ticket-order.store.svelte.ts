const isBrowser = typeof window !== 'undefined';
import type {
	TicketOrder,
	TicketOrderItemInput,
	TicketOrderCustomerType,
	SaveDraftTicketOrderInput
} from '../domain/ticket-order.entity';
import {
	GetTicketOrdersUseCase,
	GetTicketOrderByIdUseCase,
	SaveDraftTicketOrderUseCase,
	UpdateDraftTicketOrderUseCase,
	SubmitTicketOrderToCashierUseCase,
	CancelTicketOrderUseCase
} from './ticket-order.use-cases';
import { ticketOrderRepositoryInstance } from './ticket-order.container';

export type TicketStatusFilterTab = 'all' | 'pending' | 'submitted';

const STORAGE_KEY_CART = 'ticket_order_active_cart';
const STORAGE_KEY_META = 'ticket_order_active_metadata';

export class TicketOrderStore {
	#getOrdersUseCase = new GetTicketOrdersUseCase(ticketOrderRepositoryInstance);
	#getOrderByIdUseCase = new GetTicketOrderByIdUseCase(ticketOrderRepositoryInstance);
	#saveDraftUseCase = new SaveDraftTicketOrderUseCase(ticketOrderRepositoryInstance);
	#updateDraftUseCase = new UpdateDraftTicketOrderUseCase(ticketOrderRepositoryInstance);
	#submitToCashierUseCase = new SubmitTicketOrderToCashierUseCase(ticketOrderRepositoryInstance);
	#cancelUseCase = new CancelTicketOrderUseCase(ticketOrderRepositoryInstance);

	// List State
	items = $state<TicketOrder[]>([]);
	isLoading = $state(false);
	error = $state<string | null>(null);

	searchQuery = $state('');
	statusTab = $state<TicketStatusFilterTab>('pending');
	page = $state(1);
	limit = $state(10);
	totalData = $state(0);
	totalPages = $state(1);

	// Summary stats
	stats = $derived.by(() => {
		const total = this.items.length;
		const pendingDraft = this.items.filter((i) => i.status === 'DRAFT').length;
		const submitted = this.items.filter(
			(i) => i.status === 'PENDING_PAYMENT' || i.status === 'IN_PRODUCTION'
		).length;
		const readyForPickup = this.items.filter((i) => i.status === 'READY_FOR_PICKUP').length;
		const completed = this.items.filter((i) => i.status === 'COMPLETED').length;

		return {
			total,
			pendingDraft,
			submitted,
			readyForPickup,
			completed
		};
	});

	// Designer Active Cart State (Auto-save to localStorage)
	activeEditTicketId = $state<string | null>(null);
	activeCustomerType = $state<TicketOrderCustomerType>('end_user');
	activeCustomerName = $state('Walk-in Customer');
	activeCustomerPhone = $state('');
	activeResellerId = $state<string | null>(null);
	activeNotes = $state('');
	activeDeadline = $state<string | null>(null);
	activeCartItems = $state<TicketOrderItemInput[]>([]);

	totalCartAreaM2 = $derived.by(() => {
		return this.activeCartItems.reduce((acc, item) => {
			const uom = item.uom.toLowerCase();
			if (uom === 'm2' || uom === 'square_meter') {
				const l = item.lengthM ?? 0;
				const w = item.widthM ?? 0;
				return acc + l * w * item.quantity;
			}
			return acc;
		}, 0);
	});

	totalCartItemsCount = $derived.by(() => {
		return this.activeCartItems.reduce((acc, item) => acc + item.quantity, 0);
	});

	// Load list of ticket orders
	async load(): Promise<void> {
		this.isLoading = true;
		this.error = null;

		let statusParam: string | undefined;
		if (this.statusTab === 'pending') {
			statusParam = 'DRAFT';
		} else if (this.statusTab === 'submitted') {
			statusParam = 'PENDING_PAYMENT,IN_PRODUCTION,READY_FOR_PICKUP,COMPLETED,CANCELLED';
		}

		const result = await this.#getOrdersUseCase.execute({
			page: this.page,
			limit: this.limit,
			status: statusParam,
			search: this.searchQuery.trim() || undefined
		});

		this.isLoading = false;

		if (result.success) {
			this.items = result.data.items;
			this.totalData = result.data.meta.total_data;
			this.totalPages = result.data.meta.total_pages;
		} else {
			this.error = result.error.message;
		}
	}

	async getById(id: string): Promise<TicketOrder | null> {
		this.isLoading = true;
		this.error = null;
		const result = await this.#getOrderByIdUseCase.execute(id);
		this.isLoading = false;

		if (result.success) {
			return result.data;
		} else {
			this.error = result.error.message;
			return null;
		}
	}

	async submitToCashier(id: string): Promise<boolean> {
		this.isLoading = true;
		this.error = null;
		const result = await this.#submitToCashierUseCase.execute(id);
		this.isLoading = false;

		if (result.success) {
			this.items = this.items.map((i) => (i.id === id ? result.data : i));
			return true;
		} else {
			this.error = result.error.message;
			return false;
		}
	}

	async cancel(id: string, reason: string): Promise<boolean> {
		this.isLoading = true;
		this.error = null;
		const result = await this.#cancelUseCase.execute(id, reason);
		this.isLoading = false;

		if (result.success) {
			this.items = this.items.map((i) => (i.id === id ? result.data : i));
			return true;
		} else {
			this.error = result.error.message;
			return false;
		}
	}

	// Active Cart Operations
	addItemToCart(item: TicketOrderItemInput): void {
		this.activeCartItems = [...this.activeCartItems, item];
		this.persistCartToStorage();
	}

	updateCartItem(index: number, updated: TicketOrderItemInput): void {
		if (index >= 0 && index < this.activeCartItems.length) {
			const next = [...this.activeCartItems];
			next[index] = updated;
			this.activeCartItems = next;
			this.persistCartToStorage();
		}
	}

	removeCartItem(index: number): void {
		this.activeCartItems = this.activeCartItems.filter((_, idx) => idx !== index);
		this.persistCartToStorage();
	}

	clearCart(): void {
		this.activeEditTicketId = null;
		this.activeCustomerType = 'end_user';
		this.activeCustomerName = 'Walk-in Customer';
		this.activeCustomerPhone = '';
		this.activeResellerId = null;
		this.activeNotes = '';
		this.activeDeadline = null;
		this.activeCartItems = [];

		if (isBrowser) {
			try {
				localStorage.removeItem(STORAGE_KEY_CART);
				localStorage.removeItem(STORAGE_KEY_META);
			} catch {
				// ignore
			}
		}
	}

	loadDraftIntoCart(ticket: TicketOrder): void {
		this.activeEditTicketId = ticket.id;
		this.activeCustomerType = ticket.customerType;
		this.activeCustomerName = ticket.customerName;
		this.activeCustomerPhone = ticket.customerPhone;
		this.activeResellerId = ticket.resellerId ?? null;
		this.activeNotes = ticket.notes;
		this.activeDeadline = ticket.deadline ?? null;
		this.activeCartItems = ticket.items.map((item) => ({
			productVariantId: item.productVariantId,
			productName: item.productName,
			variantName: item.variantName,
			categoryId: item.categoryId,
			categoryName: item.categoryName,
			uom: item.uom,
			quantity: item.quantity,
			lengthM: item.lengthM,
			widthM: item.widthM,
			designFileUrl: item.designFileUrl,
			productionNotes: item.productionNotes,
			finishingIds: item.finishingIds,
			finishingNames: item.finishingNames
		}));
	}

	initCartFromStorage(): void {
		if (!isBrowser) return;
		try {
			const savedCart = localStorage.getItem(STORAGE_KEY_CART);
			if (savedCart) {
				const parsed = JSON.parse(savedCart);
				if (Array.isArray(parsed)) {
					this.activeCartItems = parsed;
				}
			}

			const savedMeta = localStorage.getItem(STORAGE_KEY_META);
			if (savedMeta) {
				const meta = JSON.parse(savedMeta);
				if (meta.customerName) this.activeCustomerName = meta.customerName;
				if (meta.customerPhone) this.activeCustomerPhone = meta.customerPhone;
				if (meta.customerType) this.activeCustomerType = meta.customerType;
				if (meta.resellerId) this.activeResellerId = meta.resellerId;
				if (meta.notes) this.activeNotes = meta.notes;
				if (meta.deadline) this.activeDeadline = meta.deadline;
			}
		} catch {
			// ignore local storage errors
		}
	}

	persistCartToStorage(): void {
		if (!isBrowser) return;
		try {
			localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(this.activeCartItems));
			localStorage.setItem(
				STORAGE_KEY_META,
				JSON.stringify({
					customerType: this.activeCustomerType,
					customerName: this.activeCustomerName,
					customerPhone: this.activeCustomerPhone,
					resellerId: this.activeResellerId,
					notes: this.activeNotes,
					deadline: this.activeDeadline
				})
			);
		} catch {
			// ignore local storage errors
		}
	}

	async saveCurrentDraft(): Promise<TicketOrder | null> {
		if (this.activeCartItems.length === 0) return null;

		this.isLoading = true;
		this.error = null;

		const payload: SaveDraftTicketOrderInput = {
			customerType: this.activeCustomerType,
			customerName: this.activeCustomerName.trim() || 'Walk-in Customer',
			customerPhone: this.activeCustomerPhone.trim() || '-',
			resellerId: this.activeCustomerType === 'reseller' ? this.activeResellerId : null,
			notes: this.activeNotes.trim(),
			deadline: this.activeDeadline,
			items: this.activeCartItems
		};

		let result;
		if (this.activeEditTicketId) {
			result = await this.#updateDraftUseCase.execute(this.activeEditTicketId, payload);
		} else {
			result = await this.#saveDraftUseCase.execute(payload);
		}

		this.isLoading = false;

		if (result.success) {
			this.clearCart();
			return result.data;
		} else {
			this.error = result.error.message;
			return null;
		}
	}

	async submitCurrentToCashier(): Promise<TicketOrder | null> {
		const saved = await this.saveCurrentDraft();
		if (!saved) return null;

		this.isLoading = true;
		const submitResult = await this.#submitToCashierUseCase.execute(saved.id);
		this.isLoading = false;

		if (submitResult.success) {
			return submitResult.data;
		} else {
			this.error = submitResult.error.message;
			return null;
		}
	}
}

export const ticketOrderStore = new TicketOrderStore();

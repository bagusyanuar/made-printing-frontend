import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import { Result as ResultClass } from '$lib/shared/domain/types/result';
import { NotFoundError } from '$lib/shared/domain/errors/app-error';
import type { PaginatedResult } from '$lib/shared/domain/types/pagination';
import type {
	TicketOrder,
	SaveDraftTicketOrderInput,
	TicketOrderListParams,
	TicketOrderItem
} from '../domain/ticket-order.entity';
import { formatDimensionText, calculateTotalArea } from '../domain/ticket-order.entity';
import type { TicketOrderRepository } from '../domain/ticket-order.repository';

const INITIAL_TICKETS: TicketOrder[] = [
	{
		id: 'tkt-001',
		jobNumber: 'TKT-202611-0042',
		invoiceNumber: null,
		designerId: 'des-01',
		designerName: 'Bagus (Meja 1)',
		status: 'DRAFT',
		customerType: 'end_user',
		customerName: 'CV Berkah Mandiri',
		customerPhone: '081298765432',
		resellerId: null,
		resellerName: null,
		notes: 'Warna tolong disamakan dengan sample fisik kartu nama lama',
		deadline: '2026-11-18T17:00:00.000Z',
		cancelReason: null,
		cancelledAt: null,
		invoicedAt: null,
		items: [
			{
				id: 'tkt-item-1',
				productVariantId: 'var-flexy-340',
				productName: 'Banner Flexy Outdoor 340g',
				variantName: 'Standar Outdoor',
				uom: 'm2',
				quantity: 2,
				lengthM: 3,
				widthM: 1,
				dimensionText: '3 × 1 m (3.00 m²)',
				designFileUrl: 'https://files.made-printing.com/spk/banner-berkah.pdf',
				productionNotes: 'Mata ayam 4 sudut, lebih bahan 2cm',
				finishingIds: ['fin-mata-ayam']
			},
			{
				id: 'tkt-item-2',
				productVariantId: 'var-vinyl-a3',
				productName: 'Sticker Vinyl A3+ Kiss Cut',
				variantName: 'Vinyl Glossy',
				uom: 'lembar',
				quantity: 5,
				lengthM: null,
				widthM: null,
				dimensionText: '5 Lembar (A3+)',
				designFileUrl: 'https://files.made-printing.com/spk/stiker-label.ai',
				productionNotes: 'Laminasi doff dingin & kiss cut',
				finishingIds: ['fin-lam-doff', 'fin-kiss-cut']
			}
		],
		totalItems: 7,
		totalAreaM2: 6.0,
		createdAt: '2026-11-18T13:15:00.000Z',
		updatedAt: '2026-11-18T13:20:00.000Z'
	},
	{
		id: 'tkt-002',
		jobNumber: 'TKT-202611-0041',
		invoiceNumber: 'INV-202611-0089',
		designerId: 'des-02',
		designerName: 'Deni (Meja 2)',
		status: 'PENDING_PAYMENT',
		customerType: 'end_user',
		customerName: 'Warung Bu Trisno',
		customerPhone: '085712345678',
		resellerId: null,
		resellerName: null,
		notes: 'Pesanan spanduk menu pecel lele baru, butuh cepat sebelum maghrib',
		deadline: '2026-11-18T16:00:00.000Z',
		cancelReason: null,
		cancelledAt: null,
		invoicedAt: null,
		items: [
			{
				id: 'tkt-item-3',
				productVariantId: 'var-flexy-280',
				productName: 'Spanduk Flexy 280g',
				variantName: 'Ekonomis',
				uom: 'm2',
				quantity: 1,
				lengthM: 2.5,
				widthM: 1,
				dimensionText: '2.5 × 1 m (2.50 m²)',
				designFileUrl: 'https://files.made-printing.com/spk/pecel-lele.jpg',
				productionNotes: 'Seaming keliling tanpa mata ayam',
				finishingIds: ['fin-seaming']
			}
		],
		totalItems: 1,
		totalAreaM2: 2.5,
		createdAt: '2026-11-18T12:00:00.000Z',
		updatedAt: '2026-11-18T12:10:00.000Z'
	},
	{
		id: 'tkt-003',
		jobNumber: 'TKT-202611-0040',
		invoiceNumber: 'INV-202611-0088',
		designerId: 'des-01',
		designerName: 'Bagus (Meja 1)',
		status: 'IN_PRODUCTION',
		customerType: 'reseller',
		customerName: 'Mitra Grafika Mandiri',
		customerPhone: '081399887766',
		resellerId: 'reseller-001',
		resellerName: 'Mitra Grafika Mandiri',
		notes: 'Order reseller berkala, packing plastik wrap rapat',
		deadline: '2026-11-19T12:00:00.000Z',
		cancelReason: null,
		cancelledAt: null,
		invoicedAt: '2026-11-18T11:00:00.000Z',
		items: [
			{
				id: 'tkt-item-4',
				productVariantId: 'var-art-paper-150',
				productName: 'Brosur Art Paper 150g',
				variantName: 'Cetak 4/4 Bolak Balik',
				uom: 'lembar',
				quantity: 300,
				lengthM: null,
				widthM: null,
				dimensionText: '300 Lembar (A3+)',
				designFileUrl: 'https://files.made-printing.com/spk/brosur-reseller.pdf',
				productionNotes: 'Potong jadi A4 (1 lembar jadi 2 pcs)',
				finishingIds: ['fin-potong']
			}
		],
		totalItems: 300,
		totalAreaM2: 0,
		createdAt: '2026-11-18T10:30:00.000Z',
		updatedAt: '2026-11-18T11:00:00.000Z'
	},
	{
		id: 'tkt-004',
		jobNumber: 'TKT-202611-0039',
		invoiceNumber: 'INV-202611-0085',
		designerId: 'des-02',
		designerName: 'Deni (Meja 2)',
		status: 'READY_FOR_PICKUP',
		customerType: 'end_user',
		customerName: 'Sanggar Seni Budaya',
		customerPhone: '081822334455',
		resellerId: null,
		resellerName: null,
		notes: 'Barang sudah masuk rak Bin A-03 siap diambil',
		deadline: '2026-11-18T11:00:00.000Z',
		cancelReason: null,
		cancelledAt: null,
		invoicedAt: '2026-11-18T09:00:00.000Z',
		items: [
			{
				id: 'tkt-item-5',
				productVariantId: 'var-albatros',
				productName: 'Roll Up Banner Albatros Eco Indoor',
				variantName: 'Indoor High Res',
				uom: 'm2',
				quantity: 2,
				lengthM: 0.6,
				widthM: 1.6,
				dimensionText: '0.6 × 1.6 m (0.96 m²)',
				designFileUrl: 'https://files.made-printing.com/spk/rollup-sanggar.tif',
				productionNotes: 'Laminasi doff dingin + pasang rangka roll up 60x160',
				finishingIds: ['fin-lam-doff', 'fin-rangka-rollup']
			}
		],
		totalItems: 2,
		totalAreaM2: 1.92,
		createdAt: '2026-11-18T08:30:00.000Z',
		updatedAt: '2026-11-18T10:45:00.000Z'
	},
	{
		id: 'tkt-005',
		jobNumber: 'TKT-202611-0038',
		invoiceNumber: 'INV-202611-0080',
		designerId: 'des-01',
		designerName: 'Bagus (Meja 1)',
		status: 'COMPLETED',
		customerType: 'end_user',
		customerName: 'Kedai Kopi Bahagia',
		customerPhone: '081233445566',
		resellerId: null,
		resellerName: null,
		notes: 'Pesanan diambil customer kemarin malam, pembayaran lunas',
		deadline: '2026-11-17T18:00:00.000Z',
		cancelReason: null,
		cancelledAt: null,
		invoicedAt: '2026-11-17T15:00:00.000Z',
		items: [
			{
				id: 'tkt-item-6',
				productVariantId: 'var-dtf-film',
				productName: 'Sablon DTF Roll Film',
				variantName: 'Lebar 60cm',
				uom: 'm_lari',
				quantity: 4,
				lengthM: 4,
				widthM: null,
				dimensionText: '4 m lari',
				designFileUrl: 'https://files.made-printing.com/spk/dtf-kaos.png',
				productionNotes: 'Curing powder kristal standar',
				finishingIds: []
			}
		],
		totalItems: 4,
		totalAreaM2: 0,
		createdAt: '2026-11-17T14:00:00.000Z',
		updatedAt: '2026-11-17T18:30:00.000Z'
	},
	{
		id: 'tkt-006',
		jobNumber: 'TKT-202611-0037',
		invoiceNumber: null,
		designerId: 'des-02',
		designerName: 'Deni (Meja 2)',
		status: 'CANCELLED',
		customerType: 'end_user',
		customerName: 'Ahmad Faisal',
		customerPhone: '081987654321',
		resellerId: null,
		resellerName: null,
		notes: 'Customer belum siap file',
		deadline: '2026-11-17T16:00:00.000Z',
		cancelReason: 'File resolusi gambar di bawah 72 DPI (pecah parah), customer membatalkan',
		cancelledAt: '2026-11-17T15:30:00.000Z',
		invoicedAt: null,
		items: [
			{
				id: 'tkt-item-7',
				productVariantId: 'var-flexy-korcin',
				productName: 'Backdrop Flexy Korcin 440g',
				variantName: 'Korea Tebal',
				uom: 'm2',
				quantity: 1,
				lengthM: 6,
				widthM: 3,
				dimensionText: '6 × 3 m (18.00 m²)',
				designFileUrl: null,
				productionNotes: 'Kolong atas bawah untuk pipa 2 inch',
				finishingIds: ['fin-kolong']
			}
		],
		totalItems: 1,
		totalAreaM2: 18.0,
		createdAt: '2026-11-17T15:00:00.000Z',
		updatedAt: '2026-11-17T15:30:00.000Z'
	}
];

export class TicketOrderRepositoryMock implements TicketOrderRepository {
	#items: TicketOrder[] = JSON.parse(JSON.stringify(INITIAL_TICKETS));
	#sequence = 43;

	async list(params?: TicketOrderListParams): Promise<Result<PaginatedResult<TicketOrder>, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 150));

		let filtered = [...this.#items];

		// Filter by status
		if (params?.status && params.status.trim() !== '') {
			const statuses = params.status.split(',').map((s) => s.trim().toUpperCase());
			filtered = filtered.filter((item) => statuses.includes(item.status));
		}

		// Filter by search query
		if (params?.search && params.search.trim() !== '') {
			const q = params.search.toLowerCase().trim();
			filtered = filtered.filter(
				(item) =>
					item.jobNumber.toLowerCase().includes(q) ||
					item.customerName.toLowerCase().includes(q) ||
					item.customerPhone.toLowerCase().includes(q) ||
					item.notes.toLowerCase().includes(q) ||
					item.items.some(
						(i) =>
							i.productName.toLowerCase().includes(q) ||
							(i.productionNotes && i.productionNotes.toLowerCase().includes(q))
					)
			);
		}

		// Sort newest first
		filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

		const page = params?.page ?? 1;
		const limit = params?.limit ?? 10;
		const totalData = filtered.length;
		const totalPages = Math.max(1, Math.ceil(totalData / limit));
		const startIndex = (page - 1) * limit;
		const paginated = filtered.slice(startIndex, startIndex + limit);

		return ResultClass.ok({
			items: paginated,
			meta: {
				page,
				per_page: limit,
				total_data: totalData,
				total_pages: totalPages
			}
		});
	}

	async getById(id: string): Promise<Result<TicketOrder, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 80));
		const found = this.#items.find((i) => i.id === id);
		if (!found) {
			return ResultClass.error(new NotFoundError(`Tiket pesanan dengan ID "${id}" tidak ditemukan`));
		}
		return ResultClass.ok(JSON.parse(JSON.stringify(found)));
	}

	async saveDraft(input: SaveDraftTicketOrderInput): Promise<Result<TicketOrder, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 200));

		const id = `tkt-${Date.now()}`;
		const jobNumber = `TKT-202611-${String(this.#sequence++).padStart(4, '0')}`;
		const now = new Date().toISOString();

		const mappedItems: TicketOrderItem[] = input.items.map((item, idx) => ({
			id: `item-${Date.now()}-${idx}`,
			productVariantId: item.productVariantId,
			productName: item.productName,
			variantName: item.variantName,
			categoryId: item.categoryId,
			categoryName: item.categoryName,
			uom: item.uom,
			quantity: item.quantity,
			lengthM: item.lengthM ?? null,
			widthM: item.widthM ?? null,
			dimensionText: formatDimensionText(item.uom, item.lengthM, item.widthM, item.quantity),
			designFileUrl: item.designFileUrl ?? null,
			productionNotes: item.productionNotes ?? null,
			finishingIds: item.finishingIds ?? [],
			finishingNames: item.finishingNames ?? []
		}));

		const totalItems = mappedItems.reduce((acc, i) => acc + i.quantity, 0);
		const totalAreaM2 = calculateTotalArea(mappedItems);

		const newOrder: TicketOrder = {
			id,
			jobNumber,
			invoiceNumber: null,
			designerId: input.designerId ?? 'des-01',
			designerName: 'Desainer Meja 1',
			status: 'DRAFT',
			customerType: input.customerType,
			customerName: input.customerName.trim(),
			customerPhone: input.customerPhone.trim(),
			resellerId: input.customerType === 'reseller' ? input.resellerId ?? null : null,
			resellerName: null,
			notes: input.notes.trim(),
			deadline: input.deadline ?? null,
			cancelReason: null,
			cancelledAt: null,
			invoicedAt: null,
			items: mappedItems,
			totalItems,
			totalAreaM2,
			createdAt: now,
			updatedAt: now
		};

		this.#items.unshift(newOrder);
		return ResultClass.ok(JSON.parse(JSON.stringify(newOrder)));
	}

	async updateDraft(
		id: string,
		input: SaveDraftTicketOrderInput
	): Promise<Result<TicketOrder, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 200));

		const index = this.#items.findIndex((i) => i.id === id);
		if (index === -1) {
			return ResultClass.error(new NotFoundError(`Tiket pesanan dengan ID "${id}" tidak ditemukan`));
		}

		const existing = this.#items[index];
		const now = new Date().toISOString();

		const mappedItems: TicketOrderItem[] = input.items.map((item, idx) => ({
			id: `item-${Date.now()}-${idx}`,
			productVariantId: item.productVariantId,
			productName: item.productName,
			variantName: item.variantName,
			categoryId: item.categoryId,
			categoryName: item.categoryName,
			uom: item.uom,
			quantity: item.quantity,
			lengthM: item.lengthM ?? null,
			widthM: item.widthM ?? null,
			dimensionText: formatDimensionText(item.uom, item.lengthM, item.widthM, item.quantity),
			designFileUrl: item.designFileUrl ?? null,
			productionNotes: item.productionNotes ?? null,
			finishingIds: item.finishingIds ?? [],
			finishingNames: item.finishingNames ?? []
		}));

		const totalItems = mappedItems.reduce((acc, i) => acc + i.quantity, 0);
		const totalAreaM2 = calculateTotalArea(mappedItems);

		const updated: TicketOrder = {
			...existing,
			customerType: input.customerType,
			customerName: input.customerName.trim(),
			customerPhone: input.customerPhone.trim(),
			resellerId: input.customerType === 'reseller' ? input.resellerId ?? null : null,
			notes: input.notes.trim(),
			deadline: input.deadline ?? null,
			items: mappedItems,
			totalItems,
			totalAreaM2,
			updatedAt: now
		};

		this.#items[index] = updated;
		return ResultClass.ok(JSON.parse(JSON.stringify(updated)));
	}

	async submitToCashier(id: string): Promise<Result<TicketOrder, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 150));

		const index = this.#items.findIndex((i) => i.id === id);
		if (index === -1) {
			return ResultClass.error(new NotFoundError(`Tiket pesanan dengan ID "${id}" tidak ditemukan`));
		}

		const existing = this.#items[index];
		const updated: TicketOrder = {
			...existing,
			status: 'PENDING_PAYMENT',
			updatedAt: new Date().toISOString()
		};

		this.#items[index] = updated;
		return ResultClass.ok(JSON.parse(JSON.stringify(updated)));
	}

	async cancel(id: string, reason: string): Promise<Result<TicketOrder, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 150));

		const index = this.#items.findIndex((i) => i.id === id);
		if (index === -1) {
			return ResultClass.error(new NotFoundError(`Tiket pesanan dengan ID "${id}" tidak ditemukan`));
		}

		const existing = this.#items[index];
		const now = new Date().toISOString();
		const updated: TicketOrder = {
			...existing,
			status: 'CANCELLED',
			cancelReason: reason.trim(),
			cancelledAt: now,
			updatedAt: now
		};

		this.#items[index] = updated;
		return ResultClass.ok(JSON.parse(JSON.stringify(updated)));
	}
}

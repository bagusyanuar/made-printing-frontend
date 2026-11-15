import type {
	ProductAttribute,
	ProductAttributeInput,
	ProductAttributeVariantInput
} from '../domain/attribute-variant.entity';
import type { AttributeVariantUseCases } from './attribute-variant.use-cases';
import { attributeVariantUseCases } from './attribute-variant.use-cases';

export class AttributeVariantStore {
	#useCases: AttributeVariantUseCases;

	items = $state<ProductAttribute[]>([]);
	selectedAttributeId = $state<string | null>(null);
	isLoading = $state(false);
	error = $state<string | null>(null);

	searchQuery = $state('');
	statusFilter = $state<'all' | 'active' | 'inactive'>('all');

	filteredItems = $derived.by(() => {
		const q = this.searchQuery.trim().toLowerCase();
		return this.items
			.filter((item) => {
				const matchesSearch =
					!q ||
					item.name.toLowerCase().includes(q) ||
					item.code.toLowerCase().includes(q) ||
					(item.description && item.description.toLowerCase().includes(q)) ||
					item.variants.some(
						(v) =>
							v.name.toLowerCase().includes(q) ||
							v.code.toLowerCase().includes(q) ||
							(v.description && v.description.toLowerCase().includes(q))
					);

				const matchesStatus =
					this.statusFilter === 'all' ||
					(this.statusFilter === 'active' ? item.isActive : !item.isActive);

				return matchesSearch && matchesStatus;
			})
			.sort((a, b) => a.displayOrder - b.displayOrder);
	});

	selectedAttribute = $derived.by(() => {
		if (this.selectedAttributeId) {
			const found = this.items.find((a) => a.id === this.selectedAttributeId);
			if (found) return found;
		}
		return this.filteredItems[0] ?? null;
	});

	constructor(useCases: AttributeVariantUseCases = attributeVariantUseCases) {
		this.#useCases = useCases;
	}

	async load(): Promise<void> {
		this.isLoading = true;
		this.error = null;
		const result = await this.#useCases.list();
		this.isLoading = false;

		if (result.success) {
			this.items = result.data;
			if (!this.selectedAttributeId && this.items.length > 0) {
				this.selectedAttributeId = this.items[0].id;
			}
		} else {
			this.error = result.error.message;
		}
	}

	selectAttribute(id: string): void {
		this.selectedAttributeId = id;
	}

	async createAttribute(input: ProductAttributeInput): Promise<boolean> {
		this.error = null;
		const result = await this.#useCases.createAttribute(input);

		if (result.success) {
			this.items = [...this.items, result.data];
			this.selectedAttributeId = result.data.id;
			return true;
		}

		this.error = result.error.message;
		return false;
	}

	async updateAttribute(id: string, input: ProductAttributeInput): Promise<boolean> {
		this.error = null;
		const result = await this.#useCases.updateAttribute(id, input);

		if (result.success) {
			this.items = this.items.map((item) => (item.id === id ? result.data : item));
			return true;
		}

		this.error = result.error.message;
		return false;
	}

	async deleteAttribute(id: string): Promise<boolean> {
		this.error = null;
		const result = await this.#useCases.deleteAttribute(id);

		if (result.success) {
			this.items = this.items.filter((item) => item.id !== id);
			if (this.selectedAttributeId === id) {
				this.selectedAttributeId = this.items[0]?.id ?? null;
			}
			return true;
		}

		this.error = result.error.message;
		return false;
	}

	async createVariant(
		attributeId: string,
		input: ProductAttributeVariantInput
	): Promise<boolean> {
		this.error = null;
		const result = await this.#useCases.createVariant(attributeId, input);

		if (result.success) {
			this.items = this.items.map((attr) => {
				if (attr.id === attributeId) {
					return {
						...attr,
						variants: [...attr.variants, result.data].sort(
							(a, b) => a.displayOrder - b.displayOrder
						)
					};
				}
				return attr;
			});
			return true;
		}

		this.error = result.error.message;
		return false;
	}

	async updateVariant(id: string, input: ProductAttributeVariantInput): Promise<boolean> {
		this.error = null;
		const result = await this.#useCases.updateVariant(id, input);

		if (result.success) {
			this.items = this.items.map((attr) => {
				if (attr.variants.some((v) => v.id === id)) {
					return {
						...attr,
						variants: attr.variants
							.map((v) => (v.id === id ? result.data : v))
							.sort((a, b) => a.displayOrder - b.displayOrder)
					};
				}
				return attr;
			});
			return true;
		}

		this.error = result.error.message;
		return false;
	}

	async deleteVariant(id: string): Promise<boolean> {
		this.error = null;
		const result = await this.#useCases.deleteVariant(id);

		if (result.success) {
			this.items = this.items.map((attr) => ({
				...attr,
				variants: attr.variants.filter((v) => v.id !== id)
			}));
			return true;
		}

		this.error = result.error.message;
		return false;
	}

	async moveVariantUp(attributeId: string, variantId: string): Promise<boolean> {
		const attr = this.items.find((a) => a.id === attributeId);
		if (!attr) return false;

		const sorted = [...attr.variants].sort((a, b) => a.displayOrder - b.displayOrder);
		const index = sorted.findIndex((v) => v.id === variantId);
		if (index <= 0) return false;

		// Swap
		const temp = sorted[index - 1];
		sorted[index - 1] = sorted[index];
		sorted[index] = temp;

		const newIds = sorted.map((v) => v.id);
		const result = await this.#useCases.reorderVariants(attributeId, newIds);
		if (result.success) {
			this.items = this.items.map((a) => (a.id === attributeId ? { ...a, variants: result.data } : a));
			return true;
		}
		return false;
	}

	async moveVariantDown(attributeId: string, variantId: string): Promise<boolean> {
		const attr = this.items.find((a) => a.id === attributeId);
		if (!attr) return false;

		const sorted = [...attr.variants].sort((a, b) => a.displayOrder - b.displayOrder);
		const index = sorted.findIndex((v) => v.id === variantId);
		if (index === -1 || index >= sorted.length - 1) return false;

		// Swap
		const temp = sorted[index + 1];
		sorted[index + 1] = sorted[index];
		sorted[index] = temp;

		const newIds = sorted.map((v) => v.id);
		const result = await this.#useCases.reorderVariants(attributeId, newIds);
		if (result.success) {
			this.items = this.items.map((a) => (a.id === attributeId ? { ...a, variants: result.data } : a));
			return true;
		}
		return false;
	}
}

export const attributeVariantStore = new AttributeVariantStore();

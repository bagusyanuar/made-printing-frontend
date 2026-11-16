import { SvelteMap } from 'svelte/reactivity';
import type { Product, ProductInput, CalculationType } from '../domain/product.entity';
import type { ProductUseCases } from './product.use-cases';
import { productUseCases } from './product.use-cases';

export class ProductStore {
	#useCases: ProductUseCases;

	items = $state<Product[]>([]);
	isLoading = $state(false);
	error = $state<string | null>(null);

	searchQuery = $state('');
	selectedCategory = $state<string>('all');
	selectedCalculationType = $state<CalculationType | 'all'>('all');
	statusFilter = $state<'all' | 'active' | 'inactive'>('all');

	filteredItems = $derived.by(() => {
		const q = this.searchQuery.trim().toLowerCase();
		return this.items.filter((item) => {
			const matchesSearch =
				!q ||
				item.name.toLowerCase().includes(q) ||
				item.code.toLowerCase().includes(q) ||
				item.categoryName.toLowerCase().includes(q) ||
				(item.baseMaterial && item.baseMaterial.toLowerCase().includes(q)) ||
				(item.description && item.description.toLowerCase().includes(q));

			const matchesCategory =
				this.selectedCategory === 'all' ||
				item.categoryId === this.selectedCategory ||
				item.categoryName.toLowerCase() === this.selectedCategory.toLowerCase();

			const matchesType =
				this.selectedCalculationType === 'all' ||
				item.calculationType === this.selectedCalculationType;

			const matchesStatus =
				this.statusFilter === 'all' ||
				(this.statusFilter === 'active' ? item.isActive : !item.isActive);

			return matchesSearch && matchesCategory && matchesType && matchesStatus;
		});
	});

	categories = $derived.by(() => {
		const map = new SvelteMap<string, string>();
		for (const item of this.items) {
			if (item.categoryId && item.categoryName) {
				map.set(item.categoryId, item.categoryName);
			}
		}
		return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
	});

	constructor(useCases: ProductUseCases = productUseCases) {
		this.#useCases = useCases;
	}

	async load(): Promise<void> {
		this.isLoading = true;
		this.error = null;
		const result = await this.#useCases.list();
		this.isLoading = false;

		if (result.success) {
			this.items = result.data;
		} else {
			this.error = result.error.message;
		}
	}

	async create(input: ProductInput): Promise<boolean> {
		this.isLoading = true;
		this.error = null;
		const result = await this.#useCases.create(input);
		this.isLoading = false;

		if (result.success) {
			this.items = [result.data, ...this.items];
			return true;
		} else {
			this.error = result.error.message;
			return false;
		}
	}

	async update(id: string, input: ProductInput): Promise<boolean> {
		this.isLoading = true;
		this.error = null;
		const result = await this.#useCases.update(id, input);
		this.isLoading = false;

		if (result.success) {
			this.items = this.items.map((item) => (item.id === id ? result.data : item));
			return true;
		} else {
			this.error = result.error.message;
			return false;
		}
	}

	async delete(id: string): Promise<boolean> {
		this.isLoading = true;
		this.error = null;
		const result = await this.#useCases.delete(id);
		this.isLoading = false;

		if (result.success) {
			this.items = this.items.filter((item) => item.id !== id);
			return true;
		} else {
			this.error = result.error.message;
			return false;
		}
	}
}

export const productStore = new ProductStore();

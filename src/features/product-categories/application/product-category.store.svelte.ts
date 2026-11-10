import type {
	ProductCategory,
	ProductCategoryInput,
	CalculationType
} from '../domain/product-category.entity';
import type { ProductCategoryUseCases } from './product-category.use-cases';
import { productCategoryUseCases } from './product-category.use-cases';

export class ProductCategoryStore {
	#useCases: ProductCategoryUseCases;

	items = $state<ProductCategory[]>([]);
	isLoading = $state(false);
	error = $state<string | null>(null);

	searchQuery = $state('');
	selectedCalculationType = $state<CalculationType | 'all'>('all');
	statusFilter = $state<'all' | 'active' | 'inactive'>('all');

	filteredItems = $derived.by(() => {
		const q = this.searchQuery.trim().toLowerCase();
		return this.items.filter((item) => {
			const matchesSearch =
				!q ||
				item.name.toLowerCase().includes(q) ||
				item.code.toLowerCase().includes(q) ||
				(item.description && item.description.toLowerCase().includes(q));

			const matchesType =
				this.selectedCalculationType === 'all' ||
				item.calculationType === this.selectedCalculationType;

			const matchesStatus =
				this.statusFilter === 'all' ||
				(this.statusFilter === 'active' ? item.isActive : !item.isActive);

			return matchesSearch && matchesType && matchesStatus;
		});
	});

	constructor(useCases: ProductCategoryUseCases = productCategoryUseCases) {
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

	async create(input: ProductCategoryInput): Promise<boolean> {
		this.isLoading = true;
		this.error = null;
		const result = await this.#useCases.create(input);
		this.isLoading = false;

		if (result.success) {
			this.items = [result.data, ...this.items];
			return true;
		}
		this.error = result.error.message;
		return false;
	}

	async update(id: string, input: ProductCategoryInput): Promise<boolean> {
		this.isLoading = true;
		this.error = null;
		const result = await this.#useCases.update(id, input);
		this.isLoading = false;

		if (result.success) {
			this.items = this.items.map((item) => (item.id === id ? result.data : item));
			return true;
		}
		this.error = result.error.message;
		return false;
	}

	async delete(id: string): Promise<boolean> {
		this.isLoading = true;
		this.error = null;
		const result = await this.#useCases.delete(id);
		this.isLoading = false;

		if (result.success) {
			this.items = this.items.filter((item) => item.id !== id);
			return true;
		}
		this.error = result.error.message;
		return false;
	}
}

export const productCategoryStore = new ProductCategoryStore();

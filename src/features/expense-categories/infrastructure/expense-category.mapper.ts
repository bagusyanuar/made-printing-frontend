import type { ExpenseCategory, ExpenseCategoryInput } from '../domain/expense-category.entity';
import type { ExpenseCategoryDto, ExpenseCategoryCreatePayload } from './expense-category.dto';

export function mapExpenseCategoryDtoToEntity(dto: ExpenseCategoryDto): ExpenseCategory {
	return {
		id: dto.id,
		code: dto.code,
		name: dto.name,
		group: dto.group,
		productCategoryId: dto.product_category_id ?? null,
		productCategoryName: dto.product_category_name ?? null,
		displayOrder: dto.display_order ?? 1,
		isActive: dto.is_active ?? true,
		createdAt: dto.created_at ?? new Date().toISOString(),
		updatedAt: dto.updated_at ?? new Date().toISOString()
	};
}

export function mapExpenseCategoryInputToDto(
	input: ExpenseCategoryInput
): ExpenseCategoryCreatePayload {
	return {
		code: input.code,
		name: input.name.trim(),
		group: input.group,
		product_category_id:
			input.group === 'production' ? input.productCategoryId?.trim() || null : null,
		display_order: input.displayOrder,
		is_active: input.isActive ?? true
	};
}

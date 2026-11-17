import type { Supplier, SupplierInput } from '../domain/supplier.entity';
import type { SupplierDto, SupplierCreatePayload } from './supplier.dto';

export function mapSupplierDtoToEntity(dto: SupplierDto): Supplier {
	return {
		id: dto.id,
		code: dto.code,
		name: dto.name,
		contactPerson: dto.contact_person ?? null,
		phone: dto.phone ?? '-',
		email: dto.email ?? null,
		address: dto.address ?? null,
		notes: dto.notes ?? null,
		isActive: dto.is_active ?? true,
		displayOrder: dto.display_order ?? 1,
		createdAt: dto.created_at ?? new Date().toISOString(),
		updatedAt: dto.updated_at ?? new Date().toISOString()
	};
}

export function mapSupplierInputToDto(input: SupplierInput): SupplierCreatePayload {
	return {
		code: input.code,
		name: input.name.trim(),
		contact_person: input.contactPerson?.trim() || null,
		phone: input.phone?.trim() || null,
		email: input.email?.trim() || null,
		address: input.address?.trim() || null,
		notes: input.notes?.trim() || null,
		is_active: input.isActive ?? true,
		display_order: input.displayOrder
	};
}

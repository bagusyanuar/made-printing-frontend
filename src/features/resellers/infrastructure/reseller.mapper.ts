import type { Reseller, ResellerInput } from '../domain/reseller.entity';
import type { ResellerDto, ResellerInputDto } from './reseller.dto';

export function mapResellerDtoToEntity(dto: ResellerDto): Reseller {
	return {
		id: dto.id,
		code: dto.code,
		name: dto.name,
		ownerName: dto.owner_name,
		phone: dto.phone,
		email: dto.email ?? null,
		address: dto.address ?? null,
		tier: dto.tier,
		creditLimit: Number(dto.credit_limit) || 0,
		usedCredit: Number(dto.used_credit) || 0,
		depositBalance: Number(dto.deposit_balance) || 0,
		termOfPaymentDays: Number(dto.term_of_payment_days) || 0,
		status: dto.status,
		notes: dto.notes ?? null,
		isActive: Boolean(dto.is_active),
		displayOrder: Number(dto.display_order) || 0,
		createdAt: dto.created_at,
		updatedAt: dto.updated_at
	};
}

export function mapResellerInputToDto(input: ResellerInput): ResellerInputDto {
	return {
		code: input.code,
		name: input.name,
		owner_name: input.ownerName,
		phone: input.phone || '',
		email: input.email ?? null,
		address: input.address ?? null,
		tier: input.tier ?? 'gold',
		credit_limit: input.creditLimit ?? 0,
		used_credit: input.usedCredit ?? 0,
		deposit_balance: input.depositBalance ?? 0,
		term_of_payment_days: input.termOfPaymentDays ?? 14,
		status: input.status ?? 'active',
		notes: input.notes ?? null,
		is_active: input.isActive ?? true,
		display_order: input.displayOrder
	};
}

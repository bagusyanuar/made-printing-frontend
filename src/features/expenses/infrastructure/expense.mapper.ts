import {
	formatExpenseAccountsSummary,
	type Expense,
	type ExpenseInput,
	type ExpenseItem,
	type ExpensePaymentLine,
	type ExpensePaymentRecord,
	type ExpenseSettlePaymentInput
} from '../domain/expense.entity';
import type {
	CreateExpenseRequestDto,
	ExpenseDto,
	ExpenseItemDto,
	ExpensePaymentLineDto,
	ExpensePaymentRecordDto,
	ExpenseSettlePaymentInputDto
} from './expense.dto';

function mapExpenseItemDtoToEntity(dto: ExpenseItemDto): ExpenseItem {
	return {
		id: dto.id,
		group: dto.group,
		categoryId: dto.category_id,
		categoryName: dto.category_name,
		productCategoryName: dto.product_category_name ?? null,
		description: dto.description,
		amount: dto.amount,
		notes: dto.notes ?? null
	};
}

function mapPaymentLineDtoToEntity(dto: ExpensePaymentLineDto): ExpensePaymentLine {
	return {
		accountName: dto.account_name,
		amount: dto.amount
	};
}

function mapPaymentRecordDtoToEntity(dto: ExpensePaymentRecordDto): ExpensePaymentRecord {
	return {
		id: dto.id,
		paymentDate: dto.payment_date,
		accountName: dto.account_name,
		amount: dto.amount,
		referenceNumber: dto.reference_number ?? null,
		note: dto.note ?? null,
		recordedBy: dto.recorded_by ?? null
	};
}

export function mapExpenseDtoToEntity(dto: ExpenseDto): Expense {
	const paymentLines = dto.payment_lines.map(mapPaymentLineDtoToEntity);

	return {
		id: dto.id,
		code: dto.code,
		expenseDate: dto.expense_date,
		group: dto.group,
		items: dto.items.map(mapExpenseItemDtoToEntity),
		vendorId: dto.vendor_id ?? null,
		vendorName: dto.vendor_name ?? null,
		accountName: dto.account_name,
		paymentLines,
		paymentHistory: dto.payment_history.map(mapPaymentRecordDtoToEntity),
		subtotal: dto.subtotal,
		discountAmount: dto.discount_amount,
		amount: dto.amount,
		totalPaid: dto.total_paid,
		remainingAmount: dto.remaining_amount,
		paymentStatus: dto.payment_status,
		status: dto.status,
		recordedBy: dto.recorded_by,
		approvedBy: dto.approved_by ?? null,
		approvedAt: dto.approved_at ?? null,
		cancelReason: dto.cancel_reason ?? null,
		cancelledAt: dto.cancelled_at ?? null,
		referenceNumber: dto.reference_number ?? null,
		notes: dto.notes ?? null,
		createdAt: dto.created_at,
		updatedAt: dto.updated_at
	};
}

export function mapExpenseInputToDto(input: ExpenseInput): CreateExpenseRequestDto {
	return {
		expense_date: input.expenseDate,
		items: input.items.map((item) => ({
			group: item.group,
			category_id: item.categoryId,
			category_name: item.categoryName,
			product_category_name: item.productCategoryName ?? null,
			description: item.description.trim(),
			amount: item.amount,
			notes: item.notes?.trim() || null
		})),
		discount_amount: input.discountAmount ?? 0,
		vendor_id: input.vendorId ?? null,
		vendor_name: input.vendorName?.trim() || null,
		account_name: formatExpenseAccountsSummary(input.paymentLines),
		payment_lines: input.paymentLines.map((line) => ({
			account_name: line.accountName,
			amount: line.amount
		})),
		status: input.status,
		reference_number: input.referenceNumber?.trim() || '-',
		notes: input.notes?.trim() || null
	};
}

export function mapSettlePaymentInputToDto(
	input: ExpenseSettlePaymentInput
): ExpenseSettlePaymentInputDto {
	return {
		amount: input.amount,
		account_name: input.accountName,
		reference_number: input.referenceNumber,
		note: input.note
	};
}

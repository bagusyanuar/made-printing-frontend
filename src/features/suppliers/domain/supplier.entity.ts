export interface Supplier {
	id: string;
	code: string;
	name: string;
	contactPerson: string | null;
	phone: string;
	email: string | null;
	address: string | null;
	notes: string | null;
	isActive: boolean;
	displayOrder: number;
	createdAt: string;
	updatedAt: string;
}

export interface SupplierInput {
	code?: string;
	name: string;
	contactPerson?: string | null;
	phone?: string | null;
	email?: string | null;
	address?: string | null;
	notes?: string | null;
	isActive?: boolean;
	displayOrder?: number;
}

export function getSupplierInitial(name: string): string {
	const cleaned = name.replace(/^(PT|CV|UD|TOKO|PD|TB)\.?\s+/i, '').trim();
	const parts = cleaned.split(/\s+/).filter(Boolean);
	if (parts.length >= 2) {
		return (parts[0][0] + parts[1][0]).toUpperCase();
	}
	return (cleaned.slice(0, 2) || name.slice(0, 2) || 'SP').toUpperCase();
}

export function generateSupplierCode(name: string, seq?: number): string {
	if (seq !== undefined) {
		return `SPL-${String(seq).padStart(3, '0')}`;
	}
	const initials = getSupplierInitial(name);
	const random = Math.floor(100 + Math.random() * 900);
	return `SPL-${initials}-${random}`;
}

import { z } from 'zod';

export const priceTierItemSchema = z.object({
	minQty: z.number().min(1, 'Min Qty minimal 1'),
	maxQty: z.number().min(1, 'Max Qty minimal 1'),
	price: z.number().min(0, 'Harga tidak boleh negatif')
});

export const variantTierPricingSchema = z.object({
	variantId: z.string(),
	variantName: z.string(),
	resellerTiers: z.array(priceTierItemSchema).min(1, 'Minimal satu tier reseller'),
	endUserTiers: z.array(priceTierItemSchema).min(1, 'Minimal satu tier end user')
});

export const productTierPricingSchema = z.object({
	retailPrice: z.number().min(0, 'Harga retail tidak boleh negatif'),
	resellerPrice: z.number().min(0, 'Harga reseller tidak boleh negatif').nullable().optional(),
	silverPrice: z.number().min(0, 'Harga silver tidak boleh negatif').nullable().optional(),
	goldPrice: z.number().min(0, 'Harga gold tidak boleh negatif').nullable().optional(),
	variantTiers: z.array(variantTierPricingSchema).nullable().optional()
});

export const productAttributeSelectionSchema = z.object({
	attributeId: z.string(),
	attributeName: z.string(),
	selectedVariantIds: z.array(z.string()),
	isRequired: z.boolean().optional()
});

export const productStep1Schema = z.object({
	name: z
		.string()
		.min(2, 'Nama produk minimal 2 karakter')
		.max(100, 'Nama produk maksimal 100 karakter'),
	categoryId: z.string().min(1, 'Kategori produk wajib dipilih'),
	calculationType: z.enum(['square_meter', 'sheet', 'meter_run', 'piece'], {
		error: 'Satuan hitung tidak valid'
	}),
	description: z.string().nullable().optional()
});

export const productStep3Schema = z.object({
	basePrice: z.number().min(0, 'Harga dasar tidak boleh negatif'),
	tierPricing: productTierPricingSchema.nullable().optional()
});

export const productSchema = z.object({
	name: z
		.string()
		.min(2, 'Nama produk minimal 2 karakter')
		.max(100, 'Nama produk maksimal 100 karakter'),
	code: z.string().optional(),
	categoryId: z.string().min(1, 'Kategori produk wajib dipilih'),
	categoryName: z.string().optional(),
	baseMaterial: z.string().nullable().optional(),
	calculationType: z.enum(['square_meter', 'sheet', 'meter_run', 'piece'], {
		error: 'Model perhitungan tidak valid'
	}),
	basePrice: z.number().min(0, 'Harga dasar tidak boleh negatif'),
	tierPricing: productTierPricingSchema.nullable().optional(),
	assignedAttributes: z.array(productAttributeSelectionSchema).nullable().optional(),
	minOrderQty: z.number().min(0, 'Minimal order tidak boleh negatif').optional(),
	leadTimeHours: z
		.number()
		.min(0, 'Estimasi waktu pengerjaan tidak boleh negatif')
		.nullable()
		.optional(),
	description: z.string().nullable().optional(),
	isActive: z.boolean().optional(),
	displayOrder: z.number().optional()
});

export type ProductFormSchema = z.infer<typeof productSchema>;

import type { Result } from '$lib/shared/domain/types/result';
import { Result as Res } from '$lib/shared/domain/types/result';
import { AppError, NotFoundError } from '$lib/shared/domain/errors/app-error';
import type {
	ProductAttribute,
	ProductAttributeInput,
	ProductAttributeVariant,
	ProductAttributeVariantInput
} from '../domain/attribute-variant.entity';
import { generateSlug } from '../domain/attribute-variant.entity';
import type { AttributeVariantRepository } from '../domain/attribute-variant.repository';

const INITIAL_ATTRIBUTES: ProductAttribute[] = [
	{
		id: 'attr-1',
		name: 'Sisi Cetak',
		code: 'sisi_cetak',
		description: 'Orientasi dan jumlah muka cetak pada bahan (1 muka atau bolak-balik).',
		isRequired: true,
		displayOrder: 1,
		isActive: true,
		variants: [
			{
				id: 'var-1-1',
				attributeId: 'attr-1',
				name: '1 Sisi (4/0)',
				code: '1_sisi',
				description: 'Cetak muka depan saja (Full Color).',
				displayOrder: 1,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			},
			{
				id: 'var-1-2',
				attributeId: 'attr-1',
				name: '2 Sisi Bolak-Balik (4/4)',
				code: '2_sisi',
				description: 'Cetak bolak-balik muka depan & belakang.',
				displayOrder: 2,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			}
		],
		createdAt: '2026-02-01T08:00:00.000Z',
		updatedAt: '2026-02-01T08:00:00.000Z'
	},
	{
		id: 'attr-2',
		name: 'Pilihan Laminasi',
		code: 'pilihan_laminasi',
		description: 'Lapisan plastik pelindung hasil cetak dari goresan, air, dan sinar UV.',
		isRequired: false,
		displayOrder: 2,
		isActive: true,
		variants: [
			{
				id: 'var-2-1',
				attributeId: 'attr-2',
				name: 'Tanpa Laminasi',
				code: 'tanpa_laminasi',
				description: 'Hasil cetak standar langsung dari mesin.',
				displayOrder: 1,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			},
			{
				id: 'var-2-2',
				attributeId: 'attr-2',
				name: 'Doff 1 Sisi',
				code: 'doff_1_sisi',
				description: 'Lapisan matte tidak memantulkan cahaya (1 muka).',
				displayOrder: 2,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			},
			{
				id: 'var-2-3',
				attributeId: 'attr-2',
				name: 'Glossy 1 Sisi',
				code: 'glossy_1_sisi',
				description: 'Lapisan mengkilap memantulkan cahaya (1 muka).',
				displayOrder: 3,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			},
			{
				id: 'var-2-4',
				attributeId: 'attr-2',
				name: 'Doff 2 Sisi',
				code: 'doff_2_sisi',
				description: 'Lapisan matte bolak-balik kedua muka.',
				displayOrder: 4,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			},
			{
				id: 'var-2-5',
				attributeId: 'attr-2',
				name: 'Glossy 2 Sisi',
				code: 'glossy_2_sisi',
				description: 'Lapisan mengkilap bolak-balik kedua muka.',
				displayOrder: 5,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			},
			{
				id: 'var-2-6',
				attributeId: 'attr-2',
				name: 'Soft Touch (Velvet)',
				code: 'soft_touch',
				description: 'Lapisan tekstur beludru mewah ultra-halus.',
				displayOrder: 6,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			}
		],
		createdAt: '2026-02-01T08:00:00.000Z',
		updatedAt: '2026-02-01T08:00:00.000Z'
	},
	{
		id: 'attr-3',
		name: 'Finishing Banner & Spanduk',
		code: 'finishing_banner',
		description: 'Opsi pengolahan pasca-cetak untuk spanduk, baliho, dan banner roll.',
		isRequired: false,
		displayOrder: 3,
		isActive: true,
		variants: [
			{
				id: 'var-3-1',
				attributeId: 'attr-3',
				name: 'Tanpa Finishing',
				code: 'tanpa_finishing',
				description: 'Potong pas garis batas gambar cetak.',
				displayOrder: 1,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			},
			{
				id: 'var-3-2',
				attributeId: 'attr-3',
				name: 'Mata Ayam 4 Sudut',
				code: 'mata_ayam_4_sudut',
				description: 'Ring besi lubang pengikat tali pada 4 pojok.',
				displayOrder: 2,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			},
			{
				id: 'var-3-3',
				attributeId: 'attr-3',
				name: 'Mata Ayam Per 1 Meter',
				code: 'mata_ayam_per_meter',
				description: 'Ring besi di 4 pojok ditambah interval per 1 meter keliling.',
				displayOrder: 3,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			},
			{
				id: 'var-3-4',
				attributeId: 'attr-3',
				name: 'Lipat Seaming Keliling',
				code: 'lipat_seaming',
				description: 'Lipatan tepi berpemanas/lem tanpa lubang ring.',
				displayOrder: 4,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			},
			{
				id: 'var-3-5',
				attributeId: 'attr-3',
				name: 'Selongsong Atas & Bawah',
				code: 'selongsong_atas_bawah',
				description: 'Kolong tabung untuk dimasuki pipa/kayu bentang.',
				displayOrder: 5,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			},
			{
				id: 'var-3-6',
				attributeId: 'attr-3',
				name: 'Lebih Bahan 5cm',
				code: 'lebih_bahan_5cm',
				description: 'Sisa tepi putih keliling 5 cm untuk dipaku ke kayu reklame.',
				displayOrder: 6,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			}
		],
		createdAt: '2026-02-01T08:00:00.000Z',
		updatedAt: '2026-02-01T08:00:00.000Z'
	},
	{
		id: 'attr-4',
		name: 'Jenis Potong / Cutting',
		code: 'jenis_potong',
		description: 'Metode pemotongan produk cetak (stiker, kartu, brosur, atau pola bebas).',
		isRequired: false,
		displayOrder: 4,
		isActive: true,
		variants: [
			{
				id: 'var-4-1',
				attributeId: 'attr-4',
				name: 'Potong Kotak (Guillotine)',
				code: 'potong_kotak',
				description: 'Potong lurus persegi menggunakan mesin potong sisir.',
				displayOrder: 1,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			},
			{
				id: 'var-4-2',
				attributeId: 'attr-4',
				name: 'Kiss Cut (Setengah Putus)',
				code: 'kiss_cut',
				description: 'Potong stiker hanya sampai lapisan vinyl, lembaran bawah utuh.',
				displayOrder: 2,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			},
			{
				id: 'var-4-3',
				attributeId: 'attr-4',
				name: 'Die Cut (Putus Siluet)',
				code: 'die_cut',
				description: 'Potong tembus kertas backing mengikuti pola siluet desain.',
				displayOrder: 3,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			}
		],
		createdAt: '2026-02-01T08:00:00.000Z',
		updatedAt: '2026-02-01T08:00:00.000Z'
	},
	{
		id: 'attr-5',
		name: 'Bentuk Sudut',
		code: 'bentuk_sudut',
		description: 'Bentuk sudut fisik produk kartu nama, ID card, atau hangtag.',
		isRequired: false,
		displayOrder: 5,
		isActive: true,
		variants: [
			{
				id: 'var-5-1',
				attributeId: 'attr-5',
				name: 'Sudut Siku 90° (Standar)',
				code: 'sudut_siku',
				description: 'Sudut siku lancip standar cetak kartu.',
				displayOrder: 1,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			},
			{
				id: 'var-5-2',
				attributeId: 'attr-5',
				name: 'Sudut Bulat R3 (3mm)',
				code: 'sudut_bulat_r3',
				description: 'Sudut lengkung halus dengan radius 3 mm.',
				displayOrder: 2,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			},
			{
				id: 'var-5-3',
				attributeId: 'attr-5',
				name: 'Sudut Bulat R5 (5mm)',
				code: 'sudut_bulat_r5',
				description: 'Sudut lengkung oval dengan radius 5 mm.',
				displayOrder: 3,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			}
		],
		createdAt: '2026-02-01T08:00:00.000Z',
		updatedAt: '2026-02-01T08:00:00.000Z'
	},
	{
		id: 'attr-6',
		name: 'Pilihan Jilid Buku',
		code: 'pilihan_jilid',
		description: 'Metode penjilidan untuk buku, katalog, company profile, dan kalender.',
		isRequired: false,
		displayOrder: 6,
		isActive: true,
		variants: [
			{
				id: 'var-6-1',
				attributeId: 'attr-6',
				name: 'Steples Tengah (Saddle Stitch)',
				code: 'steples_tengah',
				description: 'Kawat steples tengah untuk buku tipis (kelipatan 4 hal).',
				displayOrder: 1,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			},
			{
				id: 'var-6-2',
				attributeId: 'attr-6',
				name: 'Spiral Kawat (Wire-O)',
				code: 'spiral_kawat',
				description: 'Kawat ring besi kalender meja atau agenda.',
				displayOrder: 2,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			},
			{
				id: 'var-6-3',
				attributeId: 'attr-6',
				name: 'Lem Panas (Perfect Binding)',
				code: 'lem_panas',
				description: 'Punggung buku diratakan dan dilem panas standar novel tebal.',
				displayOrder: 3,
				isActive: true,
				createdAt: '2026-02-01T08:00:00.000Z',
				updatedAt: '2026-02-01T08:00:00.000Z'
			}
		],
		createdAt: '2026-02-01T08:00:00.000Z',
		updatedAt: '2026-02-01T08:00:00.000Z'
	}
];

export class AttributeVariantRepositoryMock implements AttributeVariantRepository {
	#attributes: ProductAttribute[] = JSON.parse(JSON.stringify(INITIAL_ATTRIBUTES));

	async list(): Promise<Result<ProductAttribute[], AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 150));
		return Res.ok(JSON.parse(JSON.stringify(this.#attributes)));
	}

	async getById(id: string): Promise<Result<ProductAttribute, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 80));
		const found = this.#attributes.find((a) => a.id === id);
		if (!found) {
			return Res.error(new NotFoundError(`Atribut dengan ID "${id}" tidak ditemukan.`));
		}
		return Res.ok(JSON.parse(JSON.stringify(found)));
	}

	async createAttribute(
		input: ProductAttributeInput
	): Promise<Result<ProductAttribute, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 200));
		const code = input.code?.trim() || generateSlug(input.name);

		const exists = this.#attributes.some(
			(a) => a.code.toLowerCase() === code.toLowerCase()
		);
		if (exists) {
			return Res.error(
				new AppError(`Kode atribut "${code}" sudah terdaftar.`, 'CONFLICT')
			);
		}

		const now = new Date().toISOString();
		const maxOrder = this.#attributes.reduce((max, a) => Math.max(max, a.displayOrder), 0);
		const attrId = `attr-${Date.now()}`;

		const generatedVariants: ProductAttributeVariant[] = (input.variants ?? []).map(
			(vItem, vIdx) => ({
				id: `var-${Date.now()}-${vIdx}`,
				attributeId: attrId,
				name: vItem.name.trim(),
				code: generateSlug(vItem.name.trim()),
				description: null,
				displayOrder: vItem.displayOrder ?? vIdx + 1,
				isActive: true,
				createdAt: now,
				updatedAt: now
			})
		);

		const newAttribute: ProductAttribute = {
			id: attrId,
			name: input.name.trim(),
			code,
			description: input.description?.trim() || null,
			isRequired: input.isRequired ?? false,
			displayOrder: input.displayOrder ?? maxOrder + 1,
			isActive: input.isActive ?? true,
			variants: generatedVariants,
			createdAt: now,
			updatedAt: now
		};

		this.#attributes.push(newAttribute);
		return Res.ok(JSON.parse(JSON.stringify(newAttribute)));
	}

	async updateAttribute(
		id: string,
		input: ProductAttributeInput
	): Promise<Result<ProductAttribute, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 200));
		const index = this.#attributes.findIndex((a) => a.id === id);
		if (index === -1) {
			return Res.error(new NotFoundError('Atribut tidak ditemukan.'));
		}

		const current = this.#attributes[index];
		const code = input.code?.trim() || current.code;

		const conflict = this.#attributes.some(
			(a) => a.id !== id && a.code.toLowerCase() === code.toLowerCase()
		);
		if (conflict) {
			return Res.error(new AppError(`Kode atribut "${code}" sudah digunakan.`, 'CONFLICT'));
		}

		let updatedVariants = current.variants;
		if (input.variants !== undefined) {
			const existingMap = new Map(current.variants.map((v) => [v.name.toLowerCase(), v]));
			updatedVariants = input.variants.map((vItem, vIdx) => {
				const existing = existingMap.get(vItem.name.trim().toLowerCase());
				const order = vItem.displayOrder ?? vIdx + 1;
				if (existing) {
					return { ...existing, name: vItem.name.trim(), displayOrder: order };
				}
				return {
					id: `var-${Date.now()}-${vIdx}`,
					attributeId: id,
					name: vItem.name.trim(),
					code: generateSlug(vItem.name.trim()),
					description: null,
					displayOrder: order,
					isActive: true,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				};
			});
		}

		const updated: ProductAttribute = {
			...current,
			name: input.name.trim(),
			code,
			description: input.description !== undefined ? input.description?.trim() || null : current.description,
			isRequired: input.isRequired ?? current.isRequired,
			displayOrder: input.displayOrder ?? current.displayOrder,
			isActive: input.isActive ?? current.isActive,
			variants: updatedVariants,
			updatedAt: new Date().toISOString()
		};

		this.#attributes[index] = updated;
		return Res.ok(JSON.parse(JSON.stringify(updated)));
	}

	async deleteAttribute(id: string): Promise<Result<void, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 150));
		const index = this.#attributes.findIndex((a) => a.id === id);
		if (index === -1) {
			return Res.error(new NotFoundError('Atribut tidak ditemukan.'));
		}
		this.#attributes.splice(index, 1);
		return Res.ok(undefined);
	}

	async createVariant(
		attributeId: string,
		input: ProductAttributeVariantInput
	): Promise<Result<ProductAttributeVariant, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 180));
		const attribute = this.#attributes.find((a) => a.id === attributeId);
		if (!attribute) {
			return Res.error(new NotFoundError('Atribut induk tidak ditemukan.'));
		}

		const code = input.code?.trim() || generateSlug(input.name);
		const exists = attribute.variants.some((v) => v.code.toLowerCase() === code.toLowerCase());
		if (exists) {
			return Res.error(
				new AppError(`Varian dengan kode "${code}" sudah ada dalam atribut ini.`, 'CONFLICT')
			);
		}

		const maxOrder = attribute.variants.reduce((max, v) => Math.max(max, v.displayOrder), 0);
		const now = new Date().toISOString();

		const newVariant: ProductAttributeVariant = {
			id: `var-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
			attributeId,
			name: input.name.trim(),
			code,
			description: input.description?.trim() || null,
			displayOrder: input.displayOrder ?? maxOrder + 1,
			isActive: input.isActive ?? true,
			createdAt: now,
			updatedAt: now
		};

		attribute.variants.push(newVariant);
		attribute.updatedAt = now;

		return Res.ok(JSON.parse(JSON.stringify(newVariant)));
	}

	async updateVariant(
		id: string,
		input: ProductAttributeVariantInput
	): Promise<Result<ProductAttributeVariant, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 180));
		for (const attr of this.#attributes) {
			const vIndex = attr.variants.findIndex((v) => v.id === id);
			if (vIndex !== -1) {
				const current = attr.variants[vIndex];
				const code = input.code?.trim() || current.code;

				const conflict = attr.variants.some(
					(v) => v.id !== id && v.code.toLowerCase() === code.toLowerCase()
				);
				if (conflict) {
					return Res.error(
						new AppError(`Kode varian "${code}" sudah digunakan pada atribut ini.`, 'CONFLICT')
					);
				}

				const updated: ProductAttributeVariant = {
					...current,
					name: input.name.trim(),
					code,
					description:
						input.description !== undefined ? input.description?.trim() || null : current.description,
					displayOrder: input.displayOrder ?? current.displayOrder,
					isActive: input.isActive ?? current.isActive,
					updatedAt: new Date().toISOString()
				};

				attr.variants[vIndex] = updated;
				attr.updatedAt = new Date().toISOString();
				return Res.ok(JSON.parse(JSON.stringify(updated)));
			}
		}

		return Res.error(new NotFoundError('Varian tidak ditemukan.'));
	}

	async deleteVariant(id: string): Promise<Result<void, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 150));
		for (const attr of this.#attributes) {
			const vIndex = attr.variants.findIndex((v) => v.id === id);
			if (vIndex !== -1) {
				attr.variants.splice(vIndex, 1);
				attr.updatedAt = new Date().toISOString();
				return Res.ok(undefined);
			}
		}
		return Res.error(new NotFoundError('Varian tidak ditemukan.'));
	}

	async reorderVariants(
		attributeId: string,
		variantIds: string[]
	): Promise<Result<ProductAttributeVariant[], AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 150));
		const attr = this.#attributes.find((a) => a.id === attributeId);
		if (!attr) {
			return Res.error(new NotFoundError('Atribut tidak ditemukan.'));
		}

		const map = new Map(attr.variants.map((v) => [v.id, v]));
		const reordered: ProductAttributeVariant[] = [];

		variantIds.forEach((vid, idx) => {
			const item = map.get(vid);
			if (item) {
				item.displayOrder = idx + 1;
				reordered.push(item);
			}
		});

		attr.variants = reordered;
		attr.updatedAt = new Date().toISOString();
		return Res.ok(JSON.parse(JSON.stringify(reordered)));
	}
}

export const attributeVariantRepositoryMock = new AttributeVariantRepositoryMock();

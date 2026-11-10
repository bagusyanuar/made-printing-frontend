import { z } from 'zod';
import { InvalidResponseError } from '$lib/shared/domain/errors/app-error';
import type { PaginationMeta } from '$lib/shared/domain/types/pagination';

export const dateStringSchema = z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
	message: 'Format tanggal tidak valid'
});

export const paginationMetaSchema = z.object({
	page: z.number(),
	per_page: z.number(),
	total_data: z.number(),
	total_pages: z.number()
}) satisfies z.ZodType<PaginationMeta>;

export const apiEnvelopeSchema = z.object({
	success: z.boolean().optional(),
	message: z.string().optional(),
	data: z.unknown(),
	meta: paginationMetaSchema.nullable().optional()
});

export function parseApiResponse<T>(schema: z.ZodType<T>, raw: unknown): T {
	const parsed = parseApiResponseWithMeta(schema, raw);
	return parsed.data;
}

export function parseApiResponseWithMeta<T>(
	schema: z.ZodType<T>,
	raw: unknown
): { data: T; meta: PaginationMeta | null } {
	const envelopeResult = apiEnvelopeSchema.safeParse(raw);
	if (!envelopeResult.success) {
		throw new InvalidResponseError(
			'Respon API tidak memenuhi standar envelope',
			envelopeResult.error.format()
		);
	}

	const dataResult = schema.safeParse(envelopeResult.data.data);
	if (!dataResult.success) {
		throw new InvalidResponseError(
			'Payload data API tidak sesuai schema',
			dataResult.error.format()
		);
	}

	return {
		data: dataResult.data,
		meta: envelopeResult.data.meta ?? null
	};
}

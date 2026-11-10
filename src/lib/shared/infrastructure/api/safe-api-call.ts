import axios from 'axios';
import { Result } from '$lib/shared/domain/types/result';
import {
	AppError,
	NotFoundError,
	UnauthorizedError,
	ForbiddenError,
	ConflictError,
	ValidationError
} from '$lib/shared/domain/errors/app-error';

export async function safeApiCall<T>(fn: () => Promise<T>): Promise<Result<T>> {
	try {
		const data = await fn();
		return Result.ok(data);
	} catch (err: unknown) {
		if (err instanceof AppError) {
			return Result.error(err);
		}

		if (axios.isAxiosError(err)) {
			const status = err.response?.status;
			const resData = err.response?.data as
				{ error?: { message?: string; code?: string; details?: unknown } } | undefined;
			const message =
				resData?.error?.message || err.message || 'Terjadi kesalahan koneksi ke server';
			const details = resData?.error?.details;

			if (status === 401) {
				return Result.error(new UnauthorizedError(message, details));
			}
			if (status === 403) {
				return Result.error(new ForbiddenError(message, details));
			}
			if (status === 404) {
				return Result.error(new NotFoundError(message, details));
			}
			if (status === 409) {
				return Result.error(new ConflictError(message, details));
			}
			if (status === 422 || status === 400) {
				return Result.error(new ValidationError(message, details));
			}

			return Result.error(new AppError(message, 'NETWORK_ERROR', details));
		}

		const fallbackMsg = err instanceof Error ? err.message : 'Terjadi kesalahan tidak terduga';
		return Result.error(new AppError(fallbackMsg, 'INTERNAL_ERROR', err));
	}
}

import type { AppError } from '../errors/app-error';

export type Result<T, E = AppError> = { success: true; data: T } | { success: false; error: E };

export const Result = {
	ok<T>(data: T): Result<T, never> {
		return { success: true, data };
	},
	error<E = AppError>(error: E): Result<never, E> {
		return { success: false, error };
	}
};

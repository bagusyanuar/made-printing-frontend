export type AppErrorCode =
	| 'UNAUTHORIZED'
	| 'FORBIDDEN'
	| 'NOT_FOUND'
	| 'VALIDATION_ERROR'
	| 'INVALID_RESPONSE'
	| 'CONFLICT'
	| 'NETWORK_ERROR'
	| 'INTERNAL_ERROR';

export class AppError extends Error {
	readonly code: AppErrorCode;
	readonly details?: unknown;

	constructor(message: string, code: AppErrorCode = 'INTERNAL_ERROR', details?: unknown) {
		super(message);
		this.name = 'AppError';
		this.code = code;
		this.details = details;
	}
}

export class NotFoundError extends AppError {
	constructor(message = 'Resource tidak ditemukan', details?: unknown) {
		super(message, 'NOT_FOUND', details);
		this.name = 'NotFoundError';
	}
}

export class ValidationError extends AppError {
	constructor(message = 'Validasi gagal', details?: unknown) {
		super(message, 'VALIDATION_ERROR', details);
		this.name = 'ValidationError';
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = 'Sesi tidak valid atau telah berakhir', details?: unknown) {
		super(message, 'UNAUTHORIZED', details);
		this.name = 'UnauthorizedError';
	}
}

export class ForbiddenError extends AppError {
	constructor(message = 'Akses ditolak', details?: unknown) {
		super(message, 'FORBIDDEN', details);
		this.name = 'ForbiddenError';
	}
}

export class ConflictError extends AppError {
	constructor(message = 'Data sudah ada atau terjadi konflik', details?: unknown) {
		super(message, 'CONFLICT', details);
		this.name = 'ConflictError';
	}
}

export class InvalidResponseError extends AppError {
	constructor(message = 'Respon backend tidak sesuai kontrak yang diharapkan', details?: unknown) {
		super(message, 'INVALID_RESPONSE', details);
		this.name = 'InvalidResponseError';
	}
}

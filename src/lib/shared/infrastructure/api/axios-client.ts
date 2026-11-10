import axios from 'axios';

export const axiosClient = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
	headers: {
		'Content-Type': 'application/json'
	},
	timeout: 15000
});

let onUnauthorizedCallback: (() => void) | null = null;

export function setUnauthorizedHandler(callback: () => void) {
	onUnauthorizedCallback = callback;
}

axiosClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401 && onUnauthorizedCallback) {
			onUnauthorizedCallback();
		}
		return Promise.reject(error);
	}
);

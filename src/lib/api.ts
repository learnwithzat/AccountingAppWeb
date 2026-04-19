/** @format */

import axios from 'axios';
import { env } from './env';

export const api = axios.create({
	baseURL: env.API_URL,
});

//////////////////////////////////////////////////////
// SAFE ROUTES (EXACT MATCH STYLE)
//////////////////////////////////////////////////////
const PUBLIC_ROUTES = ['/auth/login', '/auth/setup', '/auth/check-setup'];

const isPublicRoute = (url?: string) => {
	if (!url) return false;
	return PUBLIC_ROUTES.some((route) => url.startsWith(route));
};

//////////////////////////////////////////////////////
// REQUEST INTERCEPTOR
//////////////////////////////////////////////////////
api.interceptors.request.use((config) => {
	if (typeof window !== 'undefined') {
		const token = localStorage.getItem('token');
		const tenantId = localStorage.getItem('tenantId');

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		if (tenantId) {
			config.headers['x-tenant-id'] = tenantId; // 🔥 ADD THIS
		}
	}

	return config;
});

//////////////////////////////////////////////////////
// RESPONSE INTERCEPTOR
//////////////////////////////////////////////////////
let isLoggingOut = false;

api.interceptors.response.use(
	(res) => res,
	(err) => {
		if (typeof window === 'undefined') return Promise.reject(err);

		const status = err?.response?.status;
		const url = err?.config?.url || '';

		//////////////////////////////////////////////////////
		// IGNORE AUTH ROUTES
		//////////////////////////////////////////////////////
		if (isPublicRoute(url) || url.startsWith('/auth/me')) {
			return Promise.reject(err);
		}

		//////////////////////////////////////////////////////
		// HANDLE 401 SAFELY
		//////////////////////////////////////////////////////
		if (status === 401 && !isLoggingOut) {
			isLoggingOut = true;

			console.warn('🔐 Unauthorized → Logging out');

			localStorage.removeItem('token');
			localStorage.removeItem('tenantId');

			// IMPORTANT: avoid hard reload loop
			setTimeout(() => {
				if (window.location.pathname !== '/login') {
					window.location.href = '/login';
				}
			}, 50);
		}

		return Promise.reject(err);
	}
);

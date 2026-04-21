/** @format */

import axios from 'axios';
import { env } from './env';

export const api = axios.create({
	baseURL: env.API_URL,
});

//////////////////////////////////////////////////////
// PUBLIC ROUTES
//////////////////////////////////////////////////////
const PUBLIC_ROUTES = ['/auth/login', '/auth/setup', '/auth/check-setup'];

const isPublicRoute = (url?: string) => {
	if (!url) return false;
	return PUBLIC_ROUTES.some((route) => url.startsWith(route));
};

//////////////////////////////////////////////////////
// REQUEST INTERCEPTOR (SaaS SAFE)
//////////////////////////////////////////////////////
api.interceptors.request.use((config) => {
	if (typeof window === 'undefined') return config;

	const token = localStorage.getItem('token');
	const activeTenantId = localStorage.getItem('activeTenantId');

	//////////////////////////////////////////////////////
	// AUTH HEADER
	//////////////////////////////////////////////////////
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	//////////////////////////////////////////////////////
	// TENANT HEADER (ONLY IF EXISTS)
	//////////////////////////////////////////////////////
	if (activeTenantId) {
		config.headers['x-tenant-id'] = activeTenantId;
	}

	//////////////////////////////////////////////////////
	// SAFETY GUARD (IMPORTANT)
	//////////////////////////////////////////////////////
	if (!token && !isPublicRoute(config.url)) {
		return Promise.reject({
			message: 'No auth token',
		});
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
		// IGNORE PUBLIC ROUTES
		//////////////////////////////////////////////////////
		if (isPublicRoute(url) || url.startsWith('/auth/me')) {
			return Promise.reject(err);
		}

		//////////////////////////////////////////////////////
		// HANDLE 401
		//////////////////////////////////////////////////////
		if (status === 401 && !isLoggingOut) {
			isLoggingOut = true;

			console.warn('🔐 Session expired → logging out');

			localStorage.removeItem('token');
			localStorage.removeItem('activeTenantId');

			//////////////////////////////////////////////////
			// SPA SAFE REDIRECT (Next.js friendly)
			//////////////////////////////////////////////////
			setTimeout(() => {
				if (window.location.pathname !== '/login') {
					window.location.replace('/login');
				}
			}, 100);
		}

		return Promise.reject(err);
	},
);

//////////////////////////////////////////////////////
// OPTIONAL: GLOBAL TENANT SYNC HELPER (NEW)
//////////////////////////////////////////////////////
export const setActiveTenant = (tenantId: string) => {
	if (typeof window === 'undefined') return;

	localStorage.setItem('activeTenantId', tenantId);
};

export const getActiveTenant = () => {
	if (typeof window === 'undefined') return null;

	return localStorage.getItem('activeTenantId');
};

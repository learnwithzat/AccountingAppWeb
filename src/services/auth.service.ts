/** @format */

import { api } from '@/lib/api';

export const AuthService = {
	//////////////////////////////////////////////////////
	// SETUP (FIRST TIME TENANT + USER)
	//////////////////////////////////////////////////////
	async setup(data: {
		name: string;
		email: string;
		username: string;
		password: string;
		tenantName: string;
		slug: string;
	}) {
		const { data: res } = await api.post('/auth/setup', data);

		if (!res?.access_token) throw new Error('Setup failed');

		// store auth context
		localStorage.setItem('token', res.access_token);
		localStorage.setItem('tenantId', res.tenant.id);

		return res;
	},

	//////////////////////////////////////////////////////
	// LOGIN
	//////////////////////////////////////////////////////
	async login(username: string, password: string) {
		const { data: res } = await api.post('/auth/login', {
			username,
			password,
		});

		if (!res?.access_token) throw new Error('Login failed');

		localStorage.setItem('token', res.access_token);
		localStorage.setItem('tenantId', res.tenant.id);

		return res;
	},

	//////////////////////////////////////////////////////
	// ME (SAFE - NO 401 CRASH)
	//////////////////////////////////////////////////////
	async me() {
		const token = this.getToken();

		// ❗ prevent unnecessary API call
		if (!token) return null;

		try {
			const { data } = await api.get('/auth/me');
			return data;
		} catch (err: any) {
			// ✅ if unauthorized → clean logout state safely
			if (err?.response?.status === 401) {
				this.logout();
				return null;
			}

			throw err;
		}
	},

	//////////////////////////////////////////////////////
	// CHECK SETUP
	//////////////////////////////////////////////////////
	async checkSetup() {
		const { data } = await api.get('/auth/check-setup');
		return data;
	},

	//////////////////////////////////////////////////////
	// LOGOUT (FULL CLEAN RESET)
	//////////////////////////////////////////////////////
	logout() {
		localStorage.removeItem('token');
		localStorage.removeItem('tenantId');
	},

	//////////////////////////////////////////////////////
	// TOKEN
	//////////////////////////////////////////////////////
	getToken() {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem('token');
	},

	//////////////////////////////////////////////////////
	// TENANT HANDLING
	//////////////////////////////////////////////////////
	setTenant(tenantId: string) {
		if (!tenantId) return;
		localStorage.setItem('tenantId', tenantId);
	},

	getTenant() {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem('tenantId');
	},
};

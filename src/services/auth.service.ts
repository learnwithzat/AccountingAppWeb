/** @format */

import { api } from '@/lib/api';

export const AuthService = {
	//////////////////////////////////////////////////////
	// SETUP (FIRST TIME)
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

		this.setSession(res);

		return res;
	},

	//////////////////////////////////////////////////////
	// LOGIN
	//////////////////////////////////////////////////////
	async login(username: string, password: string) {
		const { data: res } = await api.post('/auth/login', { username, password });

		if (!res?.access_token) throw new Error('Login failed');

		this.setSession(res);

		return res;
	},

	//////////////////////////////////////////////////////
	// ME (SAFE)
	//////////////////////////////////////////////////////
	async me() {
		const token = this.getToken();
		if (!token) return null;

		try {
			const { data } = await api.get('/auth/me');
			return data;
		} catch (err: any) {
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
	// SESSION HANDLING (NEW IMPROVEMENT)
	//////////////////////////////////////////////////////
	setSession(res: any) {
		if (typeof window === 'undefined') return;

		localStorage.setItem('token', res.access_token);

		// store ONLY initial tenant (not authority)
		if (res?.tenant?.id) {
			localStorage.setItem('activeTenantId', res.tenant.id);
		}
	},

	//////////////////////////////////////////////////////
	// LOGOUT
	//////////////////////////////////////////////////////
	logout() {
		if (typeof window === 'undefined') return;

		localStorage.removeItem('token');
		localStorage.removeItem('activeTenantId');
	},

	//////////////////////////////////////////////////////
	// TOKEN
	//////////////////////////////////////////////////////
	getToken() {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem('token');
	},

	//////////////////////////////////////////////////////
	// TENANT (SAFE CACHE ONLY)
	//////////////////////////////////////////////////////
	setTenant(tenantId: string) {
		if (!tenantId) return;
		if (typeof window === 'undefined') return;

		localStorage.setItem('activeTenantId', tenantId);
	},

	getTenant() {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem('activeTenantId');
	},

	//////////////////////////////////////////////////////
	// SWITCH TENANT (NEW IMPORTANT FEATURE)
	//////////////////////////////////////////////////////
	async switchTenant(tenantId: string) {
		// optional backend call if needed
		// await api.post('/auth/switch-tenant', { tenantId });

		this.setTenant(tenantId);
		return tenantId;
	},
};

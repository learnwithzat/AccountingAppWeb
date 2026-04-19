/** @format */

import { api } from '@/lib/api';

export const UserService = {
	async getAll() {
		return api.get('/users');
	},

	async create(data: any) {
		return api.post('/users', data);
	},

	async update(id: string, data: any) {
		return api.patch(`/users/${id}`, data);
	},

	async remove(id: string) {
		return api.delete(`/users/${id}`);
	},

	async assignRole(data: { userId: string; tenantId: string; roleId: string }) {
		return api.post('/users/assign-role', data);
	},
};

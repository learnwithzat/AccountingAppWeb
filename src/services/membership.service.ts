/** @format */

import { api } from '@/lib/api';

export const MembershipService = {
	getAll: () => api.get('/membership'),
	getOne: (id: string) => api.get(`/membership/${id}`),
	create: (data: any) => api.post('/membership', data),
	remove: (id: string) => api.delete(`/membership/${id}`),
};

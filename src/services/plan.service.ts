/** @format */

import { api } from '@/lib/api';

export const PlanService = {
	getAll: () => api.get('/plan'),
	getOne: (id: string) => api.get(`/plan/${id}`),
	create: (data: any) => api.post('/plan', data),
	update: (id: string, data: any) => api.put(`/plan/${id}`, data),
	remove: (id: string) => api.delete(`/plan/${id}`),
};

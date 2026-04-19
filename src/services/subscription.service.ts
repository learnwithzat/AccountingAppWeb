/** @format */

import { api } from '@/lib/api';

export const SubscriptionService = {
	getAll: () => api.get('/subscription'),
	getOne: (id: string) => api.get(`/subscription/${id}`),
	create: (data: any) => api.post('/subscription', data),
	remove: (id: string) => api.delete(`/subscription/${id}`),
};

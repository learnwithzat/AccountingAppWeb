/** @format */

import { api } from '@/lib/api';

export const BillingService = {
	//////////////////////////////////////////////////////
	// PLANS
	//////////////////////////////////////////////////////
	getPlans() {
		return api.get('/plans');
	},

	createPlan(data: any) {
		return api.post('/plans', data);
	},

	updatePlan(id: string, data: any) {
		return api.patch(`/plans/${id}`, data);
	},

	deletePlan(id: string) {
		return api.delete(`/plans/${id}`);
	},

	//////////////////////////////////////////////////////
	// SUBSCRIPTIONS
	//////////////////////////////////////////////////////
	getSubscriptions() {
		return api.get('/subscriptions');
	},

	assignPlan(data: { tenantId: string; planId: string }) {
		return api.post('/subscriptions/assign', data);
	},

	updateSubscription(id: string, data: any) {
		return api.patch(`/subscriptions/${id}`, data);
	},
};

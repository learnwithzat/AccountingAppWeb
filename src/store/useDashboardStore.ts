/** @format */

import { create } from 'zustand';
import API from '@/lib/api';

type Summary = {
	sales: number;
	purchases: number;
	customers: number;
	transactions: number;
	profit: number;
};

interface DashboardState {
	summary: Summary | null;
	salesChart: any[];
	purchaseChart: any[];
	loading: boolean;
	fetchDashboardData: (companyId: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
	summary: null,
	salesChart: [],
	purchaseChart: [],
	loading: false,
	fetchDashboardData: async (companyId: string) => {
		try {
			set({ loading: true });
			const [summaryRes, salesRes, purchaseRes] = await Promise.all([
				API.get(`/dashboard/summary?companyId=${companyId}`),
				API.get(`/dashboard/sales-chart?companyId=${companyId}`),
				API.get(`/dashboard/purchase-chart?companyId=${companyId}`),
			]);

			set({
				summary: summaryRes.data,
				salesChart: salesRes.data,
				purchaseChart: purchaseRes.data,
			});
		} catch (err) {
			console.error('Dashboard load error:', err);
		} finally {
			set({ loading: false });
		}
	},
}));

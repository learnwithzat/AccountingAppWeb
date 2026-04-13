/** @format */

// store/useBillStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import API from '@/lib/api';

export type BillStatus =
	| 'draft'
	| 'pending'
	| 'approved'
	| 'paid'
	| 'overdue'
	| 'cancelled'
	| 'partial';

export type BillType =
	| 'purchase'
	| 'expense'
	| 'subscription'
	| 'utility'
	| 'rent'
	| 'other';

export interface BillLineItem {
	id: string;
	productId?: string;
	description: string;
	quantity: number;
	unitPrice: number;
	discountPct: number;
	total: number;
}

export interface Bill {
	id: string;
	billNumber: string;
	companyId: string;
	vendorId: string;
	vendorName: string;
	vendorEmail: string;
	vendorTaxId?: string;
	billDate: string;
	dueDate: string;
	type: BillType;
	status: BillStatus;
	items: BillLineItem[];
	subtotal: number;
	discount: number;
	taxRate: number;
	taxAmount: number;
	shippingAmount: number;
	totalAmount: number;
	paidAmount: number;
	currency: string;
	notes?: string;
	invoiceNumber?: string;
	poNumber?: string;
	paymentTerms?: string;
	attachments?: string[];
	createdAt: string;
	updatedAt: string;
}

interface BillState {
	bills: Bill[];
	currentBill: Bill | null;
	loading: boolean;
	error: string | null;
	fetchBills: (companyId: string) => Promise<void>;
	fetchBillById: (companyId: string, billId: string) => Promise<void>;
	createBill: (companyId: string, bill: Partial<Bill>) => Promise<Bill>;
	updateBill: (
		companyId: string,
		billId: string,
		bill: Partial<Bill>
	) => Promise<void>;
	updateBillStatus: (
		companyId: string,
		billId: string,
		status: BillStatus
	) => Promise<void>;
	recordPayment: (
		companyId: string,
		billId: string,
		payment: any
	) => Promise<void>;
	deleteBill: (companyId: string, billId: string) => Promise<void>;
	clearError: () => void;
}

export const useBillStore = create<BillState>()(
	devtools(
		(set, get) => ({
			bills: [],
			currentBill: null,
			loading: false,
			error: null,

			fetchBills: async (companyId: string) => {
				set({ loading: true, error: null });
				try {
					const response = await API.get(`/companies/${companyId}/bills`);
					set({ bills: response.data, loading: false });
				} catch (error: any) {
					set({
						error: error.response?.data?.message || error.message,
						loading: false,
					});
				}
			},

			fetchBillById: async (companyId: string, billId: string) => {
				set({ loading: true, error: null });
				try {
					const response = await API.get(
						`/companies/${companyId}/bills/${billId}`
					);
					set({ currentBill: response.data, loading: false });
				} catch (error: any) {
					set({
						error: error.response?.data?.message || error.message,
						loading: false,
					});
				}
			},

			createBill: async (companyId: string, bill: Partial<Bill>) => {
				set({ loading: true, error: null });
				try {
					const response = await API.post(
						`/companies/${companyId}/bills`,
						bill
					);
					const newBill = response.data;
					set((state) => ({
						bills: [newBill, ...state.bills],
						loading: false,
					}));
					return newBill;
				} catch (error: any) {
					set({
						error: error.response?.data?.message || error.message,
						loading: false,
					});
					throw error;
				}
			},

			updateBill: async (
				companyId: string,
				billId: string,
				bill: Partial<Bill>
			) => {
				set({ loading: true, error: null });
				try {
					const response = await API.put(
						`/companies/${companyId}/bills/${billId}`,
						bill
					);
					const updatedBill = response.data;
					set((state) => ({
						bills: state.bills.map((b) => (b.id === billId ? updatedBill : b)),
						currentBill: updatedBill,
						loading: false,
					}));
				} catch (error: any) {
					set({
						error: error.response?.data?.message || error.message,
						loading: false,
					});
					throw error;
				}
			},

			updateBillStatus: async (
				companyId: string,
				billId: string,
				status: BillStatus
			) => {
				set({ loading: true, error: null });
				try {
					const response = await API.patch(
						`/companies/${companyId}/bills/${billId}/status`,
						{ status }
					);
					const updatedBill = response.data;
					set((state) => ({
						bills: state.bills.map((b) => (b.id === billId ? updatedBill : b)),
						currentBill:
							state.currentBill?.id === billId ?
								updatedBill
							:	state.currentBill,
						loading: false,
					}));
				} catch (error: any) {
					set({
						error: error.response?.data?.message || error.message,
						loading: false,
					});
					throw error;
				}
			},

			recordPayment: async (
				companyId: string,
				billId: string,
				payment: any
			) => {
				set({ loading: true, error: null });
				try {
					const response = await API.post(
						`/companies/${companyId}/bills/${billId}/payments`,
						payment
					);
					const updatedBill = response.data;
					set((state) => ({
						bills: state.bills.map((b) => (b.id === billId ? updatedBill : b)),
						currentBill: updatedBill,
						loading: false,
					}));
				} catch (error: any) {
					set({
						error: error.response?.data?.message || error.message,
						loading: false,
					});
					throw error;
				}
			},

			deleteBill: async (companyId: string, billId: string) => {
				set({ loading: true, error: null });
				try {
					await API.delete(`/companies/${companyId}/bills/${billId}`);
					set((state) => ({
						bills: state.bills.filter((b) => b.id !== billId),
						loading: false,
					}));
				} catch (error: any) {
					set({
						error: error.response?.data?.message || error.message,
						loading: false,
					});
					throw error;
				}
			},

			clearError: () => set({ error: null }),
		}),
		{ name: 'BillStore' }
	)
);

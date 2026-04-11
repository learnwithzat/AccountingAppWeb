/** @format */

// store/useBillStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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
					const response = await fetch(`/api/companies/${companyId}/bills`);
					if (!response.ok) throw new Error('Failed to fetch bills');
					const data = await response.json();
					set({ bills: data, loading: false });
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
				}
			},

			fetchBillById: async (companyId: string, billId: string) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/bills/${billId}`
					);
					if (!response.ok) throw new Error('Failed to fetch bill');
					const data = await response.json();
					set({ currentBill: data, loading: false });
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
				}
			},

			createBill: async (companyId: string, bill: Partial<Bill>) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(`/api/companies/${companyId}/bills`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(bill),
					});
					if (!response.ok) throw new Error('Failed to create bill');
					const newBill = await response.json();
					set((state) => ({
						bills: [newBill, ...state.bills],
						loading: false,
					}));
					return newBill;
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
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
					const response = await fetch(
						`/api/companies/${companyId}/bills/${billId}`,
						{
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(bill),
						}
					);
					if (!response.ok) throw new Error('Failed to update bill');
					const updatedBill = await response.json();
					set((state) => ({
						bills: state.bills.map((b) => (b.id === billId ? updatedBill : b)),
						currentBill: updatedBill,
						loading: false,
					}));
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
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
					const response = await fetch(
						`/api/companies/${companyId}/bills/${billId}/status`,
						{
							method: 'PATCH',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ status }),
						}
					);
					if (!response.ok) throw new Error('Failed to update bill status');
					const updatedBill = await response.json();
					set((state) => ({
						bills: state.bills.map((b) => (b.id === billId ? updatedBill : b)),
						currentBill:
							state.currentBill?.id === billId ?
								updatedBill
							:	state.currentBill,
						loading: false,
					}));
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
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
					const response = await fetch(
						`/api/companies/${companyId}/bills/${billId}/payments`,
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(payment),
						}
					);
					if (!response.ok) throw new Error('Failed to record payment');
					const updatedBill = await response.json();
					set((state) => ({
						bills: state.bills.map((b) => (b.id === billId ? updatedBill : b)),
						currentBill: updatedBill,
						loading: false,
					}));
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
					throw error;
				}
			},

			deleteBill: async (companyId: string, billId: string) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/bills/${billId}`,
						{
							method: 'DELETE',
						}
					);
					if (!response.ok) throw new Error('Failed to delete bill');
					set((state) => ({
						bills: state.bills.filter((b) => b.id !== billId),
						loading: false,
					}));
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
					throw error;
				}
			},

			clearError: () => set({ error: null }),
		}),
		{ name: 'BillStore' }
	)
);

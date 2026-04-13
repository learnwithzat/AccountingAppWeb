/** @format */

// store/useReturnStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import API from '@/lib/api';

export type ReturnStatus =
	| 'requested'
	| 'approved'
	| 'processing'
	| 'completed'
	| 'rejected'
	| 'partial';

export type ReturnReason =
	| 'defective'
	| 'wrong_item'
	| 'damaged'
	| 'not_as_described'
	| 'changed_mind'
	| 'better_price'
	| 'other';

export interface ReturnItem {
	id: string;
	productId?: string;
	description: string;
	quantity: number;
	originalPrice: number;
	refundAmount: number;
	reason: ReturnReason;
	notes?: string;
}

export interface ReturnOrder {
	id: string;
	returnNumber: string;
	companyId: string;
	orderId: string;
	orderNumber: string;
	customerId?: string;
	customerName: string;
	customerEmail: string;
	customerPhone?: string;
	returnDate: string;
	status: ReturnStatus;
	reason: ReturnReason;
	items: ReturnItem[];
	subtotal: number;
	shippingRefund: number;
	taxRefund: number;
	restockingFee: number;
	totalAmount: number;
	refundMethod: 'original_payment' | 'store_credit' | 'bank_transfer' | 'check';
	refundTransactionId?: string;
	notes?: string;
	approvedBy?: string;
	approvedAt?: string;
	currency: string;
	createdAt: string;
	updatedAt: string;
}

interface ReturnState {
	returns: ReturnOrder[];
	currentReturn: ReturnOrder | null;
	loading: boolean;
	error: string | null;
	fetchReturns: (companyId: string) => Promise<void>;
	fetchReturnById: (companyId: string, returnId: string) => Promise<void>;
	createReturn: (
		companyId: string,
		returnData: Partial<ReturnOrder>
	) => Promise<ReturnOrder>;
	updateReturn: (
		companyId: string,
		returnId: string,
		returnData: Partial<ReturnOrder>
	) => Promise<void>;
	updateReturnStatus: (
		companyId: string,
		returnId: string,
		status: ReturnStatus
	) => Promise<void>;
	deleteReturn: (companyId: string, returnId: string) => Promise<void>;
	processRefund: (
		companyId: string,
		returnId: string,
		refundData: any
	) => Promise<void>;
	clearError: () => void;
}

export const useReturnStore = create<ReturnState>()(
	devtools(
		(set, get) => ({
			returns: [],
			currentReturn: null,
			loading: false,
			error: null,

			fetchReturns: async (companyId: string) => {
				set({ loading: true, error: null });
				try {
					const response = await API.get(`/companies/${companyId}/returns`);
					set({ returns: response.data, loading: false });
				} catch (error: any) {
					set({
						error: error.response?.data?.message || error.message,
						loading: false,
					});
				}
			},

			fetchReturnById: async (companyId: string, returnId: string) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/returns/${returnId}`
					);
					if (!response.ok) throw new Error('Failed to fetch return');
					const data = await response.json();
					set({ currentReturn: data, loading: false });
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
				}
			},

			createReturn: async (
				companyId: string,
				returnData: Partial<ReturnOrder>
			) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(`/api/companies/${companyId}/returns`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(returnData),
					});
					if (!response.ok) throw new Error('Failed to create return');
					const newReturn = await response.json();
					set((state) => ({
						returns: [newReturn, ...state.returns],
						loading: false,
					}));
					return newReturn;
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
					throw error;
				}
			},

			updateReturn: async (
				companyId: string,
				returnId: string,
				returnData: Partial<ReturnOrder>
			) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/returns/${returnId}`,
						{
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(returnData),
						}
					);
					if (!response.ok) throw new Error('Failed to update return');
					const updatedReturn = await response.json();
					set((state) => ({
						returns: state.returns.map((r) =>
							r.id === returnId ? updatedReturn : r
						),
						currentReturn: updatedReturn,
						loading: false,
					}));
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
					throw error;
				}
			},

			updateReturnStatus: async (
				companyId: string,
				returnId: string,
				status: ReturnStatus
			) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/returns/${returnId}/status`,
						{
							method: 'PATCH',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ status }),
						}
					);
					if (!response.ok) throw new Error('Failed to update return status');
					const updatedReturn = await response.json();
					set((state) => ({
						returns: state.returns.map((r) =>
							r.id === returnId ? updatedReturn : r
						),
						currentReturn:
							state.currentReturn?.id === returnId ?
								updatedReturn
							:	state.currentReturn,
						loading: false,
					}));
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
					throw error;
				}
			},

			deleteReturn: async (companyId: string, returnId: string) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/returns/${returnId}`,
						{
							method: 'DELETE',
						}
					);
					if (!response.ok) throw new Error('Failed to delete return');
					set((state) => ({
						returns: state.returns.filter((r) => r.id !== returnId),
						loading: false,
					}));
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
					throw error;
				}
			},

			processRefund: async (
				companyId: string,
				returnId: string,
				refundData: any
			) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/returns/${returnId}/refund`,
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(refundData),
						}
					);
					if (!response.ok) throw new Error('Failed to process refund');
					const updatedReturn = await response.json();
					set((state) => ({
						returns: state.returns.map((r) =>
							r.id === returnId ? updatedReturn : r
						),
						currentReturn: updatedReturn,
						loading: false,
					}));
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
					throw error;
				}
			},

			clearError: () => set({ error: null }),
		}),
		{ name: 'ReturnStore' }
	)
);

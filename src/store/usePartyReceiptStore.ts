/** @format */

// store/usePartyReceiptStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type PartyReceiptStatus =
	| 'draft'
	| 'pending'
	| 'processing'
	| 'completed'
	| 'failed'
	| 'cancelled'
	| 'refunded';

export type PartyType =
	| 'customer'
	| 'vendor'
	| 'supplier'
	| 'employee'
	| 'other';

export type ReceiptMethod =
	| 'bank_transfer'
	| 'credit_card'
	| 'debit_card'
	| 'cash'
	| 'check'
	| 'paypal'
	| 'stripe'
	| 'crypto'
	| 'other';

export interface ReceiptAttachment {
	id: string;
	name: string;
	url: string;
	size: number;
	type: string;
}

export interface PartyReceipt {
	id: string;
	receiptNumber: string;
	companyId: string;
	partyId: string;
	partyName: string;
	partyType: PartyType;
	partyEmail?: string;
	partyPhone?: string;
	amount: number;
	currency: string;
	receiptDate: string;
	method: ReceiptMethod;
	status: PartyReceiptStatus;
	description?: string;
	reference?: string;
	notes?: string;
	attachments?: ReceiptAttachment[];
	relatedInvoiceId?: string;
	relatedBillId?: string;
	depositToAccount?: string;
	bankAccountId?: string;
	processedBy?: string;
	processedAt?: string;
	createdAt: string;
	updatedAt: string;
}

interface PartyReceiptState {
	receipts: PartyReceipt[];
	currentReceipt: PartyReceipt | null;
	loading: boolean;
	error: string | null;
	fetchReceipts: (companyId: string) => Promise<void>;
	fetchReceiptById: (companyId: string, receiptId: string) => Promise<void>;
	createReceipt: (
		companyId: string,
		receipt: Partial<PartyReceipt>
	) => Promise<PartyReceipt>;
	updateReceipt: (
		companyId: string,
		receiptId: string,
		receipt: Partial<PartyReceipt>
	) => Promise<void>;
	updateReceiptStatus: (
		companyId: string,
		receiptId: string,
		status: PartyReceiptStatus
	) => Promise<void>;
	completeReceipt: (
		companyId: string,
		receiptId: string,
		completionData: any
	) => Promise<void>;
	deleteReceipt: (companyId: string, receiptId: string) => Promise<void>;
	clearError: () => void;
}

export const usePartyReceiptStore = create<PartyReceiptState>()(
	devtools(
		(set, get) => ({
			receipts: [],
			currentReceipt: null,
			loading: false,
			error: null,

			fetchReceipts: async (companyId: string) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/party-receipts`
					);
					if (!response.ok) throw new Error('Failed to fetch receipts');
					const data = await response.json();
					set({ receipts: data, loading: false });
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
				}
			},

			fetchReceiptById: async (companyId: string, receiptId: string) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/party-receipts/${receiptId}`
					);
					if (!response.ok) throw new Error('Failed to fetch receipt');
					const data = await response.json();
					set({ currentReceipt: data, loading: false });
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
				}
			},

			createReceipt: async (
				companyId: string,
				receipt: Partial<PartyReceipt>
			) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/party-receipts`,
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(receipt),
						}
					);
					if (!response.ok) throw new Error('Failed to create receipt');
					const newReceipt = await response.json();
					set((state) => ({
						receipts: [newReceipt, ...state.receipts],
						loading: false,
					}));
					return newReceipt;
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
					throw error;
				}
			},

			updateReceipt: async (
				companyId: string,
				receiptId: string,
				receipt: Partial<PartyReceipt>
			) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/party-receipts/${receiptId}`,
						{
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(receipt),
						}
					);
					if (!response.ok) throw new Error('Failed to update receipt');
					const updatedReceipt = await response.json();
					set((state) => ({
						receipts: state.receipts.map((r) =>
							r.id === receiptId ? updatedReceipt : r
						),
						currentReceipt: updatedReceipt,
						loading: false,
					}));
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
					throw error;
				}
			},

			updateReceiptStatus: async (
				companyId: string,
				receiptId: string,
				status: PartyReceiptStatus
			) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/party-receipts/${receiptId}/status`,
						{
							method: 'PATCH',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ status }),
						}
					);
					if (!response.ok) throw new Error('Failed to update receipt status');
					const updatedReceipt = await response.json();
					set((state) => ({
						receipts: state.receipts.map((r) =>
							r.id === receiptId ? updatedReceipt : r
						),
						currentReceipt:
							state.currentReceipt?.id === receiptId ?
								updatedReceipt
							:	state.currentReceipt,
						loading: false,
					}));
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
					throw error;
				}
			},

			completeReceipt: async (
				companyId: string,
				receiptId: string,
				completionData: any
			) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/party-receipts/${receiptId}/complete`,
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(completionData),
						}
					);
					if (!response.ok) throw new Error('Failed to complete receipt');
					const updatedReceipt = await response.json();
					set((state) => ({
						receipts: state.receipts.map((r) =>
							r.id === receiptId ? updatedReceipt : r
						),
						currentReceipt: updatedReceipt,
						loading: false,
					}));
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
					throw error;
				}
			},

			deleteReceipt: async (companyId: string, receiptId: string) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/party-receipts/${receiptId}`,
						{
							method: 'DELETE',
						}
					);
					if (!response.ok) throw new Error('Failed to delete receipt');
					set((state) => ({
						receipts: state.receipts.filter((r) => r.id !== receiptId),
						loading: false,
					}));
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
					throw error;
				}
			},

			clearError: () => set({ error: null }),
		}),
		{ name: 'PartyReceiptStore' }
	)
);

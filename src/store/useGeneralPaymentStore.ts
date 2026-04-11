/** @format */

// store/useGeneralPaymentStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type PaymentStatus =
	| 'draft'
	| 'pending'
	| 'processing'
	| 'completed'
	| 'failed'
	| 'cancelled'
	| 'refunded';

export type PaymentMethod =
	| 'bank_transfer'
	| 'credit_card'
	| 'debit_card'
	| 'cash'
	| 'check'
	| 'paypal'
	| 'stripe'
	| 'other';

export type PaymentCategory =
	| 'rent'
	| 'utilities'
	| 'salary'
	| 'taxes'
	| 'insurance'
	| 'marketing'
	| 'software'
	| 'office_supplies'
	| 'travel'
	| 'maintenance'
	| 'professional_services'
	| 'shipping'
	| 'inventory'
	| 'equipment'
	| 'miscellaneous';

export interface Attachment {
	id: string;
	name: string;
	url: string;
	size: number;
	type: string;
}

export interface GeneralPayment {
	id: string;
	paymentNumber: string;
	companyId: string;
	payee: string;
	payeeEmail?: string;
	payeePhone?: string;
	amount: number;
	currency: string;
	paymentDate: string;
	category: PaymentCategory;
	method: PaymentMethod;
	status: PaymentStatus;
	description?: string;
	reference?: string;
	notes?: string;
	attachments?: Attachment[];
	approvalRequired: boolean;
	approvedBy?: string;
	approvedAt?: string;
	processedBy?: string;
	processedAt?: string;
	createdAt: string;
	updatedAt: string;
}

interface GeneralPaymentState {
	payments: GeneralPayment[];
	currentPayment: GeneralPayment | null;
	loading: boolean;
	error: string | null;
	fetchPayments: (companyId: string) => Promise<void>;
	fetchPaymentById: (companyId: string, paymentId: string) => Promise<void>;
	createPayment: (
		companyId: string,
		payment: Partial<GeneralPayment>
	) => Promise<GeneralPayment>;
	updatePayment: (
		companyId: string,
		paymentId: string,
		payment: Partial<GeneralPayment>
	) => Promise<void>;
	updatePaymentStatus: (
		companyId: string,
		paymentId: string,
		status: PaymentStatus
	) => Promise<void>;
	processPayment: (
		companyId: string,
		paymentId: string,
		processData: any
	) => Promise<void>;
	deletePayment: (companyId: string, paymentId: string) => Promise<void>;
	clearError: () => void;
}

export const useGeneralPaymentStore = create<GeneralPaymentState>()(
	devtools(
		(set, get) => ({
			payments: [],
			currentPayment: null,
			loading: false,
			error: null,

			fetchPayments: async (companyId: string) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/general-payments`
					);
					if (!response.ok) throw new Error('Failed to fetch payments');
					const data = await response.json();
					set({ payments: data, loading: false });
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
				}
			},

			fetchPaymentById: async (companyId: string, paymentId: string) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/general-payments/${paymentId}`
					);
					if (!response.ok) throw new Error('Failed to fetch payment');
					const data = await response.json();
					set({ currentPayment: data, loading: false });
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
				}
			},

			createPayment: async (
				companyId: string,
				payment: Partial<GeneralPayment>
			) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/general-payments`,
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(payment),
						}
					);
					if (!response.ok) throw new Error('Failed to create payment');
					const newPayment = await response.json();
					set((state) => ({
						payments: [newPayment, ...state.payments],
						loading: false,
					}));
					return newPayment;
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
					throw error;
				}
			},

			updatePayment: async (
				companyId: string,
				paymentId: string,
				payment: Partial<GeneralPayment>
			) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/general-payments/${paymentId}`,
						{
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(payment),
						}
					);
					if (!response.ok) throw new Error('Failed to update payment');
					const updatedPayment = await response.json();
					set((state) => ({
						payments: state.payments.map((p) =>
							p.id === paymentId ? updatedPayment : p
						),
						currentPayment: updatedPayment,
						loading: false,
					}));
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
					throw error;
				}
			},

			updatePaymentStatus: async (
				companyId: string,
				paymentId: string,
				status: PaymentStatus
			) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/general-payments/${paymentId}/status`,
						{
							method: 'PATCH',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ status }),
						}
					);
					if (!response.ok) throw new Error('Failed to update payment status');
					const updatedPayment = await response.json();
					set((state) => ({
						payments: state.payments.map((p) =>
							p.id === paymentId ? updatedPayment : p
						),
						currentPayment:
							state.currentPayment?.id === paymentId ?
								updatedPayment
							:	state.currentPayment,
						loading: false,
					}));
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
					throw error;
				}
			},

			processPayment: async (
				companyId: string,
				paymentId: string,
				processData: any
			) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/general-payments/${paymentId}/process`,
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(processData),
						}
					);
					if (!response.ok) throw new Error('Failed to process payment');
					const updatedPayment = await response.json();
					set((state) => ({
						payments: state.payments.map((p) =>
							p.id === paymentId ? updatedPayment : p
						),
						currentPayment: updatedPayment,
						loading: false,
					}));
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
					throw error;
				}
			},

			deletePayment: async (companyId: string, paymentId: string) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/general-payments/${paymentId}`,
						{
							method: 'DELETE',
						}
					);
					if (!response.ok) throw new Error('Failed to delete payment');
					set((state) => ({
						payments: state.payments.filter((p) => p.id !== paymentId),
						loading: false,
					}));
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
					throw error;
				}
			},

			clearError: () => set({ error: null }),
		}),
		{ name: 'GeneralPaymentStore' }
	)
);

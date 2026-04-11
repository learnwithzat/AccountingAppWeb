/** @format */

import { create } from 'zustand';
import API from '@/lib/api';

export type LineItem = {
	id: string;
	description: string;
	hsn: string;
	qty: number;
	unitPrice: number;
	discountPct: number;
};

export type CompanySettings = {
	id: string;
	companyName: string;
	country: string;
	taxSystem: string;
	defaultTaxRate: number;
	currency: string;
	invoicePrefix: string;
	billingEmail: string;
	taxId: string;
	address: string;
};

export type Invoice = {
	id: string;
	invoiceNumber: string;
	invoiceDate: string;
	dueDate: string;
	billToCompany: string;
	total: number;
	status: string;
};

interface InvoiceState {
	invoices: Invoice[];
	invoiceNumber: string;
	invoiceDate: string;
	dueDate: string;
	items: LineItem[];
	billToCompany: string;
	additionalDiscount: number;
	settings: CompanySettings | null;
	taxData: any | null;
	loading: boolean;
	saving: boolean;
	error: string | null;

	// Actions
	fetchInvoices: (companyId: string) => Promise<void>;
	fetchBuilderData: (companyId: string) => Promise<void>;
	updateInvoice: (updates: Partial<InvoiceState>) => void;
	updateItem: (id: string, updates: Partial<LineItem>) => void;
	addItem: () => void;
	removeItem: (id: string) => void;
	calculateTax: (companyId: string) => Promise<void>;
	saveInvoice: (companyId: string, totals: any) => Promise<void>;
}

const uid = () => Math.random().toString(36).slice(2, 9);

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
	invoices: [],
	invoiceNumber: '',
	invoiceDate: new Date().toISOString().split('T')[0],
	dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
		.toISOString()
		.split('T')[0],
	items: [
		{
			id: uid(),
			description: '',
			hsn: '',
			qty: 1,
			unitPrice: 0,
			discountPct: 0,
		},
	],
	billToCompany: '',
	additionalDiscount: 0,
	settings: null,
	taxData: null,
	loading: false,
	saving: false,
	error: null,

	fetchInvoices: async (companyId) => {
		try {
			set({ loading: true, error: null });
			const res = await API.get(`/invoice?companyId=${companyId}`);
			set({ invoices: res.data });
		} catch (err) {
			set({ error: 'Failed to load invoices' });
		} finally {
			set({ loading: false });
		}
	},

	fetchBuilderData: async (companyId) => {
		try {
			set({ loading: true, error: null });
			const [sRes, numRes] = await Promise.all([
				API.get(`/company/${companyId}`),
				API.get(`/invoice/next-number?companyId=${companyId}`),
			]);
			set({ settings: sRes.data, invoiceNumber: numRes.data.invoiceNumber });
		} catch (err) {
			set({ error: 'Failed to load builder settings' });
		} finally {
			set({ loading: false });
		}
	},

	updateInvoice: (updates) => set((state) => ({ ...state, ...updates })),

	updateItem: (id, updates) =>
		set((state) => ({
			items: state.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
		})),

	addItem: () =>
		set((state) => ({
			items: [
				...state.items,
				{
					id: uid(),
					description: '',
					hsn: '',
					qty: 1,
					unitPrice: 0,
					discountPct: 0,
				},
			],
		})),

	removeItem: (id) =>
		set((state) => ({
			items: state.items.filter((i) => i.id !== id),
		})),

	calculateTax: async (companyId) => {
		const { billToCompany, items, additionalDiscount, settings } = get();
		if (!settings) return;

		const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
		const disc = items.reduce(
			(s, i) => s + i.qty * i.unitPrice * (i.discountPct / 100),
			0
		);
		const amount = subtotal - disc - additionalDiscount;

		try {
			const res = await API.post('/invoice/calculate-tax', {
				companyId,
				customer: billToCompany,
				amount,
				country: settings.country,
			});
			set({ taxData: res.data });
		} catch (err) {
			console.error('Tax calc error', err);
		}
	},

	saveInvoice: async (companyId, totals) => {
		const state = get();
		try {
			set({ saving: true });
			await API.post('/invoice', {
				invoiceNumber: state.invoiceNumber,
				invoiceDate: state.invoiceDate,
				dueDate: state.dueDate,
				items: state.items,
				billToCompany: state.billToCompany,
				companyId,
				taxAmount: state.taxData?.taxAmount,
				total: totals.grand + (state.taxData?.taxAmount || 0),
			});
			alert('Saved Successfully');
		} catch {
			alert('Error saving invoice');
		} finally {
			set({ saving: false });
		}
	},
}));

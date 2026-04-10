/** @format */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import API from '@/lib/api';

/* ───────── TYPES ───────── */

type LineItem = {
	id: string;
	description: string;
	hsn: string;
	qty: number;
	unitPrice: number;
	discountPct: number;
};

type CompanySettings = {
	id: string;
	companyName: string;
	country: string;
	taxSystem: string;
	defaultTaxRate: number;
	currency: string;
	invoicePrefix: string;
};

type InvoiceState = {
	invoiceNumber: string;
	invoiceDate: string;
	dueDate: string;
	paymentTerms: string;
	billToCompany: string;
	billToContact: string;
	billToGst: string;
	notes: string;
	terms: string;
	items: LineItem[];
	taxRate: number;
	additionalDiscount: number;
};

/* ───────── HELPERS ───────── */

const uid = () => Math.random().toString(36).slice(2, 9);

const isoDate = (d = 0) => {
	const dt = new Date();
	dt.setDate(dt.getDate() + d);
	return dt.toISOString().split('T')[0];
};

const emptyItem = (): LineItem => ({
	id: uid(),
	description: '',
	hsn: '',
	qty: 1,
	unitPrice: 0,
	discountPct: 0,
});

const calcTotals = (items: LineItem[], discount: number) => {
	const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
	const itemDiscounts = items.reduce(
		(s, i) => s + i.qty * i.unitPrice * (i.discountPct / 100),
		0
	);
	const afterItemDisc = subtotal - itemDiscounts;

	return {
		subtotal,
		itemDiscounts,
		afterItemDisc,
		grand: afterItemDisc - discount,
	};
};

const makeFmt = (currency: string) => {
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency,
		}).format;
	} catch {
		return (n: number) => n.toFixed(2);
	}
};

/* ───────── COMPONENT ───────── */

export default function SalesInvoiceBuilder() {
	const { companyId, loading: authLoading } = useAuth();

	const [settings, setSettings] = useState<CompanySettings | null>(null);
	const [error, setError] = useState<string | null>(null);

	const [state, setState] = useState<InvoiceState>({
		invoiceNumber: '',
		invoiceDate: isoDate(),
		dueDate: isoDate(30),
		paymentTerms: 'Net 30',
		billToCompany: '',
		billToContact: '',
		billToGst: '',
		notes: '',
		terms: '',
		items: [emptyItem()],
		taxRate: 0,
		additionalDiscount: 0,
	});

	const [taxData, setTaxData] = useState<any>(null);
	const [preview, setPreview] = useState<any>(null);
	const [saving, setSaving] = useState(false);

	/* ───────── LOAD COMPANY DATA ───────── */
	useEffect(() => {
		if (authLoading) return;
		if (!companyId) return;

		(async () => {
			try {
				const s = (await API.get(`/company/${companyId}`)).data;

				const num = (
					await API.get(`/invoice/next-number?companyId=${companyId}`)
				).data;

				setSettings(s);

				setState((prev) => ({
					...prev,
					invoiceNumber: num.invoiceNumber,
					taxRate: s.defaultTaxRate,
				}));
			} catch (err) {
				console.error(err);
				setError('Failed to load company data');
			}
		})();
	}, [companyId, authLoading]);

	/* ───────── TOTALS ───────── */
	const totals = useMemo(
		() => calcTotals(state.items, state.additionalDiscount),
		[state.items, state.additionalDiscount]
	);

	const fmt = useMemo(() => makeFmt(settings?.currency || 'USD'), [settings]);

	/* ───────── TAX API ───────── */
	useEffect(() => {
		if (!companyId || !settings) return;

		const t = setTimeout(async () => {
			try {
				const res = await API.post('/invoice/calculate-tax', {
					companyId,
					customer: state.billToCompany,
					amount: totals.afterItemDisc,
					country: settings.country,
				});

				setTaxData(res.data);
			} catch (err) {
				console.error(err);
			}
		}, 400);

		return () => clearTimeout(t);
	}, [companyId, settings, state.billToCompany, totals.afterItemDisc]);

	/* ───────── SAVE ───────── */
	const handleSave = async () => {
		if (!companyId) return;

		try {
			setSaving(true);

			await API.post('/invoice', {
				...state,
				companyId,
				taxAmount: taxData?.taxAmount,
				total: totals.grand + (taxData?.taxAmount || 0),
			});

			alert('Saved');
		} catch {
			alert('Error saving');
		} finally {
			setSaving(false);
		}
	};

	/* ───────── UI STATES ───────── */

	if (authLoading) return <div className='p-6'>Loading session...</div>;

	if (!companyId) {
		return <div className='p-6 text-red-500'>Login required (no company)</div>;
	}

	if (error) return <div className='p-6 text-red-500'>{error}</div>;

	if (!settings) {
		return <div className='p-6'>Loading company data...</div>;
	}

	/* ───────── UI ───────── */

	return (
		<div className='p-6 max-w-5xl mx-auto space-y-4'>
			<h1 className='text-xl font-semibold'>Invoice #{state.invoiceNumber}</h1>

			<input
				className='border p-2 w-full'
				placeholder='Customer'
				value={state.billToCompany}
				onChange={(e) =>
					setState((s) => ({ ...s, billToCompany: e.target.value }))
				}
			/>

			{state.items.map((item) => (
				<div
					key={item.id}
					className='flex gap-2'>
					<input
						placeholder='Desc'
						value={item.description}
						onChange={(e) =>
							setState((s) => ({
								...s,
								items: s.items.map((i) =>
									i.id === item.id ? { ...i, description: e.target.value } : i
								),
							}))
						}
					/>
				</div>
			))}

			<button
				onClick={handleSave}
				disabled={saving}
				className='bg-blue-600 text-white px-4 py-2'>
				{saving ? 'Saving...' : 'Save'}
			</button>
		</div>
	);
}

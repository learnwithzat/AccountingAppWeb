/** @format */
'use client';

import { useEffect, useMemo, useCallback, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useInvoiceStore, LineItem } from '@/store/useInvoiceStore';

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */

const todayISO = () => new Date().toISOString().split('T')[0];

const addDays = (date: string, days: number) => {
	const d = new Date(date);
	d.setDate(d.getDate() + days);
	return d.toISOString().split('T')[0];
};

const makeCurrencyFormatter = (currency: string) => {
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency,
		});
	} catch {
		return { format: (n: number) => n.toFixed(2) };
	}
};

const calcTotals = (items: LineItem[], discount: number, taxRate: number) => {
	const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
	const itemDiscounts = items.reduce(
		(s, i) => s + i.qty * i.unitPrice * (i.discountPct / 100),
		0
	);

	const afterItem = subtotal - itemDiscounts;
	const taxable = Math.max(0, afterItem - discount);
	const tax = taxable * (taxRate / 100);

	return {
		subtotal,
		itemDiscounts,
		grand: taxable + tax,
		tax,
	};
};

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */

export default function SalesInvoiceBuilder() {
	const { user, loading: authLoading } = useAuthStore();
	const companyId = user?.companyId;

	const store = useInvoiceStore();
	const {
		items,
		invoiceNumber,
		additionalDiscount,
		settings,
		taxData,
		loading,
		error,
		saving,
		fetchBuilderData,
		updateInvoice,
		updateItem,
		addItem,
		removeItem,
		saveInvoice,
	} = store;

	/* ─────────────────────────────────────────
	   STATE (Grouped)
	───────────────────────────────────────── */

	const [meta, setMeta] = useState({
		currency: 'USD',
		taxRate: 0,
		invoiceDate: todayISO(),
		dueDate: addDays(todayISO(), 30),
		paymentTerms: 30,
	});

	const [from, setFrom] = useState({
		company: '',
		email: '',
		taxId: '',
		address: '',
	});

	const [to, setTo] = useState({
		company: '',
		contact: '',
		email: '',
		address: '',
	});

	const [extra, setExtra] = useState({
		notes: '',
		terms: '',
	});

	const [toast, setToast] = useState({
		show: false,
		message: '',
		type: 'success',
	});

	/* ─────────────────────────────────────────
	   COMPUTED
	───────────────────────────────────────── */

	const fmt = useMemo(
		() => makeCurrencyFormatter(meta.currency),
		[meta.currency]
	);

	const totals = useMemo(
		() => calcTotals(items, additionalDiscount, meta.taxRate),
		[items, additionalDiscount, meta.taxRate]
	);

	/* ─────────────────────────────────────────
	   EFFECTS
	───────────────────────────────────────── */

	useEffect(() => {
		if (companyId) fetchBuilderData(companyId);
	}, [companyId, fetchBuilderData]);

	useEffect(() => {
		if (!settings) return;

		setFrom({
			company: settings.companyName ?? '',
			email: settings.billingEmail ?? '',
			taxId: settings.taxId ?? '',
			address: settings.address ?? '',
		});
	}, [settings]);

	useEffect(() => {
		if (taxData?.rate) {
			setMeta((p) => ({ ...p, taxRate: taxData.rate }));
		}
	}, [taxData]);

	/* ─────────────────────────────────────────
	   HANDLERS
	───────────────────────────────────────── */

	const updateMeta = (key: string, value: any) => {
		setMeta((prev) => ({ ...prev, [key]: value }));
	};

	const updateFrom = (key: string, value: string) => {
		setFrom((p) => ({ ...p, [key]: value }));
	};

	const updateTo = (key: string, value: string) => {
		setTo((p) => ({ ...p, [key]: value }));
	};

	const updateExtra = (key: string, value: string) => {
		setExtra((p) => ({ ...p, [key]: value }));
	};

	const handleTermsChange = (days: number) => {
		setMeta((p) => ({
			...p,
			paymentTerms: days,
			dueDate: addDays(p.invoiceDate, days),
		}));
	};

	const validateBeforeSave = useCallback(() => {
		if (!to.company || !to.email) {
			setToast({
				show: true,
				message: 'Please fill in customer information',
				type: 'error',
			});
			return false;
		}
		if (items.length === 0) {
			setToast({
				show: true,
				message: 'Please add at least one line item',
				type: 'error',
			});
			return false;
		}
		if (
			items.some(
				(item: LineItem) =>
					!item.description || item.qty <= 0 || item.unitPrice < 0
			)
		) {
			setToast({
				show: true,
				message: 'Please complete all line items',
				type: 'error',
			});
			return false;
		}
		return true;
	}, [to, items]);

	const handleSave = useCallback(async () => {
		if (!companyId) return;
		if (!validateBeforeSave()) {
			setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 2500);
			return;
		}

		await saveInvoice(companyId, totals);
		setToast({
			show: true,
			message: 'Invoice saved successfully!',
			type: 'success',
		});
		setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 2500);
	}, [companyId, totals, saveInvoice, validateBeforeSave]);

	/* ─────────────────────────────────────────
	   STATES UI
	───────────────────────────────────────── */

	if (authLoading || loading)
		return (
			<div className='p-6 text-white bg-[#0C0C0E] min-h-screen flex items-center justify-center'>
				<div className='animate-pulse'>Loading Invoice Builder...</div>
			</div>
		);
	if (!companyId) return <div className='p-6 text-white'>No company found</div>;
	if (error) return <div className='p-6 text-red-500'>{error}</div>;

	/* ─────────────────────────────────────────
	   UI
	───────────────────────────────────────── */

	return (
		<div className='p-6 text-gray-100 bg-[#0C0C0E] min-h-screen font-sans'>
			{/* HEADER */}
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>
						Invoice #{invoiceNumber}
					</h1>
					<p className='text-gray-400 text-sm'>
						Create and manage your sales invoices
					</p>
				</div>
				<button
					onClick={handleSave}
					disabled={saving}
					className='w-full md:w-auto bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg'>
					{saving ? 'Saving...' : 'Save Invoice'}
				</button>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
				{/* LEFT COLUMN */}
				<div className='space-y-8'>
					{/* FROM SECTION */}
					<div className='bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-sm'>
						<h2 className='text-lg font-bold mb-4 flex items-center gap-2'>
							<span className='w-1.5 h-6 bg-blue-500 rounded-full' />
							From (Sender)
						</h2>
						<div className='space-y-3'>
							<input
								type='text'
								placeholder='Company Name'
								value={from.company}
								onChange={(e) => updateFrom('company', e.target.value)}
								className='w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all'
							/>
							<input
								type='email'
								placeholder='Email'
								value={from.email}
								onChange={(e) => updateFrom('email', e.target.value)}
								className='w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all'
							/>
							<input
								type='text'
								placeholder='Tax ID / VAT'
								value={from.taxId}
								onChange={(e) => updateFrom('taxId', e.target.value)}
								className='w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all'
							/>
							<textarea
								placeholder='Address'
								value={from.address}
								onChange={(e) => updateFrom('address', e.target.value)}
								className='w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none'
								rows={2}
							/>
						</div>
					</div>

					{/* TO SECTION */}
					<div className='bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-sm'>
						<h2 className='text-lg font-bold mb-4 flex items-center gap-2'>
							<span className='w-1.5 h-6 bg-green-500 rounded-full' />
							To (Recipient)
						</h2>
						<div className='space-y-3'>
							<input
								type='text'
								placeholder='Company Name *'
								value={to.company}
								onChange={(e) => updateTo('company', e.target.value)}
								className='w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all'
							/>
							<input
								type='text'
								placeholder='Contact Person'
								value={to.contact}
								onChange={(e) => updateTo('contact', e.target.value)}
								className='w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all'
							/>
							<input
								type='email'
								placeholder='Email *'
								value={to.email}
								onChange={(e) => updateTo('email', e.target.value)}
								className='w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all'
							/>
							<textarea
								placeholder='Address'
								value={to.address}
								onChange={(e) => updateTo('address', e.target.value)}
								className='w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none'
								rows={2}
							/>
						</div>
					</div>
				</div>

				{/* RIGHT COLUMN */}
				<div className='space-y-8'>
					{/* INVOICE DETAILS */}
					<div className='bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-sm'>
						<h2 className='text-lg font-bold mb-4 flex items-center gap-2'>
							<span className='w-1.5 h-6 bg-purple-500 rounded-full' />
							Logistics
						</h2>
						<div className='grid grid-cols-2 gap-3'>
							<div>
								<label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1'>
									Date Issued
								</label>
								<input
									type='date'
									value={meta.invoiceDate}
									onChange={(e) => updateMeta('invoiceDate', e.target.value)}
									className='w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all'
								/>
							</div>
							<div>
								<label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1'>
									Due Date
								</label>
								<input
									type='date'
									value={meta.dueDate}
									onChange={(e) => updateMeta('dueDate', e.target.value)}
									className='w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all'
								/>
							</div>
							<div>
								<label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1'>
									Net Terms (Days)
								</label>
								<input
									type='number'
									value={meta.paymentTerms}
									onChange={(e) =>
										handleTermsChange(parseInt(e.target.value) || 0)
									}
									className='w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all'
								/>
							</div>
							<div>
								<label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1'>
									Currency
								</label>
								<select
									value={meta.currency}
									onChange={(e) => updateMeta('currency', e.target.value)}
									className='w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all'>
									{['USD', 'EUR', 'SAR', 'GBP', 'JPY'].map((c) => (
										<option key={c}>{c}</option>
									))}
								</select>
							</div>
							<div>
								<label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1'>
									VAT / Tax (%)
								</label>
								<input
									type='number'
									step='0.1'
									value={meta.taxRate}
									onChange={(e) =>
										updateMeta('taxRate', parseFloat(e.target.value) || 0)
									}
									className='w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all'
								/>
							</div>
							<div>
								<label className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1'>
									Fixed Discount
								</label>
								<input
									type='number'
									step='0.01'
									value={additionalDiscount}
									onChange={(e) =>
										updateInvoice({
											additionalDiscount: parseFloat(e.target.value) || 0,
										})
									}
									className='w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all'
								/>
							</div>
						</div>
					</div>

					{/* NOTES & TERMS */}
					<div className='bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-sm'>
						<h2 className='text-lg font-bold mb-4 flex items-center gap-2'>
							<span className='w-1.5 h-6 bg-yellow-500 rounded-full' />
							Remarks
						</h2>
						<div className='space-y-3'>
							<textarea
								placeholder='Notes (optional)'
								value={extra.notes}
								onChange={(e) => updateExtra('notes', e.target.value)}
								className='w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none transition-all resize-none'
								rows={3}
							/>
							<textarea
								placeholder='Terms & Conditions (optional)'
								value={extra.terms}
								onChange={(e) => updateExtra('terms', e.target.value)}
								className='w-full p-2.5 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none transition-all resize-none'
								rows={3}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* LINE ITEMS */}
			<div className='mt-8 bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-sm'>
				<h2 className='text-lg font-bold mb-6 flex items-center gap-2'>
					<span className='w-1.5 h-6 bg-blue-500 rounded-full' />
					Inventory & Services
				</h2>
				<div className='overflow-x-auto'>
					<table className='w-full'>
						<thead className='border-b border-gray-700'>
							<tr className='text-left'>
								<th className='pb-4 px-2 text-xs font-bold text-gray-500 uppercase tracking-widest'>
									Description
								</th>
								<th className='pb-4 px-2 w-24 text-xs font-bold text-gray-500 uppercase tracking-widest'>
									Qty
								</th>
								<th className='pb-4 px-2 w-36 text-xs font-bold text-gray-500 uppercase tracking-widest text-right'>
									Rate
								</th>
								<th className='pb-4 px-2 w-28 text-xs font-bold text-gray-500 uppercase tracking-widest text-right'>
									Disc %
								</th>
								<th className='pb-4 px-2 w-36 text-xs font-bold text-gray-500 uppercase tracking-widest text-right'>
									Amount
								</th>
								<th className='pb-4 px-2 w-12'></th>
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-800'>
							{items.map((item: LineItem) => (
								<tr
									key={item.id}
									className='group hover:bg-gray-800/30 transition-colors'>
									<td className='py-2'>
										<input
											value={item.description}
											onChange={(e) =>
												updateItem(item.id, { description: e.target.value })
											}
											placeholder='What are you selling?'
											className='w-full p-2 bg-transparent border-b border-transparent group-hover:border-gray-700 focus:border-blue-500 outline-none transition-all'
										/>
									</td>
									<td className='py-3 px-2'>
										<input
											type='number'
											step='1'
											min='0'
											value={item.qty}
											onChange={(e) =>
												updateItem(item.id, {
													qty: parseFloat(e.target.value) || 0,
												})
											}
											className='w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg text-center focus:ring-2 focus:ring-blue-500 outline-none transition-all'
										/>
									</td>
									<td className='py-3 px-2'>
										<input
											type='number'
											step='0.01'
											min='0'
											value={item.unitPrice}
											onChange={(e) =>
												updateItem(item.id, {
													unitPrice: parseFloat(e.target.value) || 0,
												})
											}
											className='w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg text-right focus:ring-2 focus:ring-blue-500 outline-none transition-all'
										/>
									</td>
									<td className='py-3 px-2'>
										<input
											type='number'
											step='0.1'
											min='0'
											max='100'
											value={item.discountPct}
											onChange={(e) =>
												updateItem(item.id, {
													discountPct: parseFloat(e.target.value) || 0,
												})
											}
											className='w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg text-right focus:ring-2 focus:ring-blue-500 outline-none transition-all'
										/>
									</td>
									<td className='py-3 px-2 text-right font-mono font-medium text-gray-300'>
										{fmt.format(
											item.qty *
												item.unitPrice *
												(1 - (item.discountPct || 0) / 100)
										)}
									</td>
									<td className='py-3 text-center'>
										<button
											onClick={() => removeItem(item.id)}
											className='p-1.5 text-red-900/40 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all opacity-0 group-hover:opacity-100'>
											✕
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<button
					onClick={addItem}
					className='mt-6 flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold transition-colors'>
					<span className='flex items-center justify-center w-5 h-5 bg-blue-500/20 rounded-full text-xs'>
						+
					</span>
					Add Line Item
				</button>
			</div>

			{/* TOTALS */}
			<div className='mt-8 pt-8 border-t border-gray-800'>
				<div className='flex justify-end'>
					<div className='w-full max-w-sm space-y-4'>
						<div className='flex justify-between text-gray-400 font-medium'>
							<span className='tracking-wide'>Subtotal</span>
							<span className='font-mono'>{fmt.format(totals.subtotal)}</span>
						</div>
						{totals.itemDiscounts > 0 && (
							<div className='flex justify-between text-red-400 font-medium'>
								<span className='tracking-wide'>Itemized Discounts</span>
								<span className='font-mono'>
									-{fmt.format(totals.itemDiscounts)}
								</span>
							</div>
						)}
						{additionalDiscount > 0 && (
							<div className='flex justify-between text-red-400 font-medium'>
								<span className='tracking-wide'>Flat Discount</span>
								<span className='font-mono'>
									-{fmt.format(additionalDiscount)}
								</span>
							</div>
						)}
						<div className='flex justify-between text-gray-400 font-medium pb-4 border-b border-gray-800'>
							<span className='tracking-wide'>Tax ({meta.taxRate}%)</span>
							<span className='font-mono'>{fmt.format(totals.tax)}</span>
						</div>
						<div className='flex justify-between text-3xl font-black text-white pt-2'>
							<span className='tracking-tighter'>Total Due</span>
							<span className='font-mono text-blue-400'>
								{fmt.format(totals.grand)}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* TOAST NOTIFICATION */}
			{toast.show && (
				<div
					className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl font-bold tracking-tight transform transition-all animate-in slide-in-from-bottom-2 ${
						toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
					} text-white z-50 shadow-green-900/20`}>
					{toast.message}
				</div>
			)}
		</div>
	);
}

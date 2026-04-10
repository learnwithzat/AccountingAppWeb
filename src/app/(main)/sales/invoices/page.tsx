/** @format */

'use client';

import { useEffect, useState } from 'react';
import API from '@/lib/api';

type Invoice = {
	invoiceNo: string;
	customer: string;
	subtotal: number;
	gstRate: number;
	gstAmount: number;
	total: number;
	date: string;
};

export default function SalesInvoicesPage() {
	const [customer, setCustomer] = useState('');
	const [amount, setAmount] = useState('');
	const [gstRate, setGstRate] = useState(18);

	const [invoiceNo, setInvoiceNo] = useState('');
	const [data, setData] = useState<Invoice[]>([]);
	const [loading, setLoading] = useState(false);

	/* ─────────────────────────────
     GET NEXT INVOICE NUMBER
  ───────────────────────────── */
	const fetchInvoiceNo = async () => {
		try {
			const companyId = '1'; // replace with auth companyId

			const res = await API.get(`/invoice/next-number?companyId=${companyId}`);

			setInvoiceNo(res.data.invoiceNo);
		} catch (err) {
			console.error('Invoice number error', err);
		}
	};

	useEffect(() => {
		fetchInvoiceNo();
	}, []);

	/* ─────────────────────────────
     CREATE INVOICE (via API preview)
  ───────────────────────────── */
	const createInvoice = async () => {
		if (!customer || !amount) return;

		try {
			setLoading(true);

			const companyId = '1';

			const res = await API.post('/invoice/preview', {
				companyId,
				customer,
				amount: Number(amount),
				gstRate,
			});

			setData([...data, res.data]);

			// refresh invoice number for next entry
			await fetchInvoiceNo();

			setCustomer('');
			setAmount('');
		} catch (err) {
			console.error('Create invoice error', err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='p-6 space-y-6'>
			{/* HEADER */}
			<h1 className='text-xl font-semibold'>Sales Invoices (API Powered)</h1>

			{/* INVOICE NO DISPLAY */}
			<div className='text-sm text-muted-foreground'>
				Current Invoice No:
				<span className='ml-2 font-semibold text-black'>
					{invoiceNo || 'Loading...'}
				</span>
			</div>

			{/* FORM */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
				<input
					className='border p-2 rounded'
					placeholder='Customer'
					value={customer}
					onChange={(e) => setCustomer(e.target.value)}
				/>

				<input
					className='border p-2 rounded'
					placeholder='Amount'
					type='number'
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
				/>

				<select
					className='border p-2 rounded'
					value={gstRate}
					onChange={(e) => setGstRate(Number(e.target.value))}>
					<option value={0}>0%</option>
					<option value={5}>5%</option>
					<option value={12}>12%</option>
					<option value={18}>18%</option>
				</select>

				<button
					onClick={createInvoice}
					disabled={loading}
					className='bg-green-600 text-white rounded p-2'>
					{loading ? 'Creating...' : 'Create Invoice'}
				</button>
			</div>

			{/* TABLE */}
			<div className='border rounded-lg overflow-hidden'>
				<table className='w-full'>
					<thead className='bg-gray-100'>
						<tr>
							<th className='border p-2'>Invoice</th>
							<th className='border p-2'>Customer</th>
							<th className='border p-2'>Subtotal</th>
							<th className='border p-2'>GST</th>
							<th className='border p-2'>Total</th>
							<th className='border p-2'>Date</th>
						</tr>
					</thead>

					<tbody>
						{data.map((inv, idx) => (
							<tr key={idx}>
								<td className='border p-2'>{inv.invoiceNo}</td>
								<td className='border p-2'>{inv.customer}</td>
								<td className='border p-2'>{inv.subtotal}</td>
								<td className='border p-2'>
									{inv.gstAmount} ({inv.gstRate}%)
								</td>
								<td className='border p-2 font-semibold'>{inv.total}</td>
								<td className='border p-2'>{inv.date}</td>
							</tr>
						))}

						{data.length === 0 && (
							<tr>
								<td
									colSpan={6}
									className='text-center p-4 text-gray-500'>
									No invoices created yet
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

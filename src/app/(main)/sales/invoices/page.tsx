/** @format */
'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useInvoiceStore, Invoice } from '@/store/useInvoiceStore';

/* ─────────────────────────────────────────
   HELPERS & UTILITIES
───────────────────────────────────────── */

const formatCurrency = (amount: number, currency: string = 'USD') => {
	return new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency,
	}).format(amount);
};

const formatDate = (dateString: string) => {
	if (!dateString) return 'N/A';
	return new Date(dateString).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
};

const getStatusBadge = (status: string) => {
	const colors: Record<string, string> = {
		paid: 'bg-green-500/10 text-green-400 border-green-500/20',
		partial: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
		overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
		sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
		draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
	};

	const colorClass = colors[status.toLowerCase()] || colors.draft;

	return (
		<span
			className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} capitalize`}>
			{status}
		</span>
	);
};

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */

export default function SalesListPage() {
	const { user } = useAuthStore();
	const companyId = user?.companyId;

	const { invoices, loading, error, fetchInvoices } = useInvoiceStore();

	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');

	useEffect(() => {
		if (companyId) fetchInvoices(companyId);
	}, [companyId, fetchInvoices]);

	/* ─────────────────────────────────────────
	   COMPUTED DATA
	───────────────────────────────────────── */

	const filteredInvoices = useMemo(() => {
		return invoices.filter((inv) => {
			const matchesSearch =
				inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
				inv.billToCompany.toLowerCase().includes(search.toLowerCase());
			const matchesStatus =
				statusFilter === 'all' || inv.status.toLowerCase() === statusFilter;
			return matchesSearch && matchesStatus;
		});
	}, [invoices, search, statusFilter]);

	const stats = useMemo(() => {
		const total = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
		const paid = filteredInvoices
			.filter((inv) => inv.status.toLowerCase() === 'paid')
			.reduce((sum, inv) => sum + inv.total, 0);
		const overdue = filteredInvoices.filter(
			(inv) => inv.status.toLowerCase() === 'overdue'
		).length;

		return { total, paid, overdue, count: filteredInvoices.length };
	}, [filteredInvoices]);

	if (loading) {
		return (
			<div className='p-6 bg-white min-h-screen text-gray-500 flex items-center justify-center'>
				<div className='animate-pulse'>Loading Invoices...</div>
			</div>
		);
	}

	return (
		<div className='p-6 bg-white min-h-screen text-gray-900 font-sans'>
			{/* HEADER */}
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight text-gray-900'>
						Sales Invoices
					</h1>
					<p className='text-gray-400 text-sm'>
						Track your revenue and manage customer billing
					</p>
				</div>
				<Link
					href='/sales/invoices/create'
					className='w-full md:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-500 transition-all shadow-lg text-center'>
					+ Create Invoice
				</Link>
			</div>

			{/* STATS CARDS */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
				<div className='bg-white border border-gray-200 p-5 rounded-xl shadow-sm'>
					<p className='text-gray-500 text-xs font-bold uppercase tracking-wider mb-1'>
						Total Sales
					</p>
					<h3 className='text-2xl font-black text-gray-900'>
						{formatCurrency(stats.total)}
					</h3>
					<p className='text-gray-500 text-xs mt-2'>
						{stats.count} Invoices generated
					</p>
				</div>
				<div className='bg-white border border-gray-200 p-5 rounded-xl shadow-sm'>
					<p className='text-gray-500 text-xs font-bold uppercase tracking-wider mb-1'>
						Total Collected
					</p>
					<h3 className='text-2xl font-black text-green-400'>
						{formatCurrency(stats.paid)}
					</h3>
					<p className='text-gray-500 text-xs mt-2'>Revenue in bank</p>
				</div>
				<div className='bg-white border border-gray-200 p-5 rounded-xl shadow-sm'>
					<p className='text-gray-500 text-xs font-bold uppercase tracking-wider mb-1'>
						Receivables
					</p>
					<h3 className='text-2xl font-black text-blue-400'>
						{formatCurrency(stats.total - stats.paid)}
					</h3>
					<p className='text-gray-500 text-xs mt-2'>Outstanding balance</p>
				</div>
				<div className='bg-white border border-gray-200 p-5 rounded-xl shadow-sm'>
					<p className='text-gray-500 text-xs font-bold uppercase tracking-wider mb-1'>
						Overdue
					</p>
					<h3 className='text-2xl font-black text-red-500'>{stats.overdue}</h3>
					<p className='text-gray-500 text-xs mt-2'>Requiring attention</p>
				</div>
			</div>

			{/* FILTERS */}
			<div className='bg-gray-50 border border-gray-200 p-4 rounded-xl mb-6 flex flex-col md:flex-row gap-4'>
				<div className='flex-1 relative'>
					<span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>
						🔍
					</span>
					<input
						type='text'
						placeholder='Search by invoice # or customer...'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className='w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900'
					/>
				</div>
				<div className='flex gap-2'>
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className='px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900'>
						<option value='all'>All Status</option>
						<option value='paid'>Paid</option>
						<option value='sent'>Sent</option>
						<option value='partial'>Partial</option>
						<option value='overdue'>Overdue</option>
						<option value='draft'>Draft</option>
					</select>
					<button
						onClick={() => {
							setSearch('');
							setStatusFilter('all');
						}}
						className='px-4 py-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium'>
						Reset
					</button>
				</div>
			</div>

			{/* TABLE */}
			<div className='bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm'>
				{error ?
					<div className='p-12 text-center text-red-400'>{error}</div>
				: filteredInvoices.length === 0 ?
					<div className='p-12 text-center text-gray-500'>
						<p className='text-lg'>No invoices found matching your criteria</p>
						<button
							onClick={() => setSearch('')}
							className='mt-2 text-blue-400 hover:underline'>
							Clear search
						</button>
					</div>
				:	<div className='overflow-x-auto'>
						<table className='w-full text-left border-collapse'>
							<thead>
								<tr className='bg-gray-50 border-b border-gray-200'>
									<th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest'>
										Invoice #
									</th>
									<th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest'>
										Customer
									</th>
									<th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest'>
										Date
									</th>
									<th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest'>
										Due Date
									</th>
									<th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right'>
										Amount
									</th>
									<th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center'>
										Status
									</th>
									<th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right'></th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-100'>
								{filteredInvoices.map((inv) => (
									<tr
										key={inv.id}
										className='hover:bg-gray-50 transition-colors group'>
										<td className='px-6 py-4'>
											<Link
												href={`/sales/invoices/${inv.id}`}
												className='text-blue-400 font-mono font-bold hover:text-blue-300'>
												{inv.invoiceNumber}
											</Link>
										</td>
										<td className='px-6 py-4'>
											<p className='font-semibold text-gray-900'>
												{inv.billToCompany}
											</p>
										</td>
										<td className='px-6 py-4 text-sm text-gray-500'>
											{formatDate(inv.invoiceDate)}
										</td>
										<td className='px-6 py-4 text-sm text-gray-500'>
											{formatDate(inv.dueDate)}
										</td>
										<td className='px-6 py-4 text-right font-mono font-bold text-gray-900'>
											{formatCurrency(inv.total)}
										</td>
										<td className='px-6 py-4 text-center'>
											{getStatusBadge(inv.status)}
										</td>
										<td className='px-6 py-4 text-right'>
											<div className='flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity'>
												<Link
													href={`/sales/invoices/${inv.id}/edit`}
													className='text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-tighter'>
													Edit
												</Link>
												<button
													className='text-xs font-bold text-gray-500 hover:text-red-400 uppercase tracking-tighter'
													onClick={() => {
														/* Implement Delete */
													}}>
													Delete
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				}
			</div>

			{/* FOOTER INFO */}
			<div className='mt-8 text-center text-gray-600 text-xs'>
				<p>Showing {filteredInvoices.length} invoices • Updated just now</p>
			</div>
		</div>
	);
}

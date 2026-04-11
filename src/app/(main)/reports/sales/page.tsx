/** @format */

// apps/web/src/app/(main)/sales/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/useOrderStore';

const formatCurrency = (amount: number, currency: string = 'USD') => {
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency,
		}).format(amount);
	} catch {
		return `${currency} ${amount.toFixed(2)}`;
	}
};

export default function SalesReportsPage() {
	const { user } = useAuthStore();
	const companyId = user?.companyId;
	const { orders, fetchOrders } = useOrderStore();
	const [dateRange, setDateRange] = useState<
		'week' | 'month' | 'quarter' | 'year'
	>('month');

	useEffect(() => {
		if (companyId) {
			fetchOrders(companyId);
		}
	}, [companyId, fetchOrders]);

	// Calculate report data based on date range
	const getDateRangeFilter = () => {
		const now = new Date();
		const start = new Date();

		switch (dateRange) {
			case 'week':
				start.setDate(now.getDate() - 7);
				break;
			case 'month':
				start.setMonth(now.getMonth() - 1);
				break;
			case 'quarter':
				start.setMonth(now.getMonth() - 3);
				break;
			case 'year':
				start.setFullYear(now.getFullYear() - 1);
				break;
		}

		return { start, end: now };
	};

	const filteredOrders = orders.filter((order) => {
		const { start, end } = getDateRangeFilter();
		const orderDate = new Date(order.orderDate);
		return orderDate >= start && orderDate <= end;
	});

	const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
	const totalOrders = filteredOrders.length;
	const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

	return (
		<div className='p-6 text-white bg-[#0C0C0E] min-h-screen'>
			<h1 className='text-2xl font-bold mb-6'>Sales Reports</h1>

			<div className='mb-6'>
				<select
					value={dateRange}
					onChange={(e) => setDateRange(e.target.value as any)}
					className='bg-gray-800 px-4 py-2 rounded'>
					<option value='week'>Last 7 Days</option>
					<option value='month'>Last 30 Days</option>
					<option value='quarter'>Last 90 Days</option>
					<option value='year'>Last Year</option>
				</select>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400'>Total Revenue</p>
					<p className='text-2xl font-bold'>{formatCurrency(totalRevenue)}</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400'>Total Orders</p>
					<p className='text-2xl font-bold'>{totalOrders}</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400'>Average Order Value</p>
					<p className='text-2xl font-bold'>{formatCurrency(avgOrderValue)}</p>
				</div>
			</div>

			<div className='bg-gray-800 rounded-lg overflow-hidden'>
				<table className='w-full'>
					<thead className='bg-gray-700'>
						<tr>
							<th className='px-4 py-2 text-left'>Order #</th>
							<th className='px-4 py-2 text-left'>Customer</th>
							<th className='px-4 py-2 text-left'>Date</th>
							<th className='px-4 py-2 text-right'>Amount</th>
							<th className='px-4 py-2 text-left'>Status</th>
						</tr>
					</thead>
					<tbody>
						{filteredOrders.map((order) => (
							<tr
								key={order.id}
								className='border-t border-gray-700'>
								<td className='px-4 py-2'>{order.orderNumber}</td>
								<td className='px-4 py-2'>{order.customerName}</td>
								<td className='px-4 py-2'>
									{new Date(order.orderDate).toLocaleDateString()}
								</td>
								<td className='px-4 py-2 text-right'>
									{formatCurrency(order.total)}
								</td>
								<td className='px-4 py-2 capitalize'>{order.status}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

/** @format */
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
	usePurchaseOrderStore,
	PurchaseOrder,
	PurchaseOrderStatus,
} from '@/store/usePurchaseOrderStore';
import { useBillStore, Bill, BillStatus, BillType } from '@/store/useBillStore';
import { formatCurrency, formatDate } from '../../purchases/orders/page';
import { getBillTypeLabel } from '../../purchases/bills/page';
import {
	Bar,
	BarChart,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

/* ─────────────────────────────────────────
   HELPERS & UTILITIES
───────────────────────────────────────── */

const formatNumber = (num: number) => {
	return new Intl.NumberFormat().format(num);
};

interface DateRange {
	start: Date;
	end: Date;
}

type ReportPeriod = 'week' | 'month' | 'quarter' | 'year' | 'custom';

/* ─────────────────────────────────────────
   CHART COMPONENTS
───────────────────────────────────────── */

function SpendingChart({
	data,
}: {
	data: { month: string; amount: number }[];
}) {
	const maxAmount = Math.max(...data.map((d) => d.amount), 1);

	return (
		<div className='bg-gray-800 rounded-lg p-4'>
			<h3 className='text-lg font-semibold mb-4'>Monthly Spending Trend</h3>
			<div className='flex items-end space-x-2 h-64 overflow-x-auto'>
				{data.map((item, idx) => (
					<div
						key={idx}
						className='flex-1 flex flex-col items-center min-w-[60px]'>
						<div
							className='w-full bg-blue-500 rounded-t transition-all hover:bg-blue-400'
							style={{ height: `${(item.amount / maxAmount) * 200}px` }}
						/>
						<span className='text-xs text-gray-400 mt-2'>{item.month}</span>
						<span className='text-xs font-semibold mt-1'>
							{formatCurrency(item.amount).slice(0, -3)}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

function CategoryDistribution({
	data,
}: {
	data: { category: string; amount: number }[];
}) {
	const total = data.reduce((sum, item) => sum + item.amount, 0);

	return (
		<div className='bg-gray-800 rounded-lg p-4'>
			<h3 className='text-lg font-semibold mb-4'>Spending by Category</h3>
			<div className='space-y-3'>
				{data.map((item, idx) => {
					const percentage = total > 0 ? (item.amount / total) * 100 : 0;
					return (
						<div key={idx}>
							<div className='flex justify-between text-sm mb-1'>
								<span className='capitalize'>
									{getBillTypeLabel(item.category as BillType)}
								</span>
								<span>
									{formatCurrency(item.amount)} ({percentage.toFixed(1)}%)
								</span>
							</div>
							<div className='w-full bg-gray-700 rounded-full h-2'>
								<div
									className='h-2 rounded-full bg-blue-500'
									style={{ width: `${percentage}%` }}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

interface VendorPerfData {
	id: string;
	name: string;
	orderCount: number;
	totalSpend: number;
	avgOrderValue: number;
	onTimeRate: number;
	status: string;
}

function VendorPerformanceTable({ data }: { data: VendorPerfData[] }) {
	return (
		<div className='bg-gray-800 rounded-lg overflow-hidden'>
			<h3 className='text-lg font-semibold p-4 border-b border-gray-700'>
				Top Vendors by Spend
			</h3>
			<div className='overflow-x-auto'>
				<table className='w-full'>
					<thead className='bg-gray-700'>
						<tr className='text-left text-sm'>
							<th className='px-4 py-2'>Vendor</th>
							<th className='px-4 py-2 text-right'>Total Orders</th>
							<th className='px-4 py-2 text-right'>Total Spend</th>
							<th className='px-4 py-2 text-right'>Avg. Order Value</th>
							<th className='px-4 py-2 text-center'>On-Time Rate</th>
							<th className='px-4 py-2 text-center'>Status</th>
						</tr>
					</thead>
					<tbody>
						{data.map((vendor) => (
							<tr
								key={vendor.id}
								className='border-t border-gray-700'>
								<td className='px-4 py-2 font-medium'>{vendor.name}</td>
								<td className='px-4 py-2 text-right'>
									{formatNumber(vendor.orderCount)}
								</td>
								<td className='px-4 py-2 text-right'>
									{formatCurrency(vendor.totalSpend)}
								</td>
								<td className='px-4 py-2 text-right'>
									{formatCurrency(vendor.avgOrderValue)}
								</td>
								<td className='px-4 py-2 text-center'>
									<span
										className={`px-2 py-1 rounded-full text-xs font-semibold ${
											vendor.onTimeRate >= 90 ? 'bg-green-500'
											: vendor.onTimeRate >= 70 ? 'bg-yellow-500'
											: 'bg-red-500'
										} text-white`}>
										{vendor.onTimeRate}%
									</span>
								</td>
								<td className='px-4 py-2 text-center'>
									<span
										className={`px-2 py-1 rounded-full text-xs font-semibold ${
											vendor.status === 'active' ?
												'bg-green-500'
											:	'bg-gray-500'
										} text-white`}>
										{vendor.status}
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function PurchaseOrderStatusChart({
	data,
}: {
	data: { status: string; count: number; value: number }[];
}) {
	return (
		<div className='bg-gray-800 rounded-lg p-4'>
			<h3 className='text-lg font-semibold mb-4'>Purchase Orders by Status</h3>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				<div className='h-64'>
					<p className='text-sm text-gray-400 mb-2 text-center'>Order Counts</p>
					<ResponsiveContainer
						width='100%'
						height='100%'>
						<BarChart
							data={data}
							layout='vertical'
							margin={{ left: 20 }}>
							<XAxis
								type='number'
								hide
							/>
							<YAxis
								dataKey='status'
								type='category'
								stroke='#9CA3AF'
								fontSize={12}
								width={80}
								tickFormatter={(s) => s.charAt(0).toUpperCase() + s.slice(1)}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: '#1F2937',
									border: 'none',
									borderRadius: '8px',
								}}
								formatter={(value: any) => [value, 'Orders']}
							/>
							<Bar
								dataKey='count'
								fill='#3B82F6'
								radius={[0, 4, 4, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
				<div className='h-64'>
					<p className='text-sm text-gray-400 mb-2 text-center'>Order Values</p>
					<ResponsiveContainer
						width='100%'
						height='100%'>
						<BarChart
							data={data}
							layout='vertical'
							margin={{ left: 20 }}>
							<XAxis
								type='number'
								hide
							/>
							<YAxis
								dataKey='status'
								type='category'
								stroke='#9CA3AF'
								fontSize={12}
								width={80}
								tickFormatter={(s) => s.charAt(0).toUpperCase() + s.slice(1)}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: '#1F2937',
									border: 'none',
									borderRadius: '8px',
								}}
								formatter={(value: any) => [
									formatCurrency(value),
									'Total Value',
								]}
							/>
							<Bar
								dataKey='value'
								fill='#10B981'
								radius={[0, 4, 4, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
}

function AccountsPayableAging({ data }: { data: any }) {
	const chartData = [
		{
			name: 'AP Aging',
			'0-30 Days': data.current.amount,
			'31-60 Days': data.thirtyToSixty.amount,
			'61-90 Days': data.sixtyToNinety.amount,
			'90+ Days': data.ninetyPlus.amount,
		},
	];

	return (
		<div className='bg-gray-800 rounded-lg p-4 h-[250px] flex flex-col'>
			<h3 className='text-lg font-semibold mb-4'>Accounts Payable Aging</h3>
			<div className='flex-1 w-full min-h-0'>
				<ResponsiveContainer
					width='100%'
					height='100%'>
					<BarChart
						data={chartData}
						layout='vertical'
						margin={{ left: -20, right: 10 }}>
						<XAxis
							type='number'
							hide
						/>
						<YAxis
							type='category'
							dataKey='name'
							hide
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: '#1F2937',
								border: 'none',
								borderRadius: '8px',
							}}
							formatter={(value: any) => [formatCurrency(value), '']}
						/>
						<Legend
							verticalAlign='top'
							align='right'
							iconType='circle'
						/>
						<Bar
							dataKey='0-30 Days'
							stackId='a'
							fill='#10B981'
						/>
						<Bar
							dataKey='31-60 Days'
							stackId='a'
							fill='#3B82F6'
						/>
						<Bar
							dataKey='61-90 Days'
							stackId='a'
							fill='#F59E0B'
						/>
						<Bar
							dataKey='90+ Days'
							stackId='a'
							fill='#EF4444'
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
			<div className='mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-4'>
				<div>
					<p className='text-xs text-gray-400'>Total Amount</p>
					<p className='text-lg font-bold'>
						{formatCurrency(data.total.amount)}
					</p>
				</div>
				<div>
					<p className='text-xs text-gray-400'>Total Bills</p>
					<p className='text-lg font-bold'>{data.total.count}</p>
				</div>
				<div>
					<p className='text-xs text-gray-400'>Current</p>
					<p className='text-lg font-bold text-green-400'>
						{data.current.percentage.toFixed(1)}%
					</p>
				</div>
				<div>
					<p className='text-xs text-gray-400'>Overdue (90+)</p>
					<p className='text-lg font-bold text-red-500'>
						{data.ninetyPlus.percentage.toFixed(1)}%
					</p>
				</div>
			</div>
		</div>
	);
}

function TopProductsTable({ data }: { data: any[] }) {
	return (
		<div className='bg-gray-800 rounded-lg overflow-hidden'>
			<h3 className='text-lg font-semibold p-4 border-b border-gray-700'>
				Top Purchased Products
			</h3>
			<div className='overflow-x-auto'>
				<table className='w-full'>
					<thead className='bg-gray-700'>
						<tr className='text-left text-sm'>
							<th className='px-4 py-2'>Product</th>
							<th className='px-4 py-2 text-right'>Quantity</th>
							<th className='px-4 py-2 text-right'>Total Spend</th>
							<th className='px-4 py-2 text-right'>Avg. Unit Price</th>
							<th className='px-4 py-2 text-center'>Orders</th>
						</tr>
					</thead>
					<tbody>
						{data.map((product, idx) => (
							<tr
								key={idx}
								className='border-t border-gray-700'>
								<td className='px-4 py-2 font-medium'>{product.name}</td>
								<td className='px-4 py-2 text-right'>
									{formatNumber(product.quantity)}
								</td>
								<td className='px-4 py-2 text-right'>
									{formatCurrency(product.totalSpend)}
								</td>
								<td className='px-4 py-2 text-right'>
									{formatCurrency(product.avgUnitPrice)}
								</td>
								<td className='px-4 py-2 text-center'>{product.orderCount}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

/* ─────────────────────────────────────────
   MAIN REPORTS PAGE
───────────────────────────────────────── */

export default function PurchasesReportsPage() {
	const { user, loading: authLoading } = useAuthStore();
	const companyId = user?.companyId;

	const {
		orders: purchaseOrders,
		loading: poLoading,
		fetchPurchaseOrders,
	} = usePurchaseOrderStore();

	const { bills, loading: billsLoading, fetchBills } = useBillStore();

	const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('month');
	const [customDateRange, setCustomDateRange] = useState<DateRange>({
		start: new Date(new Date().setDate(new Date().getDate() - 30)),
		end: new Date(),
	});
	const [selectedVendor, setSelectedVendor] = useState<string>('all');
	const [selectedCategory, setSelectedCategory] = useState<string>('all');
	const [loading, setLoading] = useState(true);

	/* ─────────────────────────────────────────
	   EFFECTS
	───────────────────────────────────────── */

	useEffect(() => {
		if (companyId) {
			Promise.all([
				fetchPurchaseOrders(companyId),
				fetchBills(companyId),
			]).finally(() => setLoading(false));
		}
	}, [companyId, fetchPurchaseOrders, fetchBills]);

	/* ─────────────────────────────────────────
	   DATE RANGE CALCULATION
	───────────────────────────────────────── */

	const getDateRange = (): DateRange => {
		const now = new Date();
		const start = new Date();

		switch (reportPeriod) {
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
			case 'custom':
				return customDateRange;
		}

		return { start, end: now };
	};

	const dateRange = getDateRange();

	/* ─────────────────────────────────────────
	   FILTERED DATA
	───────────────────────────────────────── */

	const filteredOrders = useMemo(() => {
		return purchaseOrders.filter((order) => {
			const orderDate = new Date(order.orderDate);
			const inDateRange =
				orderDate >= dateRange.start && orderDate <= dateRange.end;
			const matchesVendor =
				selectedVendor === 'all' || order.vendorId === selectedVendor;
			const matchesCategory =
				selectedCategory === 'all' || selectedCategory === 'purchase';
			return inDateRange && matchesVendor && matchesCategory;
		});
	}, [purchaseOrders, dateRange, selectedVendor, selectedCategory]);

	const filteredBills = useMemo(() => {
		return bills.filter((bill) => {
			const billDate = new Date(bill.billDate);
			const inDateRange =
				billDate >= dateRange.start && billDate <= dateRange.end;
			const matchesVendor =
				selectedVendor === 'all' || bill.vendorId === selectedVendor;
			const matchesCategory =
				selectedCategory === 'all' || bill.type === selectedCategory;
			return inDateRange && matchesVendor && matchesCategory;
		});
	}, [bills, dateRange, selectedVendor, selectedCategory]);

	/* ─────────────────────────────────────────
	   REPORT METRICS
	───────────────────────────────────────── */

	const metrics = useMemo(() => {
		const totalSpend = filteredOrders.reduce(
			(sum, order) => sum + order.totalAmount,
			0
		);
		const totalOrders = filteredOrders.length;
		const avgOrderValue = totalOrders > 0 ? totalSpend / totalOrders : 0;

		const completedOrders = filteredOrders.filter(
			(o) => o.status === 'completed'
		);
		const completedValue = completedOrders.reduce(
			(sum, o) => sum + o.totalAmount,
			0
		);

		const pendingOrders = filteredOrders.filter(
			(o) =>
				o.status === 'pending' ||
				o.status === 'approved' ||
				o.status === 'ordered'
		);
		const pendingValue = pendingOrders.reduce(
			(sum, o) => sum + o.totalAmount,
			0
		);

		const totalBills = filteredBills.length;
		const totalBillAmount = filteredBills.reduce(
			(sum, bill) => sum + bill.totalAmount,
			0
		);
		const totalPaid = filteredBills.reduce(
			(sum, bill) => sum + bill.paidAmount,
			0
		);
		const totalDue = totalBillAmount - totalPaid;

		return {
			totalSpend,
			totalOrders,
			avgOrderValue,
			completedOrders: completedOrders.length,
			completedValue,
			pendingOrders: pendingOrders.length,
			pendingValue,
			totalBills,
			totalBillAmount,
			totalPaid,
			totalDue,
		};
	}, [filteredOrders, filteredBills]);

	/* ─────────────────────────────────────────
	   MONTHLY TREND DATA
	───────────────────────────────────────── */

	const monthlyTrend = useMemo(() => {
		const monthlyMap = new Map<string, number>();

		filteredOrders.forEach((order) => {
			const date = new Date(order.orderDate);
			const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
			const monthName = date.toLocaleString('default', {
				month: 'short',
				year: 'numeric',
			});

			const current = monthlyMap.get(monthKey) || 0;
			monthlyMap.set(monthKey, current + order.totalAmount);
		});

		return Array.from(monthlyMap.entries())
			.map(([key, amount]) => ({
				month: key.split('-')[1] + '/' + key.split('-')[0].slice(-2),
				amount,
			}))
			.sort((a, b) => {
				const [aMonth, aYear] = a.month.split('/').map(Number);
				const [bMonth, bYear] = b.month.split('/').map(Number);
				return (
					new Date(2000 + aYear, aMonth - 1).getTime() -
					new Date(2000 + bYear, bMonth - 1).getTime()
				);
			});
	}, [filteredOrders]);

	/* ─────────────────────────────────────────
	   CATEGORY DISTRIBUTION
	───────────────────────────────────────── */

	const categoryDistribution = useMemo(() => {
		const categoryMap = new Map<string, number>();

		filteredOrders.forEach((order) => {
			// Assuming orders have a category field, otherwise use default
			const category = 'purchase';
			const current = categoryMap.get(category) || 0;
			categoryMap.set(category, current + order.totalAmount);
		});

		return Array.from(categoryMap.entries())
			.map(([category, amount]) => ({ category, amount }))
			.sort((a, b) => b.amount - a.amount);
	}, [filteredOrders]);

	/* ─────────────────────────────────────────
	   VENDOR PERFORMANCE
	───────────────────────────────────────── */

	const vendorPerformance = useMemo(() => {
		const vendorMap = new Map<string, any>();

		filteredOrders.forEach((order) => {
			if (!vendorMap.has(order.vendorId)) {
				vendorMap.set(order.vendorId, {
					id: order.vendorId,
					name: order.vendorName,
					orderCount: 0,
					totalSpend: 0,
					onTimeDeliveries: 0,
					totalDeliveries: 0,
				});
			}

			const vendor = vendorMap.get(order.vendorId);
			vendor.orderCount++;
			vendor.totalSpend += order.totalAmount;

			if (order.actualDeliveryDate && order.expectedDeliveryDate) {
				vendor.totalDeliveries++;
				if (
					new Date(order.actualDeliveryDate) <=
					new Date(order.expectedDeliveryDate)
				) {
					vendor.onTimeDeliveries++;
				}
			}
		});

		return Array.from(vendorMap.values())
			.map((vendor) => ({
				...vendor,
				avgOrderValue: vendor.totalSpend / vendor.orderCount,
				onTimeRate:
					vendor.totalDeliveries > 0 ?
						(vendor.onTimeDeliveries / vendor.totalDeliveries) * 100
					:	100,
				status: vendor.totalSpend > 10000 ? 'active' : 'inactive',
			}))
			.sort((a, b) => b.totalSpend - a.totalSpend);
	}, [filteredOrders]);

	/* ─────────────────────────────────────────
	   PO STATUS DISTRIBUTION
	───────────────────────────────────────── */

	const poStatusDistribution = useMemo(() => {
		const statusMap = new Map<string, { count: number; value: number }>();

		filteredOrders.forEach((order) => {
			const current = statusMap.get(order.status) || { count: 0, value: 0 };
			current.count++;
			current.value += order.totalAmount;
			statusMap.set(order.status, current);
		});

		return Array.from(statusMap.entries()).map(([status, data]) => ({
			status,
			count: data.count,
			value: data.value,
		}));
	}, [filteredOrders]);

	/* ─────────────────────────────────────────
	   ACCOUNTS PAYABLE AGING
	───────────────────────────────────────── */

	const accountsPayableAging = useMemo(() => {
		const now = new Date();

		const aging = {
			current: { count: 0, amount: 0 },
			thirtyToSixty: { count: 0, amount: 0 },
			sixtyToNinety: { count: 0, amount: 0 },
			ninetyPlus: { count: 0, amount: 0 },
			total: { count: 0, amount: 0 },
		};

		filteredBills.forEach((bill) => {
			if (bill.status === 'paid' || bill.status === 'cancelled') return;

			const dueDate = new Date(bill.dueDate);
			const daysOverdue = Math.floor(
				(now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
			);
			const dueAmount = bill.totalAmount - bill.paidAmount;

			if (daysOverdue <= 30) {
				aging.current.count++;
				aging.current.amount += dueAmount;
			} else if (daysOverdue <= 60) {
				aging.thirtyToSixty.count++;
				aging.thirtyToSixty.amount += dueAmount;
			} else if (daysOverdue <= 90) {
				aging.sixtyToNinety.count++;
				aging.sixtyToNinety.amount += dueAmount;
			} else {
				aging.ninetyPlus.count++;
				aging.ninetyPlus.amount += dueAmount;
			}

			aging.total.count++;
			aging.total.amount += dueAmount;
		});

		// Add percentages
		const result: any = {};
		Object.keys(aging).forEach((key) => {
			result[key] = {
				...aging[key as keyof typeof aging],
				percentage:
					aging.total.amount > 0 ?
						(aging[key as keyof typeof aging].amount / aging.total.amount) * 100
					:	0,
			};
		});

		return result;
	}, [filteredBills]);

	/* ─────────────────────────────────────────
	   TOP PRODUCTS
	───────────────────────────────────────── */

	const topProducts = useMemo(() => {
		const productMap = new Map<string, any>();

		filteredOrders.forEach((order) => {
			order.items.forEach((item) => {
				const productId = item.productId || item.description;
				if (!productMap.has(productId)) {
					productMap.set(productId, {
						id: productId,
						name: item.description,
						quantity: 0,
						totalSpend: 0,
						orderCount: 0,
					});
				}

				const product = productMap.get(productId);
				product.quantity += item.quantity;
				product.totalSpend += item.total;
				product.orderCount++;
			});
		});

		return Array.from(productMap.values())
			.map((product) => ({
				...product,
				avgUnitPrice: product.totalSpend / product.quantity,
			}))
			.sort((a, b) => b.totalSpend - a.totalSpend)
			.slice(0, 10);
	}, [filteredOrders]);

	/* ─────────────────────────────────────────
	   EXPORT FUNCTIONS
	───────────────────────────────────────── */

	const exportToCSV = (data: any[], filename: string) => {
		if (data.length === 0) return;

		const headers = Object.keys(data[0]);
		const csvRows = [
			headers.join(','),
			...data.map((row) =>
				headers
					.map((header) => `"${String(row[header] || '').replace(/"/g, '""')}"`)
					.join(',')
			),
		];

		const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${filename}_${formatDate(new Date().toISOString())}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const exportPurchaseOrders = () => {
		exportToCSV(
			filteredOrders.map((order) => ({
				'PO Number': order.poNumber,
				Vendor: order.vendorName,
				'Order Date': formatDate(order.orderDate),
				'Expected Date': formatDate(order.expectedDeliveryDate),
				Status: order.status,
				'Total Amount': order.totalAmount,
				Currency: order.currency,
			})),
			'purchase_orders'
		);
	};

	const exportVendorPerformance = () => {
		exportToCSV(vendorPerformance, 'vendor_performance');
	};

	/* ─────────────────────────────────────────
	   RENDER STATES
	───────────────────────────────────────── */

	if (authLoading || loading) {
		return (
			<div className='p-6 text-white bg-[#0C0C0E] min-h-screen'>
				<div className='flex justify-center items-center h-64'>
					<div className='text-center'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
						<p>Loading reports...</p>
					</div>
				</div>
			</div>
		);
	}

	/* ─────────────────────────────────────────
	   MAIN RENDER
	───────────────────────────────────────── */

	return (
		<div className='p-6 text-white bg-[#0C0C0E] min-h-screen'>
			{/* Header */}
			<div className='mb-8'>
				<h1 className='text-3xl font-bold'>Purchases Reports</h1>
				<p className='text-gray-400 mt-1'>
					Analyze procurement data, vendor performance, and spending trends
				</p>
			</div>

			{/* Controls */}
			<div className='bg-gray-800 rounded-lg p-4 mb-6'>
				<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
					<div>
						<label className='block text-sm text-gray-400 mb-1'>
							Report Period
						</label>
						<select
							value={reportPeriod}
							onChange={(e) => setReportPeriod(e.target.value as ReportPeriod)}
							className='w-full p-2 bg-gray-700 rounded text-white'>
							<option value='week'>Last 7 Days</option>
							<option value='month'>Last 30 Days</option>
							<option value='quarter'>Last 90 Days</option>
							<option value='year'>Last Year</option>
							<option value='custom'>Custom Range</option>
						</select>
					</div>

					{reportPeriod === 'custom' && (
						<>
							<div>
								<label className='block text-sm text-gray-400 mb-1'>
									Start Date
								</label>
								<input
									type='date'
									value={customDateRange.start.toISOString().split('T')[0]}
									onChange={(e) =>
										setCustomDateRange({
											...customDateRange,
											start: new Date(e.target.value),
										})
									}
									className='w-full p-2 bg-gray-700 rounded text-white'
								/>
							</div>
							<div>
								<label className='block text-sm text-gray-400 mb-1'>
									End Date
								</label>
								<input
									type='date'
									value={customDateRange.end.toISOString().split('T')[0]}
									onChange={(e) =>
										setCustomDateRange({
											...customDateRange,
											end: new Date(e.target.value),
										})
									}
									className='w-full p-2 bg-gray-700 rounded text-white'
								/>
							</div>
						</>
					)}

					<div>
						<label className='block text-sm text-gray-400 mb-1'>
							Vendor Filter
						</label>
						<select
							value={selectedVendor}
							onChange={(e) => setSelectedVendor(e.target.value)}
							className='w-full p-2 bg-gray-700 rounded text-white'>
							<option value='all'>All Vendors</option>
							{vendorPerformance.slice(0, 20).map((vendor) => (
								<option
									key={vendor.id}
									value={vendor.id}>
									{vendor.name}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className='block text-sm text-gray-400 mb-1'>
							Category Filter
						</label>
						<select
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}
							className='w-full p-2 bg-gray-700 rounded text-white'>
							<option value='all'>All Categories</option>
							<option value='purchase'>Purchase</option>
							<option value='expense'>Expense</option>
							<option value='subscription'>Subscription</option>
							<option value='utility'>Utility</option>
							<option value='rent'>Rent</option>
						</select>
					</div>
				</div>

				<div className='flex justify-end space-x-2 mt-4'>
					<button
						onClick={exportPurchaseOrders}
						className='px-3 py-1 bg-green-600 rounded text-sm hover:bg-green-700'>
						Export POs
					</button>
					<button
						onClick={exportVendorPerformance}
						className='px-3 py-1 bg-green-600 rounded text-sm hover:bg-green-700'>
						Export Vendors
					</button>
				</div>
			</div>

			{/* Key Metrics Cards */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Total Spend</p>
					<p className='text-2xl font-bold'>
						{formatCurrency(metrics.totalSpend)}
					</p>
					<p className='text-xs text-gray-500 mt-1'>
						{metrics.totalOrders} purchase orders
					</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Average Order Value</p>
					<p className='text-2xl font-bold'>
						{formatCurrency(metrics.avgOrderValue)}
					</p>
					<p className='text-xs text-gray-500 mt-1'>per purchase order</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Pending Orders</p>
					<p className='text-2xl font-bold text-yellow-500'>
						{metrics.pendingOrders}
					</p>
					<p className='text-xs text-gray-500 mt-1'>
						Value: {formatCurrency(metrics.pendingValue)}
					</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Accounts Payable</p>
					<p className='text-2xl font-bold text-red-500'>
						{formatCurrency(metrics.totalDue)}
					</p>
					<p className='text-xs text-gray-500 mt-1'>
						Due on {metrics.totalBills} bills
					</p>
				</div>
			</div>

			{/* Charts Row */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
				{monthlyTrend.length > 0 && <SpendingChart data={monthlyTrend} />}
				{categoryDistribution.length > 0 && (
					<CategoryDistribution data={categoryDistribution} />
				)}
			</div>

			{/* PO Status Distribution */}
			<div className='mb-6'>
				<PurchaseOrderStatusChart data={poStatusDistribution} />
			</div>

			{/* Accounts Payable Aging */}
			<div className='mb-6'>
				<AccountsPayableAging data={accountsPayableAging} />
			</div>

			{/* Vendor Performance */}
			<div className='mb-6'>
				<VendorPerformanceTable data={vendorPerformance} />
			</div>

			{/* Top Products */}
			<div className='mb-6'>
				<TopProductsTable data={topProducts} />
			</div>

			{/* Footer */}
			<div className='mt-6 pt-4 border-t border-gray-800 text-center text-gray-500 text-sm'>
				<p>Report generated on {new Date().toLocaleString()}</p>
				<p>
					Data based on {filteredOrders.length} purchase orders and{' '}
					{filteredBills.length} bills
				</p>
			</div>
		</div>
	);
}

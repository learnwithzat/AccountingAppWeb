/** @format */
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore, SalesOrder, OrderStatus } from '@/store/useOrderStore';

/* ─────────────────────────────────────────
   HELPERS & UTILITIES
───────────────────────────────────────── */

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

const formatDate = (dateString: string) => {
	if (!dateString) return 'N/A';
	return new Date(dateString).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
};

const getStatusColor = (status: OrderStatus): string => {
	const colors = {
		draft: 'bg-gray-600 text-white',
		pending: 'bg-yellow-500 text-black',
		confirmed: 'bg-blue-500 text-white',
		processing: 'bg-purple-500 text-white',
		shipped: 'bg-indigo-500 text-white',
		delivered: 'bg-green-500 text-white',
		cancelled: 'bg-red-500 text-white',
	};
	return colors[status] || colors.draft;
};

const getStatusBadge = (status: OrderStatus) => {
	const labels = {
		draft: 'Draft',
		pending: 'Pending',
		confirmed: 'Confirmed',
		processing: 'Processing',
		shipped: 'Shipped',
		delivered: 'Delivered',
		cancelled: 'Cancelled',
	};
	return (
		<span
			className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
				status
			)}`}>
			{labels[status]}
		</span>
	);
};

/* ─────────────────────────────────────────
   FILTERS COMPONENT
───────────────────────────────────────── */

interface OrderFilters {
	search: string;
	status: OrderStatus | 'all';
	dateFrom: string;
	dateTo: string;
	minAmount: string;
	maxAmount: string;
}

const initialFilters: OrderFilters = {
	search: '',
	status: 'all',
	dateFrom: '',
	dateTo: '',
	minAmount: '',
	maxAmount: '',
};

function OrderFiltersComponent({
	filters,
	onFilterChange,
	onReset,
}: {
	filters: OrderFilters;
	onFilterChange: (filters: OrderFilters) => void;
	onReset: () => void;
}) {
	const [isExpanded, setIsExpanded] = useState(false);

	const handleChange = (key: keyof OrderFilters, value: string) => {
		onFilterChange({ ...filters, [key]: value });
	};

	return (
		<div className='bg-gray-800 rounded-lg p-4 mb-6'>
			<div className='flex justify-between items-center mb-4'>
				<h3 className='text-lg font-semibold'>Filters</h3>
				<div className='space-x-2'>
					<button
						onClick={() => setIsExpanded(!isExpanded)}
						className='text-sm text-blue-400 hover:text-blue-300'>
						{isExpanded ? 'Show Less' : 'Show More'}
					</button>
					<button
						onClick={onReset}
						className='text-sm text-gray-400 hover:text-gray-300'>
						Reset
					</button>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
				<div>
					<label className='block text-sm text-gray-400 mb-1'>Search</label>
					<input
						type='text'
						placeholder='Order #, customer...'
						value={filters.search}
						onChange={(e) => handleChange('search', e.target.value)}
						className='w-full p-2 bg-gray-700 rounded text-white'
					/>
				</div>

				<div>
					<label className='block text-sm text-gray-400 mb-1'>Status</label>
					<select
						value={filters.status}
						onChange={(e) =>
							handleChange('status', e.target.value as OrderStatus | 'all')
						}
						className='w-full p-2 bg-gray-700 rounded text-white'>
						<option value='all'>All Status</option>
						<option value='draft'>Draft</option>
						<option value='pending'>Pending</option>
						<option value='confirmed'>Confirmed</option>
						<option value='processing'>Processing</option>
						<option value='shipped'>Shipped</option>
						<option value='delivered'>Delivered</option>
						<option value='cancelled'>Cancelled</option>
					</select>
				</div>

				{isExpanded && (
					<>
						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								From Date
							</label>
							<input
								type='date'
								value={filters.dateFrom}
								onChange={(e) => handleChange('dateFrom', e.target.value)}
								className='w-full p-2 bg-gray-700 rounded text-white'
							/>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								To Date
							</label>
							<input
								type='date'
								value={filters.dateTo}
								onChange={(e) => handleChange('dateTo', e.target.value)}
								className='w-full p-2 bg-gray-700 rounded text-white'
							/>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								Min Amount
							</label>
							<input
								type='number'
								placeholder='0.00'
								value={filters.minAmount}
								onChange={(e) => handleChange('minAmount', e.target.value)}
								className='w-full p-2 bg-gray-700 rounded text-white'
							/>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								Max Amount
							</label>
							<input
								type='number'
								placeholder='99999.99'
								value={filters.maxAmount}
								onChange={(e) => handleChange('maxAmount', e.target.value)}
								className='w-full p-2 bg-gray-700 rounded text-white'
							/>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

/* ─────────────────────────────────────────
   ORDER CARD COMPONENT (Mobile View)
───────────────────────────────────────── */

function OrderCard({
	order,
	onStatusChange,
}: {
	order: SalesOrder;
	onStatusChange: (id: string, status: OrderStatus) => void;
}) {
	const [showStatusMenu, setShowStatusMenu] = useState(false);
	const router = useRouter();

	const statusOptions: OrderStatus[] = [
		'draft',
		'pending',
		'confirmed',
		'processing',
		'shipped',
		'delivered',
		'cancelled',
	];

	return (
		<div className='bg-gray-800 rounded-lg p-4 mb-3'>
			<div className='flex justify-between items-start mb-2'>
				<div>
					<Link
						href={`/sales/orders/${order.id}`}
						className='text-lg font-semibold text-blue-400 hover:text-blue-300'>
						{order.orderNumber || `ORD-${order.id.slice(0, 8)}`}
					</Link>
					<p className='text-sm text-gray-400'>{order.customerName}</p>
				</div>
				{getStatusBadge(order.status)}
			</div>

			<div className='grid grid-cols-2 gap-2 mb-3 text-sm'>
				<div>
					<span className='text-gray-400'>Date:</span>
					<span className='ml-2'>{formatDate(order.orderDate)}</span>
				</div>
				<div>
					<span className='text-gray-400'>Total:</span>
					<span className='ml-2 font-semibold'>
						{formatCurrency(order.total, order.currency)}
					</span>
				</div>
				{order.poNumber && (
					<div className='col-span-2'>
						<span className='text-gray-400'>PO #:</span>
						<span className='ml-2'>{order.poNumber}</span>
					</div>
				)}
			</div>

			<div className='flex justify-between items-center pt-2 border-t border-gray-700'>
				<div className='relative'>
					<button
						onClick={() => setShowStatusMenu(!showStatusMenu)}
						className='text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600'>
						Change Status
					</button>
					{showStatusMenu && (
						<div className='absolute bottom-full mb-2 left-0 bg-gray-700 rounded shadow-lg z-10 min-w-[120px]'>
							{statusOptions.map((status) => (
								<button
									key={status}
									onClick={() => {
										onStatusChange(order.id, status);
										setShowStatusMenu(false);
									}}
									className='block w-full text-left px-3 py-2 text-sm hover:bg-gray-600 rounded'>
									{status.charAt(0).toUpperCase() + status.slice(1)}
								</button>
							))}
						</div>
					)}
				</div>

				<Link
					href={`/sales/orders/${order.id}/edit`}
					className='text-sm text-blue-400 hover:text-blue-300'>
					Edit
				</Link>
			</div>
		</div>
	);
}

/* ─────────────────────────────────────────
   MAIN ORDERS PAGE
───────────────────────────────────────── */

export default function SalesOrdersPage() {
	const { user, loading: authLoading } = useAuthStore();
	const companyId = user?.companyId;
	const router = useRouter();

	const {
		orders,
		loading,
		error,
		fetchOrders,
		updateOrderStatus,
		deleteOrder,
	} = useOrderStore();

	const [filters, setFilters] = useState<OrderFilters>(initialFilters);
	const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
	const [showBulkActions, setShowBulkActions] = useState(false);
	const [toast, setToast] = useState({
		show: false,
		message: '',
		type: 'success',
	});

	/* ─────────────────────────────────────────
	   EFFECTS
	───────────────────────────────────────── */

	useEffect(() => {
		if (companyId) {
			fetchOrders(companyId);
		}
	}, [companyId, fetchOrders]);

	/* ─────────────────────────────────────────
	   FILTERING LOGIC
	───────────────────────────────────────── */

	const filteredOrders = useMemo(() => {
		let result = [...orders];

		// Search filter
		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			result = result.filter(
				(order) =>
					order.orderNumber?.toLowerCase().includes(searchLower) ||
					order.customerName.toLowerCase().includes(searchLower) ||
					order.customerEmail?.toLowerCase().includes(searchLower) ||
					order.poNumber?.toLowerCase().includes(searchLower)
			);
		}

		// Status filter
		if (filters.status !== 'all') {
			result = result.filter((order) => order.status === filters.status);
		}

		// Date range filter
		if (filters.dateFrom) {
			const fromDate = new Date(filters.dateFrom);
			result = result.filter((order) => new Date(order.orderDate) >= fromDate);
		}
		if (filters.dateTo) {
			const toDate = new Date(filters.dateTo);
			toDate.setHours(23, 59, 59);
			result = result.filter((order) => new Date(order.orderDate) <= toDate);
		}

		// Amount range filter
		if (filters.minAmount) {
			const min = parseFloat(filters.minAmount);
			result = result.filter((order) => order.total >= min);
		}
		if (filters.maxAmount) {
			const max = parseFloat(filters.maxAmount);
			result = result.filter((order) => order.total <= max);
		}

		// Sort by date (newest first)
		result.sort(
			(a, b) =>
				new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
		);

		return result;
	}, [orders, filters]);

	/* ─────────────────────────────────────────
	   STATISTICS
	───────────────────────────────────────── */

	const stats = useMemo(() => {
		const totalOrders = filteredOrders.length;
		const totalValue = filteredOrders.reduce(
			(sum, order) => sum + order.total,
			0
		);
		const statusCounts = filteredOrders.reduce(
			(acc, order) => {
				acc[order.status] = (acc[order.status] || 0) + 1;
				return acc;
			},
			{} as Record<OrderStatus, number>
		);

		return { totalOrders, totalValue, statusCounts };
	}, [filteredOrders]);

	/* ─────────────────────────────────────────
	   HANDLERS
	───────────────────────────────────────── */

	const handleFilterChange = (newFilters: OrderFilters) => {
		setFilters(newFilters);
	};

	const resetFilters = () => {
		setFilters(initialFilters);
	};

	const handleStatusChange = async (
		orderId: string,
		newStatus: OrderStatus
	) => {
		if (!companyId) return;
		try {
			await updateOrderStatus(companyId, orderId, newStatus);
			showToast(`Order status updated to ${newStatus}`, 'success');
		} catch (err) {
			showToast('Failed to update order status', 'error');
		}
	};

	const handleBulkStatusChange = async (newStatus: OrderStatus) => {
		if (!companyId) return;
		const promises = Array.from(selectedOrders).map((orderId) =>
			updateOrderStatus(companyId, orderId, newStatus)
		);
		try {
			await Promise.all(promises);
			showToast(
				`Updated ${selectedOrders.size} orders to ${newStatus}`,
				'success'
			);
			setSelectedOrders(new Set());
			setShowBulkActions(false);
		} catch (err) {
			showToast('Failed to update some orders', 'error');
		}
	};

	const handleDeleteOrder = async (orderId: string) => {
		if (
			!confirm(
				'Are you sure you want to delete this order? This action cannot be undone.'
			)
		) {
			return;
		}
		if (!companyId) return;
		try {
			await deleteOrder(companyId, orderId);
			showToast('Order deleted successfully', 'success');
		} catch (err) {
			showToast('Failed to delete order', 'error');
		}
	};

	const handleBulkDelete = async () => {
		if (
			!confirm(
				`Delete ${selectedOrders.size} orders? This action cannot be undone.`
			)
		) {
			return;
		}
		if (!companyId) return;
		const promises = Array.from(selectedOrders).map((orderId) =>
			deleteOrder(companyId, orderId)
		);
		try {
			await Promise.all(promises);
			showToast(`Deleted ${selectedOrders.size} orders`, 'success');
			setSelectedOrders(new Set());
			setShowBulkActions(false);
		} catch (err) {
			showToast('Failed to delete some orders', 'error');
		}
	};

	const toggleSelectOrder = (orderId: string) => {
		const newSelected = new Set(selectedOrders);
		if (newSelected.has(orderId)) {
			newSelected.delete(orderId);
		} else {
			newSelected.add(orderId);
		}
		setSelectedOrders(newSelected);
		setShowBulkActions(newSelected.size > 0);
	};

	const toggleSelectAll = () => {
		if (selectedOrders.size === filteredOrders.length) {
			setSelectedOrders(new Set());
			setShowBulkActions(false);
		} else {
			setSelectedOrders(new Set(filteredOrders.map((o) => o.id)));
			setShowBulkActions(true);
		}
	};

	const showToast = (message: string, type: 'success' | 'error') => {
		setToast({ show: true, message, type });
		setTimeout(
			() => setToast({ show: false, message: '', type: 'success' }),
			3000
		);
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
						<p>Loading orders...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='p-6 text-white bg-[#0C0C0E] min-h-screen'>
				<div className='bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500'>
					<p>Error: {error}</p>
					<button
						onClick={() => companyId && fetchOrders(companyId)}
						className='mt-2 px-4 py-2 bg-red-500 rounded hover:bg-red-600'>
						Retry
					</button>
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
			<div className='flex justify-between items-center mb-6'>
				<div>
					<h1 className='text-2xl font-bold'>Sales Orders</h1>
					<p className='text-gray-400 text-sm mt-1'>
						Manage and track all customer orders
					</p>
				</div>
				<Link
					href='/sales/orders/new'
					className='bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold transition-colors'>
					+ New Order
				</Link>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Total Orders</p>
					<p className='text-2xl font-bold'>{stats.totalOrders}</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Total Value</p>
					<p className='text-2xl font-bold'>
						{formatCurrency(stats.totalValue)}
					</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Pending</p>
					<p className='text-2xl font-bold text-yellow-500'>
						{stats.statusCounts.pending || 0}
					</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Delivered</p>
					<p className='text-2xl font-bold text-green-500'>
						{stats.statusCounts.delivered || 0}
					</p>
				</div>
			</div>

			{/* Filters */}
			<OrderFiltersComponent
				filters={filters}
				onFilterChange={handleFilterChange}
				onReset={resetFilters}
			/>

			{/* Bulk Actions Bar */}
			{showBulkActions && (
				<div className='bg-blue-500/20 border border-blue-500 rounded-lg p-3 mb-4 flex justify-between items-center'>
					<span>{selectedOrders.size} orders selected</span>
					<div className='space-x-2'>
						<select
							onChange={(e) =>
								handleBulkStatusChange(e.target.value as OrderStatus)
							}
							className='bg-gray-700 px-3 py-1 rounded text-sm'>
							<option value=''>Change Status</option>
							<option value='pending'>Pending</option>
							<option value='confirmed'>Confirmed</option>
							<option value='processing'>Processing</option>
							<option value='shipped'>Shipped</option>
							<option value='delivered'>Delivered</option>
							<option value='cancelled'>Cancelled</option>
						</select>
						<button
							onClick={handleBulkDelete}
							className='bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm'>
							Delete
						</button>
						<button
							onClick={() => {
								setSelectedOrders(new Set());
								setShowBulkActions(false);
							}}
							className='bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm'>
							Cancel
						</button>
					</div>
				</div>
			)}

			{/* Orders Table (Desktop) */}
			<div className='hidden lg:block bg-gray-800 rounded-lg overflow-hidden'>
				<table className='w-full'>
					<thead className='bg-gray-700'>
						<tr>
							<th className='px-4 py-3 text-left'>
								<input
									type='checkbox'
									checked={
										selectedOrders.size === filteredOrders.length &&
										filteredOrders.length > 0
									}
									onChange={toggleSelectAll}
									className='w-4 h-4'
								/>
							</th>
							<th className='px-4 py-3 text-left'>Order #</th>
							<th className='px-4 py-3 text-left'>Customer</th>
							<th className='px-4 py-3 text-left'>Date</th>
							<th className='px-4 py-3 text-left'>PO Number</th>
							<th className='px-4 py-3 text-right'>Total</th>
							<th className='px-4 py-3 text-left'>Status</th>
							<th className='px-4 py-3 text-center'>Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredOrders.length === 0 ?
							<tr>
								<td
									colSpan={8}
									className='px-4 py-8 text-center text-gray-400'>
									No orders found. Create your first order to get started.
								</td>
							</tr>
						:	filteredOrders.map((order) => (
								<tr
									key={order.id}
									className='border-t border-gray-700 hover:bg-gray-700/50'>
									<td className='px-4 py-3'>
										<input
											type='checkbox'
											checked={selectedOrders.has(order.id)}
											onChange={() => toggleSelectOrder(order.id)}
											className='w-4 h-4'
										/>
									</td>
									<td className='px-4 py-3'>
										<Link
											href={`/sales/orders/${order.id}`}
											className='text-blue-400 hover:text-blue-300'>
											{order.orderNumber || `ORD-${order.id.slice(0, 8)}`}
										</Link>
									</td>
									<td className='px-4 py-3'>
										<div>
											<p className='font-medium'>{order.customerName}</p>
											<p className='text-sm text-gray-400'>
												{order.customerEmail}
											</p>
										</div>
									</td>
									<td className='px-4 py-3'>{formatDate(order.orderDate)}</td>
									<td className='px-4 py-3'>{order.poNumber || '-'}</td>
									<td className='px-4 py-3 text-right font-semibold'>
										{formatCurrency(order.total, order.currency)}
									</td>
									<td className='px-4 py-3'>{getStatusBadge(order.status)}</td>
									<td className='px-4 py-3 text-center'>
										<div className='flex justify-center space-x-2'>
											<Link
												href={`/sales/orders/${order.id}/edit`}
												className='text-blue-400 hover:text-blue-300 text-sm'>
												Edit
											</Link>
											<button
												onClick={() => handleDeleteOrder(order.id)}
												className='text-red-400 hover:text-red-300 text-sm'>
												Delete
											</button>
										</div>
									</td>
								</tr>
							))
						}
					</tbody>
				</table>
			</div>

			{/* Orders Cards (Mobile/Tablet) */}
			<div className='lg:hidden'>
				{filteredOrders.length === 0 ?
					<div className='bg-gray-800 rounded-lg p-8 text-center text-gray-400'>
						No orders found. Create your first order to get started.
					</div>
				:	filteredOrders.map((order) => (
						<div
							key={order.id}
							className='mb-3'>
							<div className='bg-gray-800 rounded-lg p-4'>
								<div className='flex items-start justify-between mb-3'>
									<div className='flex items-center space-x-3'>
										<input
											type='checkbox'
											checked={selectedOrders.has(order.id)}
											onChange={() => toggleSelectOrder(order.id)}
											className='w-4 h-4'
										/>
										<div>
											<Link
												href={`/sales/orders/${order.id}`}
												className='text-lg font-semibold text-blue-400 hover:text-blue-300'>
												{order.orderNumber || `ORD-${order.id.slice(0, 8)}`}
											</Link>
											<p className='text-sm text-gray-400'>
												{order.customerName}
											</p>
										</div>
									</div>
									{getStatusBadge(order.status)}
								</div>
								<div className='grid grid-cols-2 gap-2 text-sm mb-3'>
									<div>
										<span className='text-gray-400'>Date:</span>
										<span className='ml-2'>{formatDate(order.orderDate)}</span>
									</div>
									<div>
										<span className='text-gray-400'>Total:</span>
										<span className='ml-2 font-semibold'>
											{formatCurrency(order.total, order.currency)}
										</span>
									</div>
									{order.poNumber && (
										<div className='col-span-2'>
											<span className='text-gray-400'>PO #:</span>
											<span className='ml-2'>{order.poNumber}</span>
										</div>
									)}
								</div>
								<div className='flex justify-end space-x-3 pt-2 border-t border-gray-700'>
									<Link
										href={`/sales/orders/${order.id}/edit`}
										className='text-blue-400 hover:text-blue-300 text-sm'>
										Edit
									</Link>
									<button
										onClick={() => handleDeleteOrder(order.id)}
										className='text-red-400 hover:text-red-300 text-sm'>
										Delete
									</button>
								</div>
							</div>
						</div>
					))
				}
			</div>

			{/* Toast Notification */}
			{toast.show && (
				<div
					className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
						toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
					} text-white animate-in slide-in-from-bottom-2`}>
					{toast.message}
				</div>
			)}
		</div>
	);
}

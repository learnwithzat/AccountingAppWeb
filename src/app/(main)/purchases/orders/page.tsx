/** @format */
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
	usePurchaseOrderStore,
	PurchaseOrder,
	PurchaseOrderStatus,
} from '@/store/usePurchaseOrderStore';
import PurchaseOrderCard from './PurchaseOrderCard';

/* ─────────────────────────────────────────
   HELPERS & UTILITIES
───────────────────────────────────────── */

export const formatCurrency = (amount: number, currency: string = 'USD') => {
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency,
		}).format(amount);
	} catch {
		return `${currency} ${amount.toFixed(2)}`;
	}
};

export const formatDate = (dateString: string) => {
	if (!dateString) return 'N/A';
	return new Date(dateString).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
};

const getStatusColor = (status: PurchaseOrderStatus): string => {
	const colors = {
		draft: 'bg-gray-600 text-white',
		pending: 'bg-yellow-500 text-black',
		approved: 'bg-blue-500 text-white',
		ordered: 'bg-purple-500 text-white',
		received: 'bg-indigo-500 text-white',
		partial: 'bg-orange-500 text-black',
		completed: 'bg-green-500 text-white',
		cancelled: 'bg-red-500 text-white',
	};
	return colors[status] || colors.draft;
};

export const getStatusBadge = (status: PurchaseOrderStatus) => {
	const labels = {
		draft: 'Draft',
		pending: 'Pending Approval',
		approved: 'Approved',
		ordered: 'Ordered',
		received: 'Partially Received',
		partial: 'Partial',
		completed: 'Completed',
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

/**
 * Calculates derived order data used in stats and row rendering
 */
export const getOrderMetadata = (order: PurchaseOrder) => {
	const isOverdue =
		new Date(order.expectedDeliveryDate) < new Date() &&
		order.status !== 'completed' &&
		order.status !== 'cancelled';
	const isOpen = ['approved', 'ordered', 'received'].includes(order.status);
	return { isOverdue, isOpen };
};

/* ─────────────────────────────────────────
   FILTERS COMPONENT
───────────────────────────────────────── */

interface PurchaseOrderFilters {
	search: string;
	status: PurchaseOrderStatus | 'all';
	dateFrom: string;
	dateTo: string;
	minAmount: string;
	maxAmount: string;
	vendorId: string;
}

const initialFilters: PurchaseOrderFilters = {
	search: '',
	status: 'all',
	dateFrom: '',
	dateTo: '',
	minAmount: '',
	maxAmount: '',
	vendorId: '',
};

function PurchaseOrderFiltersComponent({
	filters,
	onFilterChange,
	onReset,
	vendors,
}: {
	filters: PurchaseOrderFilters;
	onFilterChange: (filters: PurchaseOrderFilters) => void;
	onReset: () => void;
	vendors: { id: string; name: string }[];
}) {
	const [isExpanded, setIsExpanded] = useState(false);

	const handleChange = (key: keyof PurchaseOrderFilters, value: string) => {
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
						placeholder='PO #, vendor...'
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
							handleChange(
								'status',
								e.target.value as PurchaseOrderStatus | 'all'
							)
						}
						className='w-full p-2 bg-gray-700 rounded text-white'>
						<option value='all'>All Status</option>
						<option value='draft'>Draft</option>
						<option value='pending'>Pending Approval</option>
						<option value='approved'>Approved</option>
						<option value='ordered'>Ordered</option>
						<option value='received'>Partially Received</option>
						<option value='partial'>Partial</option>
						<option value='completed'>Completed</option>
						<option value='cancelled'>Cancelled</option>
					</select>
				</div>

				{isExpanded && (
					<>
						<div>
							<label className='block text-sm text-gray-400 mb-1'>Vendor</label>
							<select
								value={filters.vendorId}
								onChange={(e) => handleChange('vendorId', e.target.value)}
								className='w-full p-2 bg-gray-700 rounded text-white'>
								<option value=''>All Vendors</option>
								{vendors.map((vendor) => (
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
   MAIN PURCHASE ORDERS PAGE
───────────────────────────────────────── */

export default function PurchaseOrdersPage() {
	const { user, loading: authLoading } = useAuthStore();
	const companyId = user?.companyId;
	const router = useRouter();

	const {
		orders,
		loading,
		error,
		fetchPurchaseOrders,
		updateOrderStatus,
		deletePurchaseOrder,
		receiveOrder,
	} = usePurchaseOrderStore();

	const [filters, setFilters] = useState<PurchaseOrderFilters>(initialFilters);
	const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
	const [showBulkActions, setShowBulkActions] = useState(false);
	const [toast, setToast] = useState({
		show: false,
		message: '',
		type: 'success',
	});
	const [showReceiveModal, setShowReceiveModal] = useState(false);
	const [selectedOrderForReceive, setSelectedOrderForReceive] =
		useState<PurchaseOrder | null>(null);
	const [receiveItems, setReceiveItems] = useState<{ [key: string]: number }>(
		{}
	);

	// Mock vendors - in real app, fetch from vendor store
	const vendors = [
		{ id: '1', name: 'ABC Supplies' },
		{ id: '2', name: 'XYZ Logistics' },
		{ id: '3', name: 'Tech Distributors' },
		{ id: '4', name: 'Office Depot' },
		{ id: '5', name: 'Raw Materials Inc.' },
	];

	/* ─────────────────────────────────────────
	   EFFECTS
	───────────────────────────────────────── */

	useEffect(() => {
		if (companyId) {
			fetchPurchaseOrders(companyId);
		}
	}, [companyId, fetchPurchaseOrders]);

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
					order.poNumber?.toLowerCase().includes(searchLower) ||
					order.vendorName.toLowerCase().includes(searchLower) ||
					order.referenceNumber?.toLowerCase().includes(searchLower)
			);
		}

		// Status filter
		if (filters.status !== 'all') {
			result = result.filter((order) => order.status === filters.status);
		}

		// Vendor filter
		if (filters.vendorId) {
			result = result.filter((order) => order.vendorId === filters.vendorId);
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
			result = result.filter((order) => order.totalAmount >= min);
		}
		if (filters.maxAmount) {
			const max = parseFloat(filters.maxAmount);
			result = result.filter((order) => order.totalAmount <= max);
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
			(sum, order) => sum + order.totalAmount,
			0
		);
		const openOrders = filteredOrders.filter((o) => getOrderMetadata(o).isOpen);
		const openValue = openOrders.reduce((sum, o) => sum + o.totalAmount, 0);
		const completedOrders = filteredOrders.filter(
			(o) => o.status === 'completed'
		);
		const completedValue = completedOrders.reduce(
			(sum, o) => sum + o.totalAmount,
			0
		);

		const statusCounts = filteredOrders.reduce(
			(acc, order) => {
				acc[order.status] = (acc[order.status] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);

		return {
			totalOrders,
			totalValue,
			openCount: openOrders.length,
			openValue,
			completedCount: completedOrders.length,
			completedValue,
			statusCounts,
		};
	}, [filteredOrders]);

	/* ─────────────────────────────────────────
	   HANDLERS
	───────────────────────────────────────── */

	const handleFilterChange = (newFilters: PurchaseOrderFilters) => {
		setFilters(newFilters);
	};

	const resetFilters = () => {
		setFilters(initialFilters);
	};

	const handleStatusChange = async (
		orderId: string,
		newStatus: PurchaseOrderStatus
	) => {
		if (!companyId) return;
		try {
			await updateOrderStatus(companyId, orderId, newStatus);
			showToast(`Purchase order status updated to ${newStatus}`, 'success');
		} catch (err) {
			showToast('Failed to update order status', 'error');
		}
	};

	const handleBulkStatusChange = async (newStatus: PurchaseOrderStatus) => {
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
				'Are you sure you want to delete this purchase order? This action cannot be undone.'
			)
		) {
			return;
		}
		if (!companyId) return;
		try {
			await deletePurchaseOrder(companyId, orderId);
			showToast('Purchase order deleted successfully', 'success');
		} catch (err) {
			showToast('Failed to delete purchase order', 'error');
		}
	};

	const handleBulkDelete = async () => {
		if (
			!confirm(
				`Delete ${selectedOrders.size} purchase orders? This action cannot be undone.`
			)
		) {
			return;
		}
		if (!companyId) return;
		const promises = Array.from(selectedOrders).map((orderId) =>
			deletePurchaseOrder(companyId, orderId)
		);
		try {
			await Promise.all(promises);
			showToast(`Deleted ${selectedOrders.size} purchase orders`, 'success');
			setSelectedOrders(new Set());
			setShowBulkActions(false);
		} catch (err) {
			showToast('Failed to delete some orders', 'error');
		}
	};

	const handleReceiveOrder = (order: PurchaseOrder) => {
		setSelectedOrderForReceive(order);
		// Initialize receive quantities
		const initialReceive: { [key: string]: number } = {};
		order.items.forEach((item) => {
			initialReceive[item.id] = item.quantity;
		});
		setReceiveItems(initialReceive);
		setShowReceiveModal(true);
	};

	const handleSubmitReceive = async () => {
		if (!companyId || !selectedOrderForReceive) return;

		// Calculate received items
		const received = Object.entries(receiveItems).map(([itemId, quantity]) => ({
			itemId,
			quantity,
		}));

		try {
			await receiveOrder(companyId, selectedOrderForReceive.id, received);
			showToast('Order received successfully', 'success');
			setShowReceiveModal(false);
			setSelectedOrderForReceive(null);
			setReceiveItems({});
		} catch (err) {
			showToast('Failed to receive order', 'error');
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
						<p>Loading purchase orders...</p>
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
						onClick={() => companyId && fetchPurchaseOrders(companyId)}
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
					<h1 className='text-2xl font-bold'>Purchase Orders</h1>
					<p className='text-gray-400 text-sm mt-1'>
						Manage purchase orders, track deliveries, and monitor vendor orders
					</p>
				</div>
				<Link
					href='/purchases/orders/new'
					className='bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold transition-colors'>
					+ New Purchase Order
				</Link>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Total Orders</p>
					<p className='text-2xl font-bold'>{stats.totalOrders}</p>
					<p className='text-xs text-gray-500 mt-1'>
						Value: {formatCurrency(stats.totalValue)}
					</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Open Orders</p>
					<p className='text-2xl font-bold text-yellow-500'>
						{stats.openCount}
					</p>
					<p className='text-xs text-gray-500 mt-1'>
						Value: {formatCurrency(stats.openValue)}
					</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Completed Orders</p>
					<p className='text-2xl font-bold text-green-500'>
						{stats.completedCount}
					</p>
					<p className='text-xs text-gray-500 mt-1'>
						Value: {formatCurrency(stats.completedValue)}
					</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Completion Rate</p>
					<p className='text-2xl font-bold'>
						{stats.totalOrders > 0 ?
							((stats.completedCount / stats.totalOrders) * 100).toFixed(1)
						:	0}
						%
					</p>
					<p className='text-xs text-gray-500 mt-1'>of total orders</p>
				</div>
			</div>

			{/* Filters */}
			<PurchaseOrderFiltersComponent
				filters={filters}
				onFilterChange={handleFilterChange}
				onReset={resetFilters}
				vendors={vendors}
			/>

			{/* Bulk Actions Bar */}
			{showBulkActions && (
				<div className='bg-blue-500/20 border border-blue-500 rounded-lg p-3 mb-4 flex justify-between items-center'>
					<span>{selectedOrders.size} orders selected</span>
					<div className='space-x-2'>
						<select
							onChange={(e) =>
								handleBulkStatusChange(e.target.value as PurchaseOrderStatus)
							}
							className='bg-gray-700 px-3 py-1 rounded text-sm'>
							<option value=''>Change Status</option>
							<option value='draft'>Draft</option>
							<option value='pending'>Pending</option>
							<option value='approved'>Approved</option>
							<option value='ordered'>Ordered</option>
							<option value='received'>Partially Received</option>
							<option value='completed'>Completed</option>
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

			{/* Purchase Orders Table (Desktop) */}
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
							<th className='px-4 py-3 text-left'>PO #</th>
							<th className='px-4 py-3 text-left'>Vendor</th>
							<th className='px-4 py-3 text-left'>Order Date</th>
							<th className='px-4 py-3 text-left'>Expected Date</th>
							<th className='px-4 py-3 text-right'>Amount</th>
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
									No purchase orders found. Create a new purchase order to get
									started.
								</td>
							</tr>
						:	filteredOrders.map((order) => {
								const { isOverdue, isOpen } = getOrderMetadata(order);
								return (
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
												href={`/purchases/orders/${order.id}`}
												className='text-blue-400 hover:text-blue-300 font-mono text-sm'>
												{order.poNumber || `PO-${order.id.slice(0, 8)}`}
											</Link>
										</td>
										<td className='px-4 py-3'>
											<div>
												<p className='font-medium'>{order.vendorName}</p>
												<p className='text-xs text-gray-400'>
													{order.vendorEmail}
												</p>
											</div>
										</td>
										<td className='px-4 py-3 text-sm'>
											{formatDate(order.orderDate)}
										</td>
										<td
											className={`px-4 py-3 text-sm ${isOverdue ? 'text-red-400 font-semibold' : ''}`}>
											{formatDate(order.expectedDeliveryDate)}
										</td>
										<td className='px-4 py-3 text-right font-semibold'>
											{formatCurrency(order.totalAmount, order.currency)}
										</td>
										<td className='px-4 py-3'>
											{getStatusBadge(order.status)}
										</td>
										<td className='px-4 py-3 text-center'>
											<div className='flex justify-center space-x-2'>
												{isOpen && (
													<button
														onClick={() => handleReceiveOrder(order)}
														className='text-green-400 hover:text-green-300 text-sm'>
														Receive
													</button>
												)}
												<Link
													href={`/purchases/orders/${order.id}/edit`}
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
								);
							})
						}
					</tbody>
				</table>
			</div>

			{/* Purchase Orders Cards (Mobile/Tablet) */}
			<div className='lg:hidden'>
				{filteredOrders.length === 0 ?
					<div className='bg-gray-800 rounded-lg p-8 text-center text-gray-400'>
						No purchase orders found. Create a new purchase order to get
						started.
					</div>
				:	filteredOrders.map((order) => (
						<PurchaseOrderCard
							key={order.id}
							po={order}
							onStatusChange={handleStatusChange}
							onReceive={handleReceiveOrder}
						/>
					))
				}
			</div>

			{/* Receive Order Modal */}
			{showReceiveModal && selectedOrderForReceive && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto'>
					<div className='bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto'>
						<h2 className='text-xl font-bold mb-4'>Receive Order</h2>
						<p className='text-sm text-gray-400 mb-4'>
							PO: {selectedOrderForReceive.poNumber} -{' '}
							{selectedOrderForReceive.vendorName}
						</p>

						<div className='space-y-4'>
							{selectedOrderForReceive.items.map((item) => (
								<div
									key={item.id}
									className='border border-gray-700 rounded p-3'>
									<p className='font-medium mb-2'>{item.description}</p>
									<div className='grid grid-cols-2 gap-4 text-sm'>
										<div>
											<span className='text-gray-400'>Ordered:</span>
											<span className='ml-2'>{item.quantity}</span>
										</div>
										<div>
											<span className='text-gray-400'>Received so far:</span>
											<span className='ml-2'>{item.receivedQuantity || 0}</span>
										</div>
										<div className='col-span-2'>
											<label className='block text-gray-400 mb-1'>
												Quantity to Receive
											</label>
											<input
												type='number'
												min='0'
												max={item.quantity - (item.receivedQuantity || 0)}
												value={receiveItems[item.id] || 0}
												onChange={(e) =>
													setReceiveItems({
														...receiveItems,
														[item.id]: parseInt(e.target.value) || 0,
													})
												}
												className='w-full p-2 bg-gray-700 rounded text-white'
											/>
										</div>
									</div>
								</div>
							))}
						</div>

						<div className='flex justify-end space-x-3 mt-6'>
							<button
								onClick={() => {
									setShowReceiveModal(false);
									setSelectedOrderForReceive(null);
								}}
								className='px-4 py-2 bg-gray-700 rounded hover:bg-gray-600'>
								Cancel
							</button>
							<button
								onClick={handleSubmitReceive}
								className='px-4 py-2 bg-green-500 rounded hover:bg-green-600'>
								Confirm Receipt
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Toast Notification */}
			{toast.show && (
				<div
					className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
						toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
					} text-white animate-in slide-in-from-bottom-2 z-50`}>
					{toast.message}
				</div>
			)}
		</div>
	);
}

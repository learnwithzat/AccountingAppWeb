/** @format */
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
	useReturnStore,
	ReturnOrder,
	ReturnStatus,
	ReturnReason,
} from '@/store/useReturnStore';

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

const getStatusColor = (status: ReturnStatus): string => {
	const colors = {
		requested: 'bg-yellow-500 text-black',
		approved: 'bg-blue-500 text-white',
		processing: 'bg-purple-500 text-white',
		completed: 'bg-green-500 text-white',
		rejected: 'bg-red-500 text-white',
		partial: 'bg-orange-500 text-black',
	};
	return colors[status] || colors.requested;
};

const getStatusBadge = (status: ReturnStatus) => {
	const labels = {
		requested: 'Requested',
		approved: 'Approved',
		processing: 'Processing',
		completed: 'Completed',
		rejected: 'Rejected',
		partial: 'Partial Return',
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

const getReasonLabel = (reason: ReturnReason): string => {
	const labels = {
		defective: 'Defective Product',
		wrong_item: 'Wrong Item Received',
		damaged: 'Damaged in Shipping',
		not_as_described: 'Not as Described',
		changed_mind: 'Changed Mind',
		better_price: 'Found Better Price',
		other: 'Other Reason',
	};
	return labels[reason] || reason;
};

/* ─────────────────────────────────────────
   FILTERS COMPONENT
───────────────────────────────────────── */

interface ReturnFilters {
	search: string;
	status: ReturnStatus | 'all';
	dateFrom: string;
	dateTo: string;
	minAmount: string;
	maxAmount: string;
	reason: ReturnReason | 'all';
}

const initialFilters: ReturnFilters = {
	search: '',
	status: 'all',
	dateFrom: '',
	dateTo: '',
	minAmount: '',
	maxAmount: '',
	reason: 'all',
};

function ReturnFiltersComponent({
	filters,
	onFilterChange,
	onReset,
}: {
	filters: ReturnFilters;
	onFilterChange: (filters: ReturnFilters) => void;
	onReset: () => void;
}) {
	const [isExpanded, setIsExpanded] = useState(false);

	const handleChange = (key: keyof ReturnFilters, value: string) => {
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
						placeholder='Return #, order #, customer...'
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
							handleChange('status', e.target.value as ReturnStatus | 'all')
						}
						className='w-full p-2 bg-gray-700 rounded text-white'>
						<option value='all'>All Status</option>
						<option value='requested'>Requested</option>
						<option value='approved'>Approved</option>
						<option value='processing'>Processing</option>
						<option value='completed'>Completed</option>
						<option value='rejected'>Rejected</option>
						<option value='partial'>Partial</option>
					</select>
				</div>

				{isExpanded && (
					<>
						<div>
							<label className='block text-sm text-gray-400 mb-1'>Reason</label>
							<select
								value={filters.reason}
								onChange={(e) =>
									handleChange('reason', e.target.value as ReturnReason | 'all')
								}
								className='w-full p-2 bg-gray-700 rounded text-white'>
								<option value='all'>All Reasons</option>
								<option value='defective'>Defective Product</option>
								<option value='wrong_item'>Wrong Item Received</option>
								<option value='damaged'>Damaged in Shipping</option>
								<option value='not_as_described'>Not as Described</option>
								<option value='changed_mind'>Changed Mind</option>
								<option value='better_price'>Found Better Price</option>
								<option value='other'>Other Reason</option>
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
   RETURN CARD COMPONENT (Mobile View)
───────────────────────────────────────── */

function ReturnCard({
	returnOrder,
	onStatusChange,
}: {
	returnOrder: ReturnOrder;
	onStatusChange: (id: string, status: ReturnStatus) => void;
}) {
	const [showStatusMenu, setShowStatusMenu] = useState(false);
	const router = useRouter();

	const statusOptions: ReturnStatus[] = [
		'requested',
		'approved',
		'processing',
		'completed',
		'rejected',
		'partial',
	];

	return (
		<div className='bg-gray-800 rounded-lg p-4 mb-3'>
			<div className='flex justify-between items-start mb-2'>
				<div>
					<Link
						href={`/sales/returns/${returnOrder.id}`}
						className='text-lg font-semibold text-blue-400 hover:text-blue-300'>
						{returnOrder.returnNumber || `RET-${returnOrder.id.slice(0, 8)}`}
					</Link>
					<p className='text-sm text-gray-400'>{returnOrder.customerName}</p>
					<p className='text-xs text-gray-500'>
						Order: {returnOrder.orderNumber}
					</p>
				</div>
				{getStatusBadge(returnOrder.status)}
			</div>

			<div className='grid grid-cols-2 gap-2 mb-3 text-sm'>
				<div>
					<span className='text-gray-400'>Return Date:</span>
					<span className='ml-2'>{formatDate(returnOrder.returnDate)}</span>
				</div>
				<div>
					<span className='text-gray-400'>Amount:</span>
					<span className='ml-2 font-semibold'>
						{formatCurrency(returnOrder.totalAmount, returnOrder.currency)}
					</span>
				</div>
				<div className='col-span-2'>
					<span className='text-gray-400'>Reason:</span>
					<span className='ml-2'>{getReasonLabel(returnOrder.reason)}</span>
				</div>
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
										onStatusChange(returnOrder.id, status);
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
					href={`/sales/returns/${returnOrder.id}/edit`}
					className='text-sm text-blue-400 hover:text-blue-300'>
					View Details
				</Link>
			</div>
		</div>
	);
}

/* ─────────────────────────────────────────
   MAIN RETURNS PAGE
───────────────────────────────────────── */

export default function SalesReturnsPage() {
	const { user, loading: authLoading } = useAuthStore();
	const companyId = user?.companyId;
	const router = useRouter();

	const {
		returns,
		loading,
		error,
		fetchReturns,
		updateReturnStatus,
		deleteReturn,
	} = useReturnStore();

	const [filters, setFilters] = useState<ReturnFilters>(initialFilters);
	const [selectedReturns, setSelectedReturns] = useState<Set<string>>(
		new Set()
	);
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
			fetchReturns(companyId);
		}
	}, [companyId, fetchReturns]);

	/* ─────────────────────────────────────────
	   FILTERING LOGIC
	───────────────────────────────────────── */

	const filteredReturns = useMemo(() => {
		let result = [...returns];

		// Search filter
		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			result = result.filter(
				(returnOrder) =>
					returnOrder.returnNumber?.toLowerCase().includes(searchLower) ||
					returnOrder.orderNumber?.toLowerCase().includes(searchLower) ||
					returnOrder.customerName.toLowerCase().includes(searchLower) ||
					returnOrder.customerEmail?.toLowerCase().includes(searchLower)
			);
		}

		// Status filter
		if (filters.status !== 'all') {
			result = result.filter(
				(returnOrder) => returnOrder.status === filters.status
			);
		}

		// Reason filter
		if (filters.reason !== 'all') {
			result = result.filter(
				(returnOrder) => returnOrder.reason === filters.reason
			);
		}

		// Date range filter
		if (filters.dateFrom) {
			const fromDate = new Date(filters.dateFrom);
			result = result.filter(
				(returnOrder) => new Date(returnOrder.returnDate) >= fromDate
			);
		}
		if (filters.dateTo) {
			const toDate = new Date(filters.dateTo);
			toDate.setHours(23, 59, 59);
			result = result.filter(
				(returnOrder) => new Date(returnOrder.returnDate) <= toDate
			);
		}

		// Amount range filter
		if (filters.minAmount) {
			const min = parseFloat(filters.minAmount);
			result = result.filter((returnOrder) => returnOrder.totalAmount >= min);
		}
		if (filters.maxAmount) {
			const max = parseFloat(filters.maxAmount);
			result = result.filter((returnOrder) => returnOrder.totalAmount <= max);
		}

		// Sort by date (newest first)
		result.sort(
			(a, b) =>
				new Date(b.returnDate).getTime() - new Date(a.returnDate).getTime()
		);

		return result;
	}, [returns, filters]);

	/* ─────────────────────────────────────────
	   STATISTICS
	───────────────────────────────────────── */

	const stats = useMemo(() => {
		const totalReturns = filteredReturns.length;
		const totalValue = filteredReturns.reduce(
			(sum, returnOrder) => sum + returnOrder.totalAmount,
			0
		);
		const pendingValue = filteredReturns
			.filter((r) => r.status === 'requested' || r.status === 'approved')
			.reduce((sum, r) => sum + r.totalAmount, 0);
		const completedValue = filteredReturns
			.filter((r) => r.status === 'completed')
			.reduce((sum, r) => sum + r.totalAmount, 0);

		const statusCounts = filteredReturns.reduce(
			(acc, returnOrder) => {
				acc[returnOrder.status] = (acc[returnOrder.status] || 0) + 1;
				return acc;
			},
			{} as Record<ReturnStatus, number>
		);

		return {
			totalReturns,
			totalValue,
			pendingValue,
			completedValue,
			statusCounts,
		};
	}, [filteredReturns]);

	/* ─────────────────────────────────────────
	   HANDLERS
	───────────────────────────────────────── */

	const handleFilterChange = (newFilters: ReturnFilters) => {
		setFilters(newFilters);
	};

	const resetFilters = () => {
		setFilters(initialFilters);
	};

	const handleStatusChange = async (
		returnId: string,
		newStatus: ReturnStatus
	) => {
		if (!companyId) return;
		try {
			await updateReturnStatus(companyId, returnId, newStatus);
			showToast(`Return ${returnId} status updated to ${newStatus}`, 'success');
		} catch (err) {
			showToast('Failed to update return status', 'error');
		}
	};

	const handleBulkStatusChange = async (newStatus: ReturnStatus) => {
		if (!companyId) return;
		const promises = Array.from(selectedReturns).map((returnId) =>
			updateReturnStatus(companyId, returnId, newStatus)
		);
		try {
			await Promise.all(promises);
			showToast(
				`Updated ${selectedReturns.size} returns to ${newStatus}`,
				'success'
			);
			setSelectedReturns(new Set());
			setShowBulkActions(false);
		} catch (err) {
			showToast('Failed to update some returns', 'error');
		}
	};

	const handleDeleteReturn = async (returnId: string) => {
		if (
			!confirm(
				'Are you sure you want to delete this return? This action cannot be undone.'
			)
		) {
			return;
		}
		if (!companyId) return;
		try {
			await deleteReturn(companyId, returnId);
			showToast('Return deleted successfully', 'success');
		} catch (err) {
			showToast('Failed to delete return', 'error');
		}
	};

	const handleBulkDelete = async () => {
		if (
			!confirm(
				`Delete ${selectedReturns.size} returns? This action cannot be undone.`
			)
		) {
			return;
		}
		if (!companyId) return;
		const promises = Array.from(selectedReturns).map((returnId) =>
			deleteReturn(companyId, returnId)
		);
		try {
			await Promise.all(promises);
			showToast(`Deleted ${selectedReturns.size} returns`, 'success');
			setSelectedReturns(new Set());
			setShowBulkActions(false);
		} catch (err) {
			showToast('Failed to delete some returns', 'error');
		}
	};

	const toggleSelectReturn = (returnId: string) => {
		const newSelected = new Set(selectedReturns);
		if (newSelected.has(returnId)) {
			newSelected.delete(returnId);
		} else {
			newSelected.add(returnId);
		}
		setSelectedReturns(newSelected);
		setShowBulkActions(newSelected.size > 0);
	};

	const toggleSelectAll = () => {
		if (selectedReturns.size === filteredReturns.length) {
			setSelectedReturns(new Set());
			setShowBulkActions(false);
		} else {
			setSelectedReturns(new Set(filteredReturns.map((r) => r.id)));
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
						<p>Loading returns...</p>
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
						onClick={() => companyId && fetchReturns(companyId)}
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
					<h1 className='text-2xl font-bold'>Sales Returns</h1>
					<p className='text-gray-400 text-sm mt-1'>
						Manage customer returns, refunds, and credit memos
					</p>
				</div>
				<Link
					href='/sales/returns/new'
					className='bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold transition-colors'>
					+ New Return
				</Link>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Total Returns</p>
					<p className='text-2xl font-bold'>{stats.totalReturns}</p>
					<p className='text-xs text-gray-500 mt-1'>
						Value: {formatCurrency(stats.totalValue)}
					</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Pending Returns</p>
					<p className='text-2xl font-bold text-yellow-500'>
						{stats.statusCounts.requested ||
							0 + stats.statusCounts.approved ||
							0}
					</p>
					<p className='text-xs text-gray-500 mt-1'>
						Value: {formatCurrency(stats.pendingValue)}
					</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Completed Returns</p>
					<p className='text-2xl font-bold text-green-500'>
						{stats.statusCounts.completed || 0}
					</p>
					<p className='text-xs text-gray-500 mt-1'>
						Value: {formatCurrency(stats.completedValue)}
					</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Return Rate</p>
					<p className='text-2xl font-bold'>
						{((stats.totalReturns / (stats.totalReturns + 100)) * 100).toFixed(
							1
						)}
						%
					</p>
					<p className='text-xs text-gray-500 mt-1'>of total sales</p>
				</div>
			</div>

			{/* Filters */}
			<ReturnFiltersComponent
				filters={filters}
				onFilterChange={handleFilterChange}
				onReset={resetFilters}
			/>

			{/* Bulk Actions Bar */}
			{showBulkActions && (
				<div className='bg-blue-500/20 border border-blue-500 rounded-lg p-3 mb-4 flex justify-between items-center'>
					<span>{selectedReturns.size} returns selected</span>
					<div className='space-x-2'>
						<select
							onChange={(e) =>
								handleBulkStatusChange(e.target.value as ReturnStatus)
							}
							className='bg-gray-700 px-3 py-1 rounded text-sm'>
							<option value=''>Change Status</option>
							<option value='requested'>Requested</option>
							<option value='approved'>Approved</option>
							<option value='processing'>Processing</option>
							<option value='completed'>Completed</option>
							<option value='rejected'>Rejected</option>
							<option value='partial'>Partial</option>
						</select>
						<button
							onClick={handleBulkDelete}
							className='bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm'>
							Delete
						</button>
						<button
							onClick={() => {
								setSelectedReturns(new Set());
								setShowBulkActions(false);
							}}
							className='bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm'>
							Cancel
						</button>
					</div>
				</div>
			)}

			{/* Returns Table (Desktop) */}
			<div className='hidden lg:block bg-gray-800 rounded-lg overflow-hidden'>
				<table className='w-full'>
					<thead className='bg-gray-700'>
						<tr>
							<th className='px-4 py-3 text-left'>
								<input
									type='checkbox'
									checked={
										selectedReturns.size === filteredReturns.length &&
										filteredReturns.length > 0
									}
									onChange={toggleSelectAll}
									className='w-4 h-4'
								/>
							</th>
							<th className='px-4 py-3 text-left'>Return #</th>
							<th className='px-4 py-3 text-left'>Order #</th>
							<th className='px-4 py-3 text-left'>Customer</th>
							<th className='px-4 py-3 text-left'>Return Date</th>
							<th className='px-4 py-3 text-left'>Reason</th>
							<th className='px-4 py-3 text-right'>Amount</th>
							<th className='px-4 py-3 text-left'>Status</th>
							<th className='px-4 py-3 text-center'>Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredReturns.length === 0 ?
							<tr>
								<td
									colSpan={9}
									className='px-4 py-8 text-center text-gray-400'>
									No returns found. Create a new return to get started.
								</td>
							</tr>
						:	filteredReturns.map((returnOrder) => (
								<tr
									key={returnOrder.id}
									className='border-t border-gray-700 hover:bg-gray-700/50'>
									<td className='px-4 py-3'>
										<input
											type='checkbox'
											checked={selectedReturns.has(returnOrder.id)}
											onChange={() => toggleSelectReturn(returnOrder.id)}
											className='w-4 h-4'
										/>
									</td>
									<td className='px-4 py-3'>
										<Link
											href={`/sales/returns/${returnOrder.id}`}
											className='text-blue-400 hover:text-blue-300'>
											{returnOrder.returnNumber ||
												`RET-${returnOrder.id.slice(0, 8)}`}
										</Link>
									</td>
									<td className='px-4 py-3'>
										<Link
											href={`/sales/orders/${returnOrder.orderId}`}
											className='text-blue-400 hover:text-blue-300'>
											{returnOrder.orderNumber}
										</Link>
									</td>
									<td className='px-4 py-3'>
										<div>
											<p className='font-medium'>{returnOrder.customerName}</p>
											<p className='text-sm text-gray-400'>
												{returnOrder.customerEmail}
											</p>
										</div>
									</td>
									<td className='px-4 py-3'>
										{formatDate(returnOrder.returnDate)}
									</td>
									<td className='px-4 py-3'>
										<span className='text-sm'>
											{getReasonLabel(returnOrder.reason)}
										</span>
									</td>
									<td className='px-4 py-3 text-right font-semibold'>
										{formatCurrency(
											returnOrder.totalAmount,
											returnOrder.currency
										)}
									</td>
									<td className='px-4 py-3'>
										{getStatusBadge(returnOrder.status)}
									</td>
									<td className='px-4 py-3 text-center'>
										<div className='flex justify-center space-x-2'>
											<Link
												href={`/sales/returns/${returnOrder.id}/edit`}
												className='text-blue-400 hover:text-blue-300 text-sm'>
												Edit
											</Link>
											<button
												onClick={() => handleDeleteReturn(returnOrder.id)}
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

			{/* Returns Cards (Mobile/Tablet) */}
			<div className='lg:hidden'>
				{filteredReturns.length === 0 ?
					<div className='bg-gray-800 rounded-lg p-8 text-center text-gray-400'>
						No returns found. Create a new return to get started.
					</div>
				:	filteredReturns.map((returnOrder) => (
						<ReturnCard
							key={returnOrder.id}
							returnOrder={returnOrder}
							onStatusChange={handleStatusChange}
						/>
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

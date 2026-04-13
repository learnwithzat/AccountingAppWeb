/** @format */

'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import {
	ReceiptStatus,
	ReceiptMethod,
	ReceiptCategory,
	GeneralReceipt,
	useGeneralReceiptStore,
} from '@/store/useGeneralReceiptStore';

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

const getStatusColor = (status: ReceiptStatus): string => {
	const colors = {
		draft: 'bg-gray-600 text-white',
		pending: 'bg-yellow-500 text-black',
		processing: 'bg-blue-500 text-white',
		completed: 'bg-green-500 text-white',
		failed: 'bg-red-500 text-white',
		cancelled: 'bg-red-600 text-white',
		refunded: 'bg-purple-500 text-white',
	};
	return colors[status] || colors.draft;
};

const getStatusBadge = (status: ReceiptStatus) => {
	const labels = {
		draft: 'Draft',
		pending: 'Pending',
		processing: 'Processing',
		completed: 'Completed',
		failed: 'Failed',
		cancelled: 'Cancelled',
		refunded: 'Refunded',
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

const getMethodIcon = (method: ReceiptMethod) => {
	const icons = {
		bank_transfer: '🏦',
		credit_card: '💳',
		debit_card: '💳',
		cash: '💵',
		check: '📝',
		paypal: '💰',
		stripe: '⚡',
		crypto: '₿',
		other: '📦',
	};
	return icons[method] || '💰';
};

const getCategoryLabel = (category: ReceiptCategory): string => {
	const labels = {
		sales: 'Sales Revenue',
		services: 'Service Income',
		interest: 'Interest Income',
		investment: 'Investment Income',
		refund: 'Refund Received',
		grant: 'Grant',
		loan: 'Loan Proceeds',
		capital: 'Capital Contribution',
		other_income: 'Other Income',
		miscellaneous: 'Miscellaneous',
	};
	return labels[category] || category;
};

/* ─────────────────────────────────────────
   FILTERS INTERFACE
───────────────────────────────────────── */

interface ReceiptFilters {
	search: string;
	status: ReceiptStatus | 'all';
	category: ReceiptCategory | 'all';
	method: ReceiptMethod | 'all';
	dateFrom: string;
	dateTo: string;
	minAmount: string;
	maxAmount: string;
	payer: string;
}

const initialFilters: ReceiptFilters = {
	search: '',
	status: 'all',
	category: 'all',
	method: 'all',
	dateFrom: '',
	dateTo: '',
	minAmount: '',
	maxAmount: '',
	payer: '',
};

/* ─────────────────────────────────────────
   MAIN GENERAL RECEIPT PAGE
───────────────────────────────────────── */

export default function GeneralReceiptPage() {
	const { user, loading: authLoading } = useAuthStore();
	const companyId = user?.companyId;

	const {
		receipts,
		loading,
		error,
		fetchReceipts,
		updateReceiptStatus,
		deleteReceipt,
		completeReceipt,
	} = useGeneralReceiptStore();

	const [filters, setFilters] = useState<ReceiptFilters>(initialFilters);
	const [selectedReceipts, setSelectedReceipts] = useState<Set<string>>(
		new Set()
	);
	const [showBulkActions, setShowBulkActions] = useState(false);
	const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
	const [toast, setToast] = useState({
		show: false,
		message: '',
		type: 'success',
	});
	const [showCompleteModal, setShowCompleteModal] = useState(false);
	const [selectedReceiptForComplete, setSelectedReceiptForComplete] =
		useState<GeneralReceipt | null>(null);
	const [completionDate, setCompletionDate] = useState(
		new Date().toISOString().split('T')[0]
	);
	const [completionReference, setCompletionReference] = useState('');
	const [statusMenuOpen, setStatusMenuOpen] = useState<string | null>(null);

	/* ─────────────────────────────────────────
	   EFFECTS
	───────────────────────────────────────── */

	useEffect(() => {
		if (companyId) {
			fetchReceipts(companyId);
		}
	}, [companyId, fetchReceipts]);

	/* ─────────────────────────────────────────
	   FILTERING LOGIC
	───────────────────────────────────────── */

	const filteredReceipts = useMemo(() => {
		let result = [...receipts];

		// Search filter
		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			result = result.filter(
				(receipt) =>
					receipt.receiptNumber?.toLowerCase().includes(searchLower) ||
					receipt.payer.toLowerCase().includes(searchLower) ||
					receipt.description?.toLowerCase().includes(searchLower) ||
					receipt.reference?.toLowerCase().includes(searchLower)
			);
		}

		// Status filter
		if (filters.status !== 'all') {
			result = result.filter((receipt) => receipt.status === filters.status);
		}

		// Category filter
		if (filters.category !== 'all') {
			result = result.filter(
				(receipt) => receipt.category === filters.category
			);
		}

		// Method filter
		if (filters.method !== 'all') {
			result = result.filter((receipt) => receipt.method === filters.method);
		}

		// Payer filter
		if (filters.payer) {
			const payerLower = filters.payer.toLowerCase();
			result = result.filter((receipt) =>
				receipt.payer.toLowerCase().includes(payerLower)
			);
		}

		// Date range filter
		if (filters.dateFrom) {
			const fromDate = new Date(filters.dateFrom);
			result = result.filter(
				(receipt) => new Date(receipt.receiptDate) >= fromDate
			);
		}
		if (filters.dateTo) {
			const toDate = new Date(filters.dateTo);
			toDate.setHours(23, 59, 59);
			result = result.filter(
				(receipt) => new Date(receipt.receiptDate) <= toDate
			);
		}

		// Amount range filter
		if (filters.minAmount) {
			const min = parseFloat(filters.minAmount);
			result = result.filter((receipt) => receipt.amount >= min);
		}
		if (filters.maxAmount) {
			const max = parseFloat(filters.maxAmount);
			result = result.filter((receipt) => receipt.amount <= max);
		}

		// Sort by date (newest first)
		result.sort(
			(a, b) =>
				new Date(b.receiptDate).getTime() - new Date(a.receiptDate).getTime()
		);

		return result;
	}, [receipts, filters]);

	/* ─────────────────────────────────────────
	   STATISTICS
	───────────────────────────────────────── */

	const stats = useMemo(() => {
		const totalReceipts = filteredReceipts.length;
		const totalAmount = filteredReceipts.reduce(
			(sum, receipt) => sum + receipt.amount,
			0
		);

		const completedReceipts = filteredReceipts.filter(
			(r) => r.status === 'completed'
		);
		const completedAmount = completedReceipts.reduce(
			(sum, r) => sum + r.amount,
			0
		);

		const pendingReceipts = filteredReceipts.filter(
			(r) => r.status === 'pending' || r.status === 'processing'
		);
		const pendingAmount = pendingReceipts.reduce((sum, r) => sum + r.amount, 0);

		const categoryBreakdown = filteredReceipts.reduce(
			(acc, receipt) => {
				acc[receipt.category] = (acc[receipt.category] || 0) + receipt.amount;
				return acc;
			},
			{} as Record<string, number>
		);

		const averageReceiptValue =
			totalReceipts > 0 ? totalAmount / totalReceipts : 0;

		return {
			totalReceipts,
			totalAmount,
			completedCount: completedReceipts.length,
			completedAmount,
			pendingCount: pendingReceipts.length,
			pendingAmount,
			averageReceiptValue,
			categoryBreakdown,
		};
	}, [filteredReceipts]);

	/* ─────────────────────────────────────────
	   HANDLERS
	───────────────────────────────────────── */

	const handleFilterChange = (key: keyof ReceiptFilters, value: string) => {
		setFilters({ ...filters, [key]: value });
	};

	const resetFilters = () => {
		setFilters(initialFilters);
	};

	const handleStatusChange = async (
		receiptId: string,
		newStatus: ReceiptStatus
	) => {
		if (!companyId) return;
		try {
			await updateReceiptStatus(companyId, receiptId, newStatus);
			showToast(`Receipt status updated to ${newStatus}`, 'success');
			setStatusMenuOpen(null);
		} catch (err) {
			showToast('Failed to update receipt status', 'error');
		}
	};

	const handleBulkStatusChange = async (newStatus: ReceiptStatus) => {
		if (!companyId) return;
		const promises = Array.from(selectedReceipts).map((receiptId) =>
			updateReceiptStatus(companyId, receiptId, newStatus)
		);
		try {
			await Promise.all(promises);
			showToast(
				`Updated ${selectedReceipts.size} receipts to ${newStatus}`,
				'success'
			);
			setSelectedReceipts(new Set());
			setShowBulkActions(false);
		} catch (err) {
			showToast('Failed to update some receipts', 'error');
		}
	};

	const handleDeleteReceipt = async (receiptId: string) => {
		if (
			!confirm(
				'Are you sure you want to delete this receipt? This action cannot be undone.'
			)
		) {
			return;
		}
		if (!companyId) return;
		try {
			await deleteReceipt(companyId, receiptId);
			showToast('Receipt deleted successfully', 'success');
		} catch (err) {
			showToast('Failed to delete receipt', 'error');
		}
	};

	const handleBulkDelete = async () => {
		if (
			!confirm(
				`Delete ${selectedReceipts.size} receipts? This action cannot be undone.`
			)
		) {
			return;
		}
		if (!companyId) return;
		const promises = Array.from(selectedReceipts).map((receiptId) =>
			deleteReceipt(companyId, receiptId)
		);
		try {
			await Promise.all(promises);
			showToast(`Deleted ${selectedReceipts.size} receipts`, 'success');
			setSelectedReceipts(new Set());
			setShowBulkActions(false);
		} catch (err) {
			showToast('Failed to delete some receipts', 'error');
		}
	};

	const handleCompleteReceipt = (receipt: GeneralReceipt) => {
		setSelectedReceiptForComplete(receipt);
		setCompletionDate(new Date().toISOString().split('T')[0]);
		setCompletionReference('');
		setShowCompleteModal(true);
	};

	const handleSubmitComplete = async () => {
		if (!companyId || !selectedReceiptForComplete) return;

		try {
			await completeReceipt(companyId, selectedReceiptForComplete.id, {
				completedDate: completionDate,
				reference: completionReference,
			});
			showToast('Receipt marked as completed', 'success');
			setShowCompleteModal(false);
			setSelectedReceiptForComplete(null);
		} catch (err) {
			showToast('Failed to complete receipt', 'error');
		}
	};

	const toggleSelectReceipt = (receiptId: string) => {
		const newSelected = new Set(selectedReceipts);
		if (newSelected.has(receiptId)) {
			newSelected.delete(receiptId);
		} else {
			newSelected.add(receiptId);
		}
		setSelectedReceipts(newSelected);
		setShowBulkActions(newSelected.size > 0);
	};

	const toggleSelectAll = () => {
		if (selectedReceipts.size === filteredReceipts.length) {
			setSelectedReceipts(new Set());
			setShowBulkActions(false);
		} else {
			setSelectedReceipts(new Set(filteredReceipts.map((r) => r.id)));
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

	const statusOptions: ReceiptStatus[] = [
		'draft',
		'pending',
		'processing',
		'completed',
		'failed',
		'cancelled',
		'refunded',
	];

	/* ─────────────────────────────────────────
	   RENDER STATES
	───────────────────────────────────────── */

	if (authLoading || loading) {
		return (
			<div className='p-6 text-gray-900 bg-gray-50 min-h-screen'>
				<div className='flex justify-center items-center h-64'>
					<div className='text-center'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
						<p>Loading receipts...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='p-6 text-gray-900 bg-gray-50 min-h-screen'>
				<div className='bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500'>
					<p>Error: {error}</p>
					<button
						onClick={() => companyId && fetchReceipts(companyId)}
						className='mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600'>
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
		<div className='p-6 text-gray-900 bg-gray-50 min-h-screen'>
			{/* Header */}
			<div className='flex justify-between items-center mb-6'>
				<div>
					<h1 className='text-2xl font-bold'>General Receipts</h1>
					<p className='text-gray-500 text-sm mt-1'>
						Manage miscellaneous receipts, income, and cash inflows
					</p>
				</div>
				<Link
					href='/transactions/general-receipt/new'
					className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors'>
					+ New Receipt
				</Link>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
				<div className='bg-white border border-gray-200 shadow-sm rounded-lg p-4'>
					<p className='text-gray-500 text-sm'>Total Receipts</p>
					<p className='text-2xl font-bold'>{stats.totalReceipts}</p>
					<p className='text-xs text-gray-400 mt-1'>
						Value: {formatCurrency(stats.totalAmount)}
					</p>
				</div>
				<div className='bg-white border border-gray-200 shadow-sm rounded-lg p-4'>
					<p className='text-gray-500 text-sm'>Completed Receipts</p>
					<p className='text-2xl font-bold text-green-500'>
						{stats.completedCount}
					</p>
					<p className='text-xs text-gray-400 mt-1'>
						Value: {formatCurrency(stats.completedAmount)}
					</p>
				</div>
				<div className='bg-white border border-gray-200 shadow-sm rounded-lg p-4'>
					<p className='text-gray-500 text-sm'>Pending Receipts</p>
					<p className='text-2xl font-bold text-yellow-500'>
						{stats.pendingCount}
					</p>
					<p className='text-xs text-gray-400 mt-1'>
						Value: {formatCurrency(stats.pendingAmount)}
					</p>
				</div>
				<div className='bg-white border border-gray-200 shadow-sm rounded-lg p-4'>
					<p className='text-gray-500 text-sm'>Average Receipt Value</p>
					<p className='text-2xl font-bold'>
						{formatCurrency(stats.averageReceiptValue)}
					</p>
					<p className='text-xs text-gray-500 mt-1'>per transaction</p>
				</div>
			</div>

			{/* Category Breakdown */}
			<div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-6'>
				{Object.entries(stats.categoryBreakdown)
					.slice(0, 4)
					.map(([category, amount]) => (
						<div
							key={category}
							className='bg-white border border-gray-100 rounded-lg p-3 shadow-sm'>
							<p className='text-xs text-gray-400'>
								{getCategoryLabel(category as ReceiptCategory)}
							</p>
							<p className='text-lg font-semibold text-green-600'>
								{formatCurrency(amount)}
							</p>
						</div>
					))}
			</div>

			{/* Filters Section */}
			<div className='bg-white border border-gray-200 shadow-sm rounded-lg p-4 mb-6'>
				<div className='flex justify-between items-center mb-4'>
					<h3 className='text-lg font-semibold text-gray-900'>Filters</h3>
					<div className='space-x-2'>
						<button
							onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
							className='text-sm text-blue-600 hover:text-blue-700 font-medium'>
							{isFiltersExpanded ? 'Show Less' : 'Show More'}
						</button>
						<button
							onClick={resetFilters}
							className='text-sm text-gray-500 hover:text-gray-700'>
							Reset
						</button>
					</div>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
					<div>
						<label className='block text-sm text-gray-500 mb-1'>Search</label>
						<input
							type='text'
							placeholder='Receipt #, payer, description...'
							value={filters.search}
							onChange={(e) => handleFilterChange('search', e.target.value)}
							className='w-full p-2 bg-white border border-gray-300 rounded text-gray-900'
						/>
					</div>

					<div>
						<label className='block text-sm text-gray-500 mb-1'>Status</label>
						<select
							value={filters.status}
							onChange={(e) =>
								handleFilterChange(
									'status',
									e.target.value as ReceiptStatus | 'all'
								)
							}
							className='w-full p-2 bg-white border border-gray-300 rounded text-gray-900'>
							<option value='all'>All Status</option>
							<option value='draft'>Draft</option>
							<option value='pending'>Pending</option>
							<option value='processing'>Processing</option>
							<option value='completed'>Completed</option>
							<option value='failed'>Failed</option>
							<option value='cancelled'>Cancelled</option>
							<option value='refunded'>Refunded</option>
						</select>
					</div>

					{isFiltersExpanded && (
						<>
							<div>
								<label className='block text-sm text-gray-500 mb-1'>
									Category
								</label>
								<select
									value={filters.category}
									onChange={(e) =>
										handleFilterChange(
											'category',
											e.target.value as ReceiptCategory | 'all'
										)
									}
									className='w-full p-2 bg-white border border-gray-300 rounded text-gray-900'>
									<option value='all'>All Categories</option>
									<option value='sales'>Sales Revenue</option>
									<option value='services'>Service Income</option>
									<option value='interest'>Interest Income</option>
									<option value='investment'>Investment Income</option>
									<option value='refund'>Refund Received</option>
									<option value='grant'>Grant</option>
									<option value='loan'>Loan Proceeds</option>
									<option value='capital'>Capital Contribution</option>
									<option value='other_income'>Other Income</option>
									<option value='miscellaneous'>Miscellaneous</option>
								</select>
							</div>

							<div>
								<label className='block text-sm text-gray-500 mb-1'>
									Receipt Method
								</label>
								<select
									value={filters.method}
									onChange={(e) =>
										handleFilterChange(
											'method',
											e.target.value as ReceiptMethod | 'all'
										)
									}
									className='w-full p-2 bg-white border border-gray-300 rounded text-gray-900'>
									<option value='all'>All Methods</option>
									<option value='bank_transfer'>Bank Transfer</option>
									<option value='credit_card'>Credit Card</option>
									<option value='debit_card'>Debit Card</option>
									<option value='cash'>Cash</option>
									<option value='check'>Check</option>
									<option value='paypal'>PayPal</option>
									<option value='stripe'>Stripe</option>
									<option value='crypto'>Cryptocurrency</option>
									<option value='other'>Other</option>
								</select>
							</div>

							<div>
								<label className='block text-sm text-gray-500 mb-1'>
									Payer
								</label>
								<input
									type='text'
									placeholder='Payer name'
									value={filters.payer}
									onChange={(e) => handleFilterChange('payer', e.target.value)}
									className='w-full p-2 bg-white border border-gray-300 rounded text-gray-900'
								/>
							</div>

							<div>
								<label className='block text-sm text-gray-500 mb-1'>
									From Date
								</label>
								<input
									type='date'
									value={filters.dateFrom}
									onChange={(e) =>
										handleFilterChange('dateFrom', e.target.value)
									}
									className='w-full p-2 bg-white border border-gray-300 rounded text-gray-900'
								/>
							</div>

							<div>
								<label className='block text-sm text-gray-500 mb-1'>
									To Date
								</label>
								<input
									type='date'
									value={filters.dateTo}
									onChange={(e) => handleFilterChange('dateTo', e.target.value)}
									className='w-full p-2 bg-white border border-gray-300 rounded text-gray-900'
								/>
							</div>

							<div>
								<label className='block text-sm text-gray-500 mb-1'>
									Min Amount
								</label>
								<input
									type='number'
									placeholder='0.00'
									value={filters.minAmount}
									onChange={(e) =>
										handleFilterChange('minAmount', e.target.value)
									}
									className='w-full p-2 bg-white border border-gray-300 rounded text-gray-900'
								/>
							</div>

							<div>
								<label className='block text-sm text-gray-500 mb-1'>
									Max Amount
								</label>
								<input
									type='number'
									placeholder='99999.99'
									value={filters.maxAmount}
									onChange={(e) =>
										handleFilterChange('maxAmount', e.target.value)
									}
									className='w-full p-2 bg-white border border-gray-300 rounded text-gray-900'
								/>
							</div>
						</>
					)}
				</div>
			</div>

			{/* Bulk Actions Bar */}
			{showBulkActions && (
				<div className='bg-blue-500/20 border border-blue-500 rounded-lg p-3 mb-4 flex justify-between items-center flex-wrap gap-2'>
					<span className='text-sm font-medium'>
						{selectedReceipts.size} receipts selected
					</span>
					<div className='space-x-2'>
						<select
							onChange={(e) =>
								handleBulkStatusChange(e.target.value as ReceiptStatus)
							}
							className='bg-white border border-gray-300 px-3 py-1 rounded text-sm text-gray-900'>
							<option value=''>Change Status</option>
							<option value='draft'>Draft</option>
							<option value='pending'>Pending</option>
							<option value='processing'>Processing</option>
							<option value='completed'>Completed</option>
							<option value='failed'>Failed</option>
							<option value='cancelled'>Cancelled</option>
							<option value='refunded'>Refunded</option>
						</select>
						<button
							onClick={handleBulkDelete}
							className='bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm'>
							Delete
						</button>
						<button
							onClick={() => {
								setSelectedReceipts(new Set());
								setShowBulkActions(false);
							}}
							className='bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm'>
							Cancel
						</button>
					</div>
				</div>
			)}

			{/* Receipts Table (Desktop) */}
			<div className='hidden lg:block bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden'>
				<table className='w-full'>
					<thead className='bg-gray-50'>
						<tr className='text-left text-sm text-gray-500 font-medium'>
							<th className='px-4 py-3'>
								<input
									type='checkbox'
									checked={
										selectedReceipts.size === filteredReceipts.length &&
										filteredReceipts.length > 0
									}
									onChange={toggleSelectAll}
									className='w-4 h-4'
								/>
							</th>
							<th className='px-4 py-3'>Receipt #</th>
							<th className='px-4 py-3'>Payer</th>
							<th className='px-4 py-3'>Date</th>
							<th className='px-4 py-3'>Category</th>
							<th className='px-4 py-3'>Method</th>
							<th className='px-4 py-3 text-right'>Amount</th>
							<th className='px-4 py-3'>Status</th>
							<th className='px-4 py-3 text-center'>Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredReceipts.length === 0 ?
							<tr>
								<td
									colSpan={9}
									className='px-4 py-8 text-center text-gray-500'>
									No receipts found. Create a new receipt to get started.
								</td>
							</tr>
						:	filteredReceipts.map((receipt) => (
								<tr
									key={receipt.id}
									className='border-t border-gray-100 hover:bg-gray-50'>
									<td className='px-4 py-3'>
										<input
											type='checkbox'
											checked={selectedReceipts.has(receipt.id)}
											onChange={() => toggleSelectReceipt(receipt.id)}
											className='w-4 h-4'
										/>
									</td>
									<td className='px-4 py-3'>
										<Link
											href={`/transactions/general-receipt/${receipt.id}`}
											className='text-blue-600 hover:text-blue-800 font-mono text-sm'>
											{receipt.receiptNumber || `REC-${receipt.id.slice(0, 8)}`}
										</Link>
									</td>
									<td className='px-4 py-3'>
										<div>
											<p className='font-medium'>{receipt.payer}</p>
											{receipt.description && (
												<p className='text-xs text-gray-500'>
													{receipt.description}
												</p>
											)}
										</div>
									</td>
									<td className='px-4 py-3 text-sm'>
										{formatDate(receipt.receiptDate)}
									</td>
									<td className='px-4 py-3 text-sm'>
										{getCategoryLabel(receipt.category)}
									</td>
									<td className='px-4 py-3'>
										<span className='text-sm'>
											{getMethodIcon(receipt.method)} {receipt.method}
										</span>
									</td>
									<td className='px-4 py-3 text-right font-semibold text-green-600'>
										{formatCurrency(receipt.amount, receipt.currency)}
									</td>
									<td className='px-4 py-3'>
										{getStatusBadge(receipt.status)}
									</td>
									<td className='px-4 py-3 text-center'>
										<div className='relative'>
											<button
												onClick={() =>
													setStatusMenuOpen(
														statusMenuOpen === receipt.id ? null : receipt.id
													)
												}
												className='text-gray-500 hover:text-gray-700 px-2 py-1'>
												•••
											</button>
											{statusMenuOpen === receipt.id && (
												<div className='absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg z-10'>
													{receipt.status === 'pending' && (
														<button
															onClick={() => handleCompleteReceipt(receipt)}
															className='block w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-gray-50'>
															Complete
														</button>
													)}
													<Link
														href={`/transactions/general-receipt/${receipt.id}/edit`}
														className='block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-gray-50'>
														Edit
													</Link>
													<button
														onClick={() => handleDeleteReceipt(receipt.id)}
														className='block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50'>
														Delete
													</button>
												</div>
											)}
										</div>
									</td>
								</tr>
							))
						}
					</tbody>
				</table>
			</div>

			{/* Receipts Cards (Mobile/Tablet) */}
			<div className='lg:hidden'>
				{filteredReceipts.length === 0 ?
					<div className='bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500 shadow-sm'>
						No receipts found. Create a new receipt to get started.
					</div>
				:	filteredReceipts.map((receipt) => (
						<div
							key={receipt.id}
							className='bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm'>
							<div className='flex justify-between items-start mb-2'>
								<div>
									<Link
										href={`/transactions/general-receipt/${receipt.id}`}
										className='text-lg font-semibold text-blue-600 hover:text-blue-800'>
										{receipt.receiptNumber || `REC-${receipt.id.slice(0, 8)}`}
									</Link>
									<p className='text-sm text-gray-500'>{receipt.payer}</p>
								</div>
								{getStatusBadge(receipt.status)}
							</div>

							<div className='grid grid-cols-2 gap-2 mb-3 text-sm text-gray-700'>
								<div>
									<span className='text-gray-500'>Date:</span>
									<span className='ml-2'>
										{formatDate(receipt.receiptDate)}
									</span>
								</div>
								<div>
									<span className='text-gray-500'>Amount:</span>
									<span className='ml-2 font-semibold text-green-600'>
										{formatCurrency(receipt.amount, receipt.currency)}
									</span>
								</div>
								<div>
									<span className='text-gray-500'>Category:</span>
									<span className='ml-2'>
										{getCategoryLabel(receipt.category)}
									</span>
								</div>
								<div>
									<span className='text-gray-500'>Method:</span>
									<span className='ml-2'>
										{getMethodIcon(receipt.method)} {receipt.method}
									</span>
								</div>
								{receipt.reference && (
									<div className='col-span-2'>
										<span className='text-gray-500'>Reference:</span>
										<span className='ml-2'>{receipt.reference}</span>
									</div>
								)}
							</div>

							{(receipt.status === 'pending' || receipt.status === 'draft') && (
								<div className='flex justify-between items-center pt-2 border-t border-gray-100'>
									<div className='relative'>
										<button
											onClick={() =>
												setStatusMenuOpen(
													statusMenuOpen === receipt.id ? null : receipt.id
												)
											}
											className='text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 text-gray-700'>
											Change Status
										</button>
										{statusMenuOpen === receipt.id && (
											<div className='absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[120px]'>
												{statusOptions.map((status) => (
													<button
														key={status}
														onClick={() =>
															handleStatusChange(receipt.id, status)
														}
														className='block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded text-gray-700'>
														{status.charAt(0).toUpperCase() + status.slice(1)}
													</button>
												))}
											</div>
										)}
									</div>

									<div className='space-x-2'>
										{receipt.status === 'pending' && (
											<button
												onClick={() => handleCompleteReceipt(receipt)}
												className='text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded'>
												Mark Completed
											</button>
										)}
										<Link
											href={`/transactions/general-receipt/${receipt.id}/edit`}
											className='text-sm text-blue-600 hover:text-blue-800'>
											Edit
										</Link>
									</div>
								</div>
							)}
						</div>
					))
				}
			</div>

			{/* Complete Receipt Modal */}
			{showCompleteModal && selectedReceiptForComplete && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
					<div className='bg-white rounded-lg shadow-2xl max-w-md w-full p-6 text-gray-900'>
						<h2 className='text-xl font-bold mb-4'>Complete Receipt</h2>
						<p className='text-sm text-gray-500 mb-4'>
							Receipt: {selectedReceiptForComplete.receiptNumber} -{' '}
							{selectedReceiptForComplete.payer}
						</p>
						<p className='text-sm mb-4'>
							Amount:{' '}
							<span className='font-semibold text-green-600'>
								{formatCurrency(
									selectedReceiptForComplete.amount,
									selectedReceiptForComplete.currency
								)}
							</span>
						</p>

						<div className='space-y-4'>
							<div>
								<label className='block text-sm text-gray-500 mb-1'>
									Completion Date
								</label>
								<input
									type='date'
									value={completionDate}
									onChange={(e) => setCompletionDate(e.target.value)}
									className='w-full p-2 border border-gray-300 rounded text-gray-900'
								/>
							</div>

							<div>
								<label className='block text-sm text-gray-500 mb-1'>
									Reference / Transaction ID (Optional)
								</label>
								<input
									type='text'
									value={completionReference}
									onChange={(e) => setCompletionReference(e.target.value)}
									placeholder='Bank reference, transaction ID, etc.'
									className='w-full p-2 border border-gray-300 rounded text-gray-900'
								/>
							</div>
						</div>

						<div className='flex justify-end space-x-3 mt-6'>
							<button
								onClick={() => {
									setShowCompleteModal(false);
									setSelectedReceiptForComplete(null);
								}}
								className='px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700'>
								Cancel
							</button>
							<button
								onClick={handleSubmitComplete}
								className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded'>
								Confirm Completion
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Toast Notification */}
			{toast.show && (
				<div
					className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
						toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
					} text-white animate-in slide-in-from-bottom-2 z-50`}>
					{toast.message}
				</div>
			)}
		</div>
	);
}

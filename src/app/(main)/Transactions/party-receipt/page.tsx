/** @format */
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { ReceiptMethod } from '@/store/useGeneralReceiptStore';
import { PartyType } from '@/store/usePartyPaymentStore';
import {
	PartyReceiptStatus,
	PartyReceipt,
	usePartyReceiptStore,
} from '@/store/usePartyReceiptStore';

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

const getStatusColor = (status: PartyReceiptStatus): string => {
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

const getStatusBadge = (status: PartyReceiptStatus) => {
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

const getPartyTypeLabel = (type: PartyType): string => {
	const labels = {
		customer: 'Customer',
		vendor: 'Vendor',
		supplier: 'Supplier',
		employee: 'Employee',
		other: 'Other',
	};
	return labels[type] || type;
};

/* ─────────────────────────────────────────
   FILTERS COMPONENT
───────────────────────────────────────── */

interface PartyReceiptFilters {
	search: string;
	status: PartyReceiptStatus | 'all';
	partyType: PartyType | 'all';
	method: ReceiptMethod | 'all';
	dateFrom: string;
	dateTo: string;
	minAmount: string;
	maxAmount: string;
	partyId: string;
}

const initialFilters: PartyReceiptFilters = {
	search: '',
	status: 'all',
	partyType: 'all',
	method: 'all',
	dateFrom: '',
	dateTo: '',
	minAmount: '',
	maxAmount: '',
	partyId: '',
};

function PartyReceiptFiltersComponent({
	filters,
	onFilterChange,
	onReset,
	parties,
}: {
	filters: PartyReceiptFilters;
	onFilterChange: (filters: PartyReceiptFilters) => void;
	onReset: () => void;
	parties: { id: string; name: string; type: PartyType }[];
}) {
	const [isExpanded, setIsExpanded] = useState(false);

	const handleChange = (key: keyof PartyReceiptFilters, value: string) => {
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
						placeholder='Receipt #, party, reference...'
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
								e.target.value as PartyReceiptStatus | 'all'
							)
						}
						className='w-full p-2 bg-gray-700 rounded text-white'>
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

				{isExpanded && (
					<>
						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								Party Type
							</label>
							<select
								value={filters.partyType}
								onChange={(e) =>
									handleChange('partyType', e.target.value as PartyType | 'all')
								}
								className='w-full p-2 bg-gray-700 rounded text-white'>
								<option value='all'>All Parties</option>
								<option value='customer'>Customers</option>
								<option value='vendor'>Vendors</option>
								<option value='supplier'>Suppliers</option>
								<option value='employee'>Employees</option>
								<option value='other'>Other</option>
							</select>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								Specific Party
							</label>
							<select
								value={filters.partyId}
								onChange={(e) => handleChange('partyId', e.target.value)}
								className='w-full p-2 bg-gray-700 rounded text-white'>
								<option value=''>All Parties</option>
								{parties.map((party) => (
									<option
										key={party.id}
										value={party.id}>
										{party.name} ({getPartyTypeLabel(party.type)})
									</option>
								))}
							</select>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								Receipt Method
							</label>
							<select
								value={filters.method}
								onChange={(e) =>
									handleChange(
										'method',
										e.target.value as ReceiptMethod | 'all'
									)
								}
								className='w-full p-2 bg-gray-700 rounded text-white'>
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
   PARTY RECEIPT CARD COMPONENT (Mobile View)
───────────────────────────────────────── */

function PartyReceiptCard({
	receipt,
	onStatusChange,
	onComplete,
}: {
	receipt: PartyReceipt;
	onStatusChange: (id: string, status: PartyReceiptStatus) => void;
	onComplete: (receipt: PartyReceipt) => void;
}) {
	const [showStatusMenu, setShowStatusMenu] = useState(false);

	const statusOptions: PartyReceiptStatus[] = [
		'draft',
		'pending',
		'processing',
		'completed',
		'failed',
		'cancelled',
		'refunded',
	];

	return (
		<div className='bg-gray-800 rounded-lg p-4 mb-3'>
			<div className='flex justify-between items-start mb-2'>
				<div>
					<Link
						href={`/transactions/party-receipt/${receipt.id}`}
						className='text-lg font-semibold text-blue-400 hover:text-blue-300'>
						{receipt.receiptNumber || `REC-${receipt.id.slice(0, 8)}`}
					</Link>
					<p className='text-sm text-gray-400'>{receipt.partyName}</p>
					<p className='text-xs text-gray-500'>
						{getPartyTypeLabel(receipt.partyType)}
					</p>
				</div>
				{getStatusBadge(receipt.status)}
			</div>

			<div className='grid grid-cols-2 gap-2 mb-3 text-sm'>
				<div>
					<span className='text-gray-400'>Date:</span>
					<span className='ml-2'>{formatDate(receipt.receiptDate)}</span>
				</div>
				<div>
					<span className='text-gray-400'>Amount:</span>
					<span className='ml-2 font-semibold text-green-400'>
						+{formatCurrency(receipt.amount, receipt.currency)}
					</span>
				</div>
				<div>
					<span className='text-gray-400'>Method:</span>
					<span className='ml-2'>
						{getMethodIcon(receipt.method)} {receipt.method}
					</span>
				</div>
				{receipt.reference && (
					<div className='col-span-2'>
						<span className='text-gray-400'>Reference:</span>
						<span className='ml-2'>{receipt.reference}</span>
					</div>
				)}
			</div>

			{(receipt.status === 'pending' || receipt.status === 'draft') && (
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
											onStatusChange(receipt.id, status);
											setShowStatusMenu(false);
										}}
										className='block w-full text-left px-3 py-2 text-sm hover:bg-gray-600 rounded'>
										{status.charAt(0).toUpperCase() + status.slice(1)}
									</button>
								))}
							</div>
						)}
					</div>

					<div className='space-x-2'>
						{receipt.status === 'pending' && (
							<button
								onClick={() => onComplete(receipt)}
								className='text-sm bg-green-600 hover:bg-green-700 px-3 py-1 rounded'>
								Mark Completed
							</button>
						)}
						<Link
							href={`/transactions/party-receipt/${receipt.id}/edit`}
							className='text-sm text-blue-400 hover:text-blue-300'>
							Edit
						</Link>
					</div>
				</div>
			)}
		</div>
	);
}

/* ─────────────────────────────────────────
   MAIN PARTY RECEIPT PAGE
───────────────────────────────────────── */

export default function PartyReceiptPage() {
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
	} = usePartyReceiptStore();

	const [filters, setFilters] = useState<PartyReceiptFilters>(initialFilters);
	const [selectedReceipts, setSelectedReceipts] = useState<Set<string>>(
		new Set()
	);
	const [showBulkActions, setShowBulkActions] = useState(false);
	const [toast, setToast] = useState({
		show: false,
		message: '',
		type: 'success',
	});
	const [showCompleteModal, setShowCompleteModal] = useState(false);
	const [selectedReceiptForComplete, setSelectedReceiptForComplete] =
		useState<PartyReceipt | null>(null);
	const [completionDate, setCompletionDate] = useState(
		new Date().toISOString().split('T')[0]
	);
	const [completionReference, setCompletionReference] = useState('');

	// Mock parties - in real app, fetch from respective stores
	const parties = [
		{ id: '1', name: 'ABC Corp', type: 'customer' as PartyType },
		{ id: '2', name: 'XYZ Ltd', type: 'vendor' as PartyType },
		{ id: '3', name: 'John Doe', type: 'customer' as PartyType },
		{ id: '4', name: 'Tech Supplies Inc', type: 'supplier' as PartyType },
		{ id: '5', name: 'Jane Smith', type: 'employee' as PartyType },
	];

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
					receipt.partyName.toLowerCase().includes(searchLower) ||
					receipt.reference?.toLowerCase().includes(searchLower) ||
					receipt.description?.toLowerCase().includes(searchLower)
			);
		}

		// Status filter
		if (filters.status !== 'all') {
			result = result.filter((receipt) => receipt.status === filters.status);
		}

		// Party type filter
		if (filters.partyType !== 'all') {
			result = result.filter(
				(receipt) => receipt.partyType === filters.partyType
			);
		}

		// Specific party filter
		if (filters.partyId) {
			result = result.filter((receipt) => receipt.partyId === filters.partyId);
		}

		// Method filter
		if (filters.method !== 'all') {
			result = result.filter((receipt) => receipt.method === filters.method);
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

		const partyBreakdown = filteredReceipts.reduce(
			(acc, receipt) => {
				if (!acc[receipt.partyId]) {
					acc[receipt.partyId] = {
						name: receipt.partyName,
						count: 0,
						amount: 0,
					};
				}
				acc[receipt.partyId].count++;
				acc[receipt.partyId].amount += receipt.amount;
				return acc;
			},
			{} as Record<string, { name: string; count: number; amount: number }>
		);

		const methodBreakdown = filteredReceipts.reduce(
			(acc, receipt) => {
				acc[receipt.method] = (acc[receipt.method] || 0) + receipt.amount;
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
			partyBreakdown,
			methodBreakdown,
		};
	}, [filteredReceipts]);

	/* ─────────────────────────────────────────
	   HANDLERS
	───────────────────────────────────────── */

	const handleFilterChange = (newFilters: PartyReceiptFilters) => {
		setFilters(newFilters);
	};

	const resetFilters = () => {
		setFilters(initialFilters);
	};

	const handleStatusChange = async (
		receiptId: string,
		newStatus: PartyReceiptStatus
	) => {
		if (!companyId) return;
		try {
			await updateReceiptStatus(companyId, receiptId, newStatus);
			showToast(`Receipt status updated to ${newStatus}`, 'success');
		} catch (err) {
			showToast('Failed to update receipt status', 'error');
		}
	};

	const handleBulkStatusChange = async (newStatus: PartyReceiptStatus) => {
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

	const handleCompleteReceipt = (receipt: PartyReceipt) => {
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

	/* ─────────────────────────────────────────
	   RENDER STATES
	───────────────────────────────────────── */

	if (authLoading || loading) {
		return (
			<div className='p-6 text-white bg-[#0C0C0E] min-h-screen'>
				<div className='flex justify-center items-center h-64'>
					<div className='text-center'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
						<p>Loading receipts...</p>
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
						onClick={() => companyId && fetchReceipts(companyId)}
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
					<h1 className='text-2xl font-bold'>Party Receipts</h1>
					<p className='text-gray-400 text-sm mt-1'>
						Manage receipts from customers, vendors, and other parties
					</p>
				</div>
				<Link
					href='/transactions/party-receipt/new'
					className='bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold transition-colors'>
					+ New Receipt
				</Link>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Total Receipts</p>
					<p className='text-2xl font-bold'>{stats.totalReceipts}</p>
					<p className='text-xs text-gray-500 mt-1'>
						Value: {formatCurrency(stats.totalAmount)}
					</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Completed Receipts</p>
					<p className='text-2xl font-bold text-green-500'>
						{stats.completedCount}
					</p>
					<p className='text-xs text-gray-500 mt-1'>
						Value: {formatCurrency(stats.completedAmount)}
					</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Pending Receipts</p>
					<p className='text-2xl font-bold text-yellow-500'>
						{stats.pendingCount}
					</p>
					<p className='text-xs text-gray-500 mt-1'>
						Value: {formatCurrency(stats.pendingAmount)}
					</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Average Receipt Value</p>
					<p className='text-2xl font-bold'>
						{formatCurrency(stats.averageReceiptValue)}
					</p>
					<p className='text-xs text-gray-500 mt-1'>per transaction</p>
				</div>
			</div>

			{/* Party Summary */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
				<div className='bg-gray-800 rounded-lg p-4'>
					<h3 className='text-sm font-semibold mb-3'>Top Payers</h3>
					<div className='space-y-2'>
						{Object.entries(stats.partyBreakdown)
							.sort((a, b) => b[1].amount - a[1].amount)
							.slice(0, 5)
							.map(([id, data]) => (
								<div
									key={id}
									className='flex justify-between text-sm'>
									<span>{data.name}</span>
									<div>
										<span className='text-gray-400 text-xs mr-2'>
											({data.count})
										</span>
										<span className='text-green-400'>
											{formatCurrency(data.amount)}
										</span>
									</div>
								</div>
							))}
					</div>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<h3 className='text-sm font-semibold mb-3'>Payment Methods</h3>
					<div className='space-y-2'>
						{Object.entries(stats.methodBreakdown)
							.sort((a, b) => b[1] - a[1])
							.slice(0, 5)
							.map(([method, amount]) => (
								<div
									key={method}
									className='flex justify-between text-sm'>
									<span>
										{getMethodIcon(method as ReceiptMethod)} {method}
									</span>
									<span className='text-green-400'>
										{formatCurrency(amount)}
									</span>
								</div>
							))}
					</div>
				</div>
			</div>

			{/* Filters */}
			<PartyReceiptFiltersComponent
				filters={filters}
				onFilterChange={handleFilterChange}
				onReset={resetFilters}
				parties={parties}
			/>

			{/* Bulk Actions Bar */}
			{showBulkActions && (
				<div className='bg-blue-500/20 border border-blue-500 rounded-lg p-3 mb-4 flex justify-between items-center'>
					<span>{selectedReceipts.size} receipts selected</span>
					<div className='space-x-2'>
						<select
							onChange={(e) =>
								handleBulkStatusChange(e.target.value as PartyReceiptStatus)
							}
							className='bg-gray-700 px-3 py-1 rounded text-sm'>
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
							className='bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm'>
							Delete
						</button>
						<button
							onClick={() => {
								setSelectedReceipts(new Set());
								setShowBulkActions(false);
							}}
							className='bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm'>
							Cancel
						</button>
					</div>
				</div>
			)}

			{/* Receipts Table (Desktop) */}
			<div className='hidden lg:block bg-gray-800 rounded-lg overflow-hidden'>
				<table className='w-full'>
					<thead className='bg-gray-700'>
						<tr className='text-left text-sm'>
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
							<th className='px-4 py-3'>Party</th>
							<th className='px-4 py-3'>Date</th>
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
									colSpan={8}
									className='px-4 py-8 text-center text-gray-400'>
									No receipts found. Create a new receipt to get started.
								</td>
							</tr>
						:	filteredReceipts.map((receipt) => (
								<tr
									key={receipt.id}
									className='border-t border-gray-700 hover:bg-gray-700/50'>
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
											href={`/transactions/party-receipt/${receipt.id}`}
											className='text-blue-400 hover:text-blue-300 font-mono text-sm'>
											{receipt.receiptNumber || `REC-${receipt.id.slice(0, 8)}`}
										</Link>
									</td>
									<td className='px-4 py-3'>
										<div>
											<p className='font-medium'>{receipt.partyName}</p>
											<p className='text-xs text-gray-400'>
												{getPartyTypeLabel(receipt.partyType)}
											</p>
										</div>
									</td>
									<td className='px-4 py-3 text-sm'>
										{formatDate(receipt.receiptDate)}
									</td>
									<td className='px-4 py-3'>
										<span className='text-sm'>
											{getMethodIcon(receipt.method)} {receipt.method}
										</span>
									</td>
									<td className='px-4 py-3 text-right font-semibold text-green-400'>
										{formatCurrency(receipt.amount, receipt.currency)}
									</td>
									<td className='px-4 py-3'>
										{getStatusBadge(receipt.status)}
									</td>
									<td className='px-4 py-3 text-center'>
										<div className='flex justify-center space-x-2'>
											{receipt.status === 'pending' && (
												<button
													onClick={() => handleCompleteReceipt(receipt)}
													className='text-green-400 hover:text-green-300 text-sm'>
													Complete
												</button>
											)}
											<Link
												href={`/transactions/party-receipt/${receipt.id}/edit`}
												className='text-blue-400 hover:text-blue-300 text-sm'>
												Edit
											</Link>
											<button
												onClick={() => handleDeleteReceipt(receipt.id)}
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

			{/* Receipts Cards (Mobile/Tablet) */}
			<div className='lg:hidden'>
				{filteredReceipts.length === 0 ?
					<div className='bg-gray-800 rounded-lg p-8 text-center text-gray-400'>
						No receipts found. Create a new receipt to get started.
					</div>
				:	filteredReceipts.map((receipt) => (
						<PartyReceiptCard
							key={receipt.id}
							receipt={receipt}
							onStatusChange={handleStatusChange}
							onComplete={handleCompleteReceipt}
						/>
					))
				}
			</div>

			{/* Complete Receipt Modal */}
			{showCompleteModal && selectedReceiptForComplete && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
					<div className='bg-gray-800 rounded-lg max-w-md w-full p-6'>
						<h2 className='text-xl font-bold mb-4'>Complete Receipt</h2>
						<p className='text-sm text-gray-400 mb-4'>
							Receipt: {selectedReceiptForComplete.receiptNumber} -{' '}
							{selectedReceiptForComplete.partyName}
						</p>
						<p className='text-sm mb-4'>
							Amount:{' '}
							<span className='font-semibold text-green-400'>
								{formatCurrency(
									selectedReceiptForComplete.amount,
									selectedReceiptForComplete.currency
								)}
							</span>
						</p>

						<div className='space-y-4'>
							<div>
								<label className='block text-sm text-gray-400 mb-1'>
									Completion Date
								</label>
								<input
									type='date'
									value={completionDate}
									onChange={(e) => setCompletionDate(e.target.value)}
									className='w-full p-2 bg-gray-700 rounded text-white'
								/>
							</div>

							<div>
								<label className='block text-sm text-gray-400 mb-1'>
									Reference / Transaction ID (Optional)
								</label>
								<input
									type='text'
									value={completionReference}
									onChange={(e) => setCompletionReference(e.target.value)}
									placeholder='Bank reference, transaction ID, etc.'
									className='w-full p-2 bg-gray-700 rounded text-white'
								/>
							</div>
						</div>

						<div className='flex justify-end space-x-3 mt-6'>
							<button
								onClick={() => {
									setShowCompleteModal(false);
									setSelectedReceiptForComplete(null);
								}}
								className='px-4 py-2 bg-gray-700 rounded hover:bg-gray-600'>
								Cancel
							</button>
							<button
								onClick={handleSubmitComplete}
								className='px-4 py-2 bg-green-500 rounded hover:bg-green-600'>
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
						toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
					} text-white animate-in slide-in-from-bottom-2 z-50`}>
					{toast.message}
				</div>
			)}
		</div>
	);
}

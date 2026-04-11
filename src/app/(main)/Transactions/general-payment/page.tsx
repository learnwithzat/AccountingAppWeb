/** @format */
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import {
	PaymentStatus,
	PaymentMethod,
	PaymentCategory,
	GeneralPayment,
	useGeneralPaymentStore,
} from '@/store/useGeneralPaymentStore';

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

const getStatusColor = (status: PaymentStatus): string => {
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

const getStatusBadge = (status: PaymentStatus) => {
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

const getMethodIcon = (method: PaymentMethod) => {
	const icons = {
		bank_transfer: '🏦',
		credit_card: '💳',
		debit_card: '💳',
		cash: '💵',
		check: '📝',
		paypal: '💰',
		stripe: '⚡',
		other: '📦',
	};
	return icons[method] || '💰';
};

const getCategoryLabel = (category: PaymentCategory): string => {
	const labels = {
		rent: 'Rent',
		utilities: 'Utilities',
		salary: 'Salary & Wages',
		taxes: 'Taxes',
		insurance: 'Insurance',
		marketing: 'Marketing',
		software: 'Software & Subscriptions',
		office_supplies: 'Office Supplies',
		travel: 'Travel & Entertainment',
		maintenance: 'Maintenance & Repairs',
		professional_services: 'Professional Services',
		shipping: 'Shipping & Delivery',
		inventory: 'Inventory Purchase',
		equipment: 'Equipment',
		miscellaneous: 'Miscellaneous',
	};
	return labels[category] || category;
};

/* ─────────────────────────────────────────
   FILTERS COMPONENT
───────────────────────────────────────── */

interface PaymentFilters {
	search: string;
	status: PaymentStatus | 'all';
	category: PaymentCategory | 'all';
	method: PaymentMethod | 'all';
	dateFrom: string;
	dateTo: string;
	minAmount: string;
	maxAmount: string;
	payee: string;
}

const initialFilters: PaymentFilters = {
	search: '',
	status: 'all',
	category: 'all',
	method: 'all',
	dateFrom: '',
	dateTo: '',
	minAmount: '',
	maxAmount: '',
	payee: '',
};

function PaymentFiltersComponent({
	filters,
	onFilterChange,
	onReset,
}: {
	filters: PaymentFilters;
	onFilterChange: (filters: PaymentFilters) => void;
	onReset: () => void;
}) {
	const [isExpanded, setIsExpanded] = useState(false);

	const handleChange = (key: keyof PaymentFilters, value: string) => {
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
						placeholder='Payment #, payee, description...'
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
							handleChange('status', e.target.value as PaymentStatus | 'all')
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
								Category
							</label>
							<select
								value={filters.category}
								onChange={(e) =>
									handleChange(
										'category',
										e.target.value as PaymentCategory | 'all'
									)
								}
								className='w-full p-2 bg-gray-700 rounded text-white'>
								<option value='all'>All Categories</option>
								<option value='rent'>Rent</option>
								<option value='utilities'>Utilities</option>
								<option value='salary'>Salary & Wages</option>
								<option value='taxes'>Taxes</option>
								<option value='insurance'>Insurance</option>
								<option value='marketing'>Marketing</option>
								<option value='software'>Software & Subscriptions</option>
								<option value='office_supplies'>Office Supplies</option>
								<option value='travel'>Travel & Entertainment</option>
								<option value='maintenance'>Maintenance & Repairs</option>
								<option value='professional_services'>
									Professional Services
								</option>
								<option value='shipping'>Shipping & Delivery</option>
								<option value='inventory'>Inventory Purchase</option>
								<option value='equipment'>Equipment</option>
								<option value='miscellaneous'>Miscellaneous</option>
							</select>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								Payment Method
							</label>
							<select
								value={filters.method}
								onChange={(e) =>
									handleChange(
										'method',
										e.target.value as PaymentMethod | 'all'
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
								<option value='other'>Other</option>
							</select>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>Payee</label>
							<input
								type='text'
								placeholder='Payee name'
								value={filters.payee}
								onChange={(e) => handleChange('payee', e.target.value)}
								className='w-full p-2 bg-gray-700 rounded text-white'
							/>
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
   PAYMENT CARD COMPONENT (Mobile View)
───────────────────────────────────────── */

function PaymentCard({
	payment,
	onStatusChange,
	onProcess,
}: {
	payment: GeneralPayment;
	onStatusChange: (id: string, status: PaymentStatus) => void;
	onProcess: (payment: GeneralPayment) => void;
}) {
	const [showStatusMenu, setShowStatusMenu] = useState(false);

	const statusOptions: PaymentStatus[] = [
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
						href={`/transactions/general-payment/${payment.id}`}
						className='text-lg font-semibold text-blue-400 hover:text-blue-300'>
						{payment.paymentNumber || `PAY-${payment.id.slice(0, 8)}`}
					</Link>
					<p className='text-sm text-gray-400'>{payment.payee}</p>
				</div>
				{getStatusBadge(payment.status)}
			</div>

			<div className='grid grid-cols-2 gap-2 mb-3 text-sm'>
				<div>
					<span className='text-gray-400'>Date:</span>
					<span className='ml-2'>{formatDate(payment.paymentDate)}</span>
				</div>
				<div>
					<span className='text-gray-400'>Amount:</span>
					<span className='ml-2 font-semibold'>
						{formatCurrency(payment.amount, payment.currency)}
					</span>
				</div>
				<div>
					<span className='text-gray-400'>Category:</span>
					<span className='ml-2'>{getCategoryLabel(payment.category)}</span>
				</div>
				<div>
					<span className='text-gray-400'>Method:</span>
					<span className='ml-2'>
						{getMethodIcon(payment.method)} {payment.method}
					</span>
				</div>
				{payment.reference && (
					<div className='col-span-2'>
						<span className='text-gray-400'>Reference:</span>
						<span className='ml-2'>{payment.reference}</span>
					</div>
				)}
			</div>

			{(payment.status === 'pending' || payment.status === 'draft') && (
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
											onStatusChange(payment.id, status);
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
						{payment.status === 'pending' && (
							<button
								onClick={() => onProcess(payment)}
								className='text-sm bg-green-600 hover:bg-green-700 px-3 py-1 rounded'>
								Process Payment
							</button>
						)}
						<Link
							href={`/transactions/general-payment/${payment.id}/edit`}
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
   MAIN GENERAL PAYMENT PAGE
───────────────────────────────────────── */

export default function GeneralPaymentPage() {
	const { user, loading: authLoading } = useAuthStore();
	const companyId = user?.companyId;

	const {
		payments,
		loading,
		error,
		fetchPayments,
		updatePaymentStatus,
		deletePayment,
		processPayment,
	} = useGeneralPaymentStore();

	const [filters, setFilters] = useState<PaymentFilters>(initialFilters);
	const [selectedPayments, setSelectedPayments] = useState<Set<string>>(
		new Set()
	);
	const [showBulkActions, setShowBulkActions] = useState(false);
	const [toast, setToast] = useState({
		show: false,
		message: '',
		type: 'success',
	});
	const [showProcessModal, setShowProcessModal] = useState(false);
	const [selectedPaymentForProcess, setSelectedPaymentForProcess] =
		useState<GeneralPayment | null>(null);
	const [processDate, setProcessDate] = useState(
		new Date().toISOString().split('T')[0]
	);
	const [processReference, setProcessReference] = useState('');

	/* ─────────────────────────────────────────
	   EFFECTS
	───────────────────────────────────────── */

	useEffect(() => {
		if (companyId) {
			fetchPayments(companyId);
		}
	}, [companyId, fetchPayments]);

	/* ─────────────────────────────────────────
	   FILTERING LOGIC
	───────────────────────────────────────── */

	const filteredPayments = useMemo(() => {
		let result = [...payments];

		// Search filter
		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			result = result.filter(
				(payment) =>
					payment.paymentNumber?.toLowerCase().includes(searchLower) ||
					payment.payee.toLowerCase().includes(searchLower) ||
					payment.description?.toLowerCase().includes(searchLower) ||
					payment.reference?.toLowerCase().includes(searchLower)
			);
		}

		// Status filter
		if (filters.status !== 'all') {
			result = result.filter((payment) => payment.status === filters.status);
		}

		// Category filter
		if (filters.category !== 'all') {
			result = result.filter(
				(payment) => payment.category === filters.category
			);
		}

		// Method filter
		if (filters.method !== 'all') {
			result = result.filter((payment) => payment.method === filters.method);
		}

		// Payee filter
		if (filters.payee) {
			const payeeLower = filters.payee.toLowerCase();
			result = result.filter((payment) =>
				payment.payee.toLowerCase().includes(payeeLower)
			);
		}

		// Date range filter
		if (filters.dateFrom) {
			const fromDate = new Date(filters.dateFrom);
			result = result.filter(
				(payment) => new Date(payment.paymentDate) >= fromDate
			);
		}
		if (filters.dateTo) {
			const toDate = new Date(filters.dateTo);
			toDate.setHours(23, 59, 59);
			result = result.filter(
				(payment) => new Date(payment.paymentDate) <= toDate
			);
		}

		// Amount range filter
		if (filters.minAmount) {
			const min = parseFloat(filters.minAmount);
			result = result.filter((payment) => payment.amount >= min);
		}
		if (filters.maxAmount) {
			const max = parseFloat(filters.maxAmount);
			result = result.filter((payment) => payment.amount <= max);
		}

		// Sort by date (newest first)
		result.sort(
			(a, b) =>
				new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
		);

		return result;
	}, [payments, filters]);

	/* ─────────────────────────────────────────
	   STATISTICS
	───────────────────────────────────────── */

	const stats = useMemo(() => {
		const totalPayments = filteredPayments.length;
		const totalAmount = filteredPayments.reduce(
			(sum, payment) => sum + payment.amount,
			0
		);

		const completedPayments = filteredPayments.filter(
			(p) => p.status === 'completed'
		);
		const completedAmount = completedPayments.reduce(
			(sum, p) => sum + p.amount,
			0
		);

		const pendingPayments = filteredPayments.filter(
			(p) => p.status === 'pending' || p.status === 'processing'
		);
		const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

		const categoryBreakdown = filteredPayments.reduce(
			(acc, payment) => {
				acc[payment.category] = (acc[payment.category] || 0) + payment.amount;
				return acc;
			},
			{} as Record<string, number>
		);

		const statusCounts = filteredPayments.reduce(
			(acc, payment) => {
				acc[payment.status] = (acc[payment.status] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);

		return {
			totalPayments,
			totalAmount,
			completedCount: completedPayments.length,
			completedAmount,
			pendingCount: pendingPayments.length,
			pendingAmount,
			categoryBreakdown,
			statusCounts,
		};
	}, [filteredPayments]);

	/* ─────────────────────────────────────────
	   HANDLERS
	───────────────────────────────────────── */

	const handleFilterChange = (newFilters: PaymentFilters) => {
		setFilters(newFilters);
	};

	const resetFilters = () => {
		setFilters(initialFilters);
	};

	const handleStatusChange = async (
		paymentId: string,
		newStatus: PaymentStatus
	) => {
		if (!companyId) return;
		try {
			await updatePaymentStatus(companyId, paymentId, newStatus);
			showToast(`Payment status updated to ${newStatus}`, 'success');
		} catch (err) {
			showToast('Failed to update payment status', 'error');
		}
	};

	const handleBulkStatusChange = async (newStatus: PaymentStatus) => {
		if (!companyId) return;
		const promises = Array.from(selectedPayments).map((paymentId) =>
			updatePaymentStatus(companyId, paymentId, newStatus)
		);
		try {
			await Promise.all(promises);
			showToast(
				`Updated ${selectedPayments.size} payments to ${newStatus}`,
				'success'
			);
			setSelectedPayments(new Set());
			setShowBulkActions(false);
		} catch (err) {
			showToast('Failed to update some payments', 'error');
		}
	};

	const handleDeletePayment = async (paymentId: string) => {
		if (
			!confirm(
				'Are you sure you want to delete this payment? This action cannot be undone.'
			)
		) {
			return;
		}
		if (!companyId) return;
		try {
			await deletePayment(companyId, paymentId);
			showToast('Payment deleted successfully', 'success');
		} catch (err) {
			showToast('Failed to delete payment', 'error');
		}
	};

	const handleBulkDelete = async () => {
		if (
			!confirm(
				`Delete ${selectedPayments.size} payments? This action cannot be undone.`
			)
		) {
			return;
		}
		if (!companyId) return;
		const promises = Array.from(selectedPayments).map((paymentId) =>
			deletePayment(companyId, paymentId)
		);
		try {
			await Promise.all(promises);
			showToast(`Deleted ${selectedPayments.size} payments`, 'success');
			setSelectedPayments(new Set());
			setShowBulkActions(false);
		} catch (err) {
			showToast('Failed to delete some payments', 'error');
		}
	};

	const handleProcessPayment = (payment: GeneralPayment) => {
		setSelectedPaymentForProcess(payment);
		setProcessDate(new Date().toISOString().split('T')[0]);
		setProcessReference('');
		setShowProcessModal(true);
	};

	const handleSubmitProcess = async () => {
		if (!companyId || !selectedPaymentForProcess) return;

		try {
			await processPayment(companyId, selectedPaymentForProcess.id, {
				processedDate: processDate,
				reference: processReference,
				status: 'completed',
			});
			showToast('Payment processed successfully', 'success');
			setShowProcessModal(false);
			setSelectedPaymentForProcess(null);
		} catch (err) {
			showToast('Failed to process payment', 'error');
		}
	};

	const toggleSelectPayment = (paymentId: string) => {
		const newSelected = new Set(selectedPayments);
		if (newSelected.has(paymentId)) {
			newSelected.delete(paymentId);
		} else {
			newSelected.add(paymentId);
		}
		setSelectedPayments(newSelected);
		setShowBulkActions(newSelected.size > 0);
	};

	const toggleSelectAll = () => {
		if (selectedPayments.size === filteredPayments.length) {
			setSelectedPayments(new Set());
			setShowBulkActions(false);
		} else {
			setSelectedPayments(new Set(filteredPayments.map((p) => p.id)));
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
						<p>Loading payments...</p>
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
						onClick={() => companyId && fetchPayments(companyId)}
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
					<h1 className='text-2xl font-bold'>General Payments</h1>
					<p className='text-gray-400 text-sm mt-1'>
						Manage miscellaneous payments, expenses, and disbursements
					</p>
				</div>
				<Link
					href='/transactions/general-payment/new'
					className='bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold transition-colors'>
					+ New Payment
				</Link>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Total Payments</p>
					<p className='text-2xl font-bold'>{stats.totalPayments}</p>
					<p className='text-xs text-gray-500 mt-1'>
						Value: {formatCurrency(stats.totalAmount)}
					</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Completed Payments</p>
					<p className='text-2xl font-bold text-green-500'>
						{stats.completedCount}
					</p>
					<p className='text-xs text-gray-500 mt-1'>
						Value: {formatCurrency(stats.completedAmount)}
					</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Pending Payments</p>
					<p className='text-2xl font-bold text-yellow-500'>
						{stats.pendingCount}
					</p>
					<p className='text-xs text-gray-500 mt-1'>
						Value: {formatCurrency(stats.pendingAmount)}
					</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Success Rate</p>
					<p className='text-2xl font-bold'>
						{stats.totalPayments > 0 ?
							((stats.completedCount / stats.totalPayments) * 100).toFixed(1)
						:	0}
						%
					</p>
					<p className='text-xs text-gray-500 mt-1'>of total payments</p>
				</div>
			</div>

			{/* Category Breakdown */}
			<div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-6'>
				{Object.entries(stats.categoryBreakdown)
					.slice(0, 4)
					.map(([category, amount]) => (
						<div
							key={category}
							className='bg-gray-800/50 rounded-lg p-3'>
							<p className='text-xs text-gray-400'>
								{getCategoryLabel(category as PaymentCategory)}
							</p>
							<p className='text-lg font-semibold'>{formatCurrency(amount)}</p>
						</div>
					))}
			</div>

			{/* Filters */}
			<PaymentFiltersComponent
				filters={filters}
				onFilterChange={handleFilterChange}
				onReset={resetFilters}
			/>

			{/* Bulk Actions Bar */}
			{showBulkActions && (
				<div className='bg-blue-500/20 border border-blue-500 rounded-lg p-3 mb-4 flex justify-between items-center'>
					<span>{selectedPayments.size} payments selected</span>
					<div className='space-x-2'>
						<select
							onChange={(e) =>
								handleBulkStatusChange(e.target.value as PaymentStatus)
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
								setSelectedPayments(new Set());
								setShowBulkActions(false);
							}}
							className='bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm'>
							Cancel
						</button>
					</div>
				</div>
			)}

			{/* Payments Table (Desktop) */}
			<div className='hidden lg:block bg-gray-800 rounded-lg overflow-hidden'>
				<table className='w-full'>
					<thead className='bg-gray-700'>
						<tr className='text-left text-sm'>
							<th className='px-4 py-3'>
								<input
									type='checkbox'
									checked={
										selectedPayments.size === filteredPayments.length &&
										filteredPayments.length > 0
									}
									onChange={toggleSelectAll}
									className='w-4 h-4'
								/>
							</th>
							<th className='px-4 py-3'>Payment #</th>
							<th className='px-4 py-3'>Payee</th>
							<th className='px-4 py-3'>Date</th>
							<th className='px-4 py-3'>Category</th>
							<th className='px-4 py-3'>Method</th>
							<th className='px-4 py-3 text-right'>Amount</th>
							<th className='px-4 py-3'>Status</th>
							<th className='px-4 py-3 text-center'>Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredPayments.length === 0 ?
							<tr>
								<td
									colSpan={9}
									className='px-4 py-8 text-center text-gray-400'>
									No payments found. Create a new payment to get started.
								</td>
							</tr>
						:	filteredPayments.map((payment) => (
								<tr
									key={payment.id}
									className='border-t border-gray-700 hover:bg-gray-700/50'>
									<td className='px-4 py-3'>
										<input
											type='checkbox'
											checked={selectedPayments.has(payment.id)}
											onChange={() => toggleSelectPayment(payment.id)}
											className='w-4 h-4'
										/>
									</td>
									<td className='px-4 py-3'>
										<Link
											href={`/transactions/general-payment/${payment.id}`}
											className='text-blue-400 hover:text-blue-300 font-mono text-sm'>
											{payment.paymentNumber || `PAY-${payment.id.slice(0, 8)}`}
										</Link>
									</td>
									<td className='px-4 py-3'>
										<div>
											<p className='font-medium'>{payment.payee}</p>
											{payment.description && (
												<p className='text-xs text-gray-400'>
													{payment.description}
												</p>
											)}
										</div>
									</td>
									<td className='px-4 py-3 text-sm'>
										{formatDate(payment.paymentDate)}
									</td>
									<td className='px-4 py-3 text-sm'>
										{getCategoryLabel(payment.category)}
									</td>
									<td className='px-4 py-3'>
										<span className='text-sm'>
											{getMethodIcon(payment.method)} {payment.method}
										</span>
									</td>
									<td className='px-4 py-3 text-right font-semibold'>
										{formatCurrency(payment.amount, payment.currency)}
									</td>
									<td className='px-4 py-3'>
										{getStatusBadge(payment.status)}
									</td>
									<td className='px-4 py-3 text-center'>
										<div className='flex justify-center space-x-2'>
											{payment.status === 'pending' && (
												<button
													onClick={() => handleProcessPayment(payment)}
													className='text-green-400 hover:text-green-300 text-sm'>
													Process
												</button>
											)}
											<Link
												href={`/transactions/general-payment/${payment.id}/edit`}
												className='text-blue-400 hover:text-blue-300 text-sm'>
												Edit
											</Link>
											<button
												onClick={() => handleDeletePayment(payment.id)}
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

			{/* Payments Cards (Mobile/Tablet) */}
			<div className='lg:hidden'>
				{filteredPayments.length === 0 ?
					<div className='bg-gray-800 rounded-lg p-8 text-center text-gray-400'>
						No payments found. Create a new payment to get started.
					</div>
				:	filteredPayments.map((payment) => (
						<PaymentCard
							key={payment.id}
							payment={payment}
							onStatusChange={handleStatusChange}
							onProcess={handleProcessPayment}
						/>
					))
				}
			</div>

			{/* Process Payment Modal */}
			{showProcessModal && selectedPaymentForProcess && (
				<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
					<div className='bg-gray-800 rounded-lg max-w-md w-full p-6'>
						<h2 className='text-xl font-bold mb-4'>Process Payment</h2>
						<p className='text-sm text-gray-400 mb-4'>
							Payment: {selectedPaymentForProcess.paymentNumber} -{' '}
							{selectedPaymentForProcess.payee}
						</p>
						<p className='text-sm mb-4'>
							Amount:{' '}
							<span className='font-semibold'>
								{formatCurrency(
									selectedPaymentForProcess.amount,
									selectedPaymentForProcess.currency
								)}
							</span>
						</p>

						<div className='space-y-4'>
							<div>
								<label className='block text-sm text-gray-400 mb-1'>
									Processing Date
								</label>
								<input
									type='date'
									value={processDate}
									onChange={(e) => setProcessDate(e.target.value)}
									className='w-full p-2 bg-gray-700 rounded text-white'
								/>
							</div>

							<div>
								<label className='block text-sm text-gray-400 mb-1'>
									Reference / Transaction ID (Optional)
								</label>
								<input
									type='text'
									value={processReference}
									onChange={(e) => setProcessReference(e.target.value)}
									placeholder='Bank reference, transaction ID, etc.'
									className='w-full p-2 bg-gray-700 rounded text-white'
								/>
							</div>
						</div>

						<div className='flex justify-end space-x-3 mt-6'>
							<button
								onClick={() => {
									setShowProcessModal(false);
									setSelectedPaymentForProcess(null);
								}}
								className='px-4 py-2 bg-gray-700 rounded hover:bg-gray-600'>
								Cancel
							</button>
							<button
								onClick={handleSubmitProcess}
								className='px-4 py-2 bg-green-500 rounded hover:bg-green-600'>
								Confirm Process
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

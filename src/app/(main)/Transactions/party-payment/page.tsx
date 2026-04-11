/** @format */
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import {
	PartyPayment,
	PartyPaymentStatus,
	PartyType,
	PaymentDirection,
	PaymentMethod,
	usePartyPaymentStore,
} from '@/store/usePartyPaymentStore';

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

const getStatusColor = (status: PartyPaymentStatus): string => {
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

const getStatusBadge = (status: PartyPaymentStatus) => {
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

const getDirectionBadge = (direction: PaymentDirection) => {
	if (direction === 'incoming') {
		return (
			<span className='px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500'>
				↓ Incoming
			</span>
		);
	} else {
		return (
			<span className='px-2 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500'>
				↑ Outgoing
			</span>
		);
	}
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

interface PartyPaymentFilters {
	search: string;
	status: PartyPaymentStatus | 'all';
	direction: PaymentDirection | 'all';
	partyType: PartyType | 'all';
	method: PaymentMethod | 'all';
	dateFrom: string;
	dateTo: string;
	minAmount: string;
	maxAmount: string;
	partyId: string;
}

const initialFilters: PartyPaymentFilters = {
	search: '',
	status: 'all',
	direction: 'all',
	partyType: 'all',
	method: 'all',
	dateFrom: '',
	dateTo: '',
	minAmount: '',
	maxAmount: '',
	partyId: '',
};

function PartyPaymentFiltersComponent({
	filters,
	onFilterChange,
	onReset,
	parties,
}: {
	filters: PartyPaymentFilters;
	onFilterChange: (filters: PartyPaymentFilters) => void;
	onReset: () => void;
	parties: { id: string; name: string; type: PartyType }[];
}) {
	const [isExpanded, setIsExpanded] = useState(false);

	const handleChange = (key: keyof PartyPaymentFilters, value: string) => {
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
						placeholder='Payment #, party, reference...'
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
								e.target.value as PartyPaymentStatus | 'all'
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

				<div>
					<label className='block text-sm text-gray-400 mb-1'>Direction</label>
					<select
						value={filters.direction}
						onChange={(e) =>
							handleChange(
								'direction',
								e.target.value as PaymentDirection | 'all'
							)
						}
						className='w-full p-2 bg-gray-700 rounded text-white'>
						<option value='all'>All Directions</option>
						<option value='incoming'>Incoming (Received)</option>
						<option value='outgoing'>Outgoing (Sent)</option>
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
   PARTY PAYMENT CARD COMPONENT (Mobile View)
───────────────────────────────────────── */

function PartyPaymentCard({
	payment,
	onStatusChange,
	onProcess,
}: {
	payment: PartyPayment;
	onStatusChange: (id: string, status: PartyPaymentStatus) => void;
	onProcess: (payment: PartyPayment) => void;
}) {
	const [showStatusMenu, setShowStatusMenu] = useState(false);

	const statusOptions: PartyPaymentStatus[] = [
		'draft',
		'pending',
		'processing',
		'completed',
		'failed',
		'cancelled',
		'refunded',
	];

	const isIncoming = payment.direction === 'incoming';

	return (
		<div className='bg-gray-800 rounded-lg p-4 mb-3'>
			<div className='flex justify-between items-start mb-2'>
				<div>
					<Link
						href={`/transactions/party-payment/${payment.id}`}
						className='text-lg font-semibold text-blue-400 hover:text-blue-300'>
						{payment.paymentNumber || `PAY-${payment.id.slice(0, 8)}`}
					</Link>
					<p className='text-sm text-gray-400'>{payment.partyName}</p>
					<p className='text-xs text-gray-500'>
						{getPartyTypeLabel(payment.partyType)}
					</p>
				</div>
				<div className='flex flex-col items-end gap-1'>
					{getDirectionBadge(payment.direction)}
					{getStatusBadge(payment.status)}
				</div>
			</div>

			<div className='grid grid-cols-2 gap-2 mb-3 text-sm'>
				<div>
					<span className='text-gray-400'>Date:</span>
					<span className='ml-2'>{formatDate(payment.paymentDate)}</span>
				</div>
				<div>
					<span className='text-gray-400'>Amount:</span>
					<span
						className={`ml-2 font-semibold ${isIncoming ? 'text-green-400' : 'text-red-400'}`}>
						{isIncoming ? '+' : '-'}
						{formatCurrency(payment.amount, payment.currency)}
					</span>
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
							href={`/transactions/party-payment/${payment.id}/edit`}
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
   MAIN PARTY PAYMENT PAGE
───────────────────────────────────────── */

export default function PartyPaymentPage() {
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
	} = usePartyPaymentStore();

	const [filters, setFilters] = useState<PartyPaymentFilters>(initialFilters);
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
		useState<PartyPayment | null>(null);
	const [processDate, setProcessDate] = useState(
		new Date().toISOString().split('T')[0]
	);
	const [processReference, setProcessReference] = useState('');

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
					payment.partyName.toLowerCase().includes(searchLower) ||
					payment.reference?.toLowerCase().includes(searchLower) ||
					payment.description?.toLowerCase().includes(searchLower)
			);
		}

		// Status filter
		if (filters.status !== 'all') {
			result = result.filter((payment) => payment.status === filters.status);
		}

		// Direction filter
		if (filters.direction !== 'all') {
			result = result.filter(
				(payment) => payment.direction === filters.direction
			);
		}

		// Party type filter
		if (filters.partyType !== 'all') {
			result = result.filter(
				(payment) => payment.partyType === filters.partyType
			);
		}

		// Specific party filter
		if (filters.partyId) {
			result = result.filter((payment) => payment.partyId === filters.partyId);
		}

		// Method filter
		if (filters.method !== 'all') {
			result = result.filter((payment) => payment.method === filters.method);
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

		const incomingPayments = filteredPayments.filter(
			(p) => p.direction === 'incoming'
		);
		const outgoingPayments = filteredPayments.filter(
			(p) => p.direction === 'outgoing'
		);

		const totalIncoming = incomingPayments.reduce(
			(sum, p) => sum + p.amount,
			0
		);
		const totalOutgoing = outgoingPayments.reduce(
			(sum, p) => sum + p.amount,
			0
		);
		const netCashflow = totalIncoming - totalOutgoing;

		const completedPayments = filteredPayments.filter(
			(p) => p.status === 'completed'
		);
		const completedIncoming = completedPayments
			.filter((p) => p.direction === 'incoming')
			.reduce((sum, p) => sum + p.amount, 0);
		const completedOutgoing = completedPayments
			.filter((p) => p.direction === 'outgoing')
			.reduce((sum, p) => sum + p.amount, 0);

		const pendingPayments = filteredPayments.filter(
			(p) => p.status === 'pending' || p.status === 'processing'
		);
		const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

		const partyBreakdown = filteredPayments.reduce(
			(acc, payment) => {
				if (!acc[payment.partyId]) {
					acc[payment.partyId] = {
						name: payment.partyName,
						incoming: 0,
						outgoing: 0,
					};
				}
				if (payment.direction === 'incoming') {
					acc[payment.partyId].incoming += payment.amount;
				} else {
					acc[payment.partyId].outgoing += payment.amount;
				}
				return acc;
			},
			{} as Record<string, { name: string; incoming: number; outgoing: number }>
		);

		return {
			totalPayments,
			totalIncoming,
			totalOutgoing,
			netCashflow,
			completedIncoming,
			completedOutgoing,
			pendingCount: pendingPayments.length,
			pendingAmount,
			partyBreakdown,
		};
	}, [filteredPayments]);

	/* ─────────────────────────────────────────
	   HANDLERS
	───────────────────────────────────────── */

	const handleFilterChange = (newFilters: PartyPaymentFilters) => {
		setFilters(newFilters);
	};

	const resetFilters = () => {
		setFilters(initialFilters);
	};

	const handleStatusChange = async (
		paymentId: string,
		newStatus: PartyPaymentStatus
	) => {
		if (!companyId) return;
		try {
			await updatePaymentStatus(companyId, paymentId, newStatus);
			showToast(`Payment status updated to ${newStatus}`, 'success');
		} catch (err) {
			showToast('Failed to update payment status', 'error');
		}
	};

	const handleBulkStatusChange = async (newStatus: PartyPaymentStatus) => {
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

	const handleProcessPayment = (payment: PartyPayment) => {
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
					<h1 className='text-2xl font-bold'>Party Payments</h1>
					<p className='text-gray-400 text-sm mt-1'>
						Manage payments to and from customers, vendors, and other parties
					</p>
				</div>
				<Link
					href='/transactions/party-payment/new'
					className='bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold transition-colors'>
					+ New Payment
				</Link>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Total Incoming</p>
					<p className='text-2xl font-bold text-green-400'>
						{formatCurrency(stats.totalIncoming)}
					</p>
					<p className='text-xs text-gray-500 mt-1'>
						From{' '}
						{filteredPayments.filter((p) => p.direction === 'incoming').length}{' '}
						transactions
					</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Total Outgoing</p>
					<p className='text-2xl font-bold text-red-400'>
						{formatCurrency(stats.totalOutgoing)}
					</p>
					<p className='text-xs text-gray-500 mt-1'>
						To{' '}
						{filteredPayments.filter((p) => p.direction === 'outgoing').length}{' '}
						transactions
					</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Net Cashflow</p>
					<p
						className={`text-2xl font-bold ${stats.netCashflow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
						{formatCurrency(Math.abs(stats.netCashflow))}
						<span className='text-sm ml-1'>
							{stats.netCashflow >= 0 ? 'inflow' : 'outflow'}
						</span>
					</p>
					<p className='text-xs text-gray-500 mt-1'>
						{stats.totalPayments} total transactions
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
			</div>

			{/* Party Summary */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
				<div className='bg-gray-800 rounded-lg p-4'>
					<h3 className='text-sm font-semibold mb-3'>Top Payers (Incoming)</h3>
					<div className='space-y-2'>
						{Object.entries(stats.partyBreakdown)
							.sort((a, b) => b[1].incoming - a[1].incoming)
							.slice(0, 5)
							.map(([id, data]) => (
								<div
									key={id}
									className='flex justify-between text-sm'>
									<span>{data.name}</span>
									<span className='text-green-400'>
										{formatCurrency(data.incoming)}
									</span>
								</div>
							))}
					</div>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<h3 className='text-sm font-semibold mb-3'>Top Payees (Outgoing)</h3>
					<div className='space-y-2'>
						{Object.entries(stats.partyBreakdown)
							.sort((a, b) => b[1].outgoing - a[1].outgoing)
							.slice(0, 5)
							.map(([id, data]) => (
								<div
									key={id}
									className='flex justify-between text-sm'>
									<span>{data.name}</span>
									<span className='text-red-400'>
										{formatCurrency(data.outgoing)}
									</span>
								</div>
							))}
					</div>
				</div>
			</div>

			{/* Filters */}
			<PartyPaymentFiltersComponent
				filters={filters}
				onFilterChange={handleFilterChange}
				onReset={resetFilters}
				parties={parties}
			/>

			{/* Bulk Actions Bar */}
			{showBulkActions && (
				<div className='bg-blue-500/20 border border-blue-500 rounded-lg p-3 mb-4 flex justify-between items-center'>
					<span>{selectedPayments.size} payments selected</span>
					<div className='space-x-2'>
						<select
							onChange={(e) =>
								handleBulkStatusChange(e.target.value as PartyPaymentStatus)
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
							<th className='px-4 py-3'>Party</th>
							<th className='px-4 py-3'>Date</th>
							<th className='px-4 py-3'>Direction</th>
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
											href={`/transactions/party-payment/${payment.id}`}
											className='text-blue-400 hover:text-blue-300 font-mono text-sm'>
											{payment.paymentNumber || `PAY-${payment.id.slice(0, 8)}`}
										</Link>
									</td>
									<td className='px-4 py-3'>
										<div>
											<p className='font-medium'>{payment.partyName}</p>
											<p className='text-xs text-gray-400'>
												{getPartyTypeLabel(payment.partyType)}
											</p>
										</div>
									</td>
									<td className='px-4 py-3 text-sm'>
										{formatDate(payment.paymentDate)}
									</td>
									<td className='px-4 py-3'>
										{getDirectionBadge(payment.direction)}
									</td>
									<td className='px-4 py-3'>
										<span className='text-sm'>
											{getMethodIcon(payment.method)} {payment.method}
										</span>
									</td>
									<td
										className={`px-4 py-3 text-right font-semibold ${payment.direction === 'incoming' ? 'text-green-400' : 'text-red-400'}`}>
										{payment.direction === 'incoming' ? '+' : '-'}
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
												href={`/transactions/party-payment/${payment.id}/edit`}
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
						<PartyPaymentCard
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
							{selectedPaymentForProcess.partyName}
						</p>
						<p className='text-sm mb-4'>
							Amount:{' '}
							<span
								className={`font-semibold ${selectedPaymentForProcess.direction === 'incoming' ? 'text-green-400' : 'text-red-400'}`}>
								{selectedPaymentForProcess.direction === 'incoming' ? '+' : '-'}
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

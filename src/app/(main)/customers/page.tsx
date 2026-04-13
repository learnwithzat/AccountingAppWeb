/** @format */

// apps/web/src/app/(main)/customers/page.tsx
/** @format */
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
	useCustomerStore,
	Customer,
	CustomerStatus,
	CustomerType,
	CustomerFilters,
} from '@/store/useCustomerStore';

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

const getStatusColor = (status: CustomerStatus): string => {
	const colors = {
		active: 'bg-green-500 text-white',
		inactive: 'bg-gray-600 text-white',
		suspended: 'bg-red-500 text-white',
		pending: 'bg-yellow-500 text-black',
	};
	return colors[status] || colors.pending;
};

const getStatusBadge = (status: CustomerStatus) => {
	const labels = {
		active: 'Active',
		inactive: 'Inactive',
		suspended: 'Suspended',
		pending: 'Pending',
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

const getCustomerTypeLabel = (type: CustomerType): string => {
	const labels = {
		individual: 'Individual',
		business: 'Business',
		non_profit: 'Non-Profit',
		government: 'Government',
	};
	return labels[type] || type;
};

/* ─────────────────────────────────────────
   FILTERS COMPONENT
───────────────────────────────────────── */

interface CustomerFiltersUI {
	search: string;
	status: CustomerStatus | 'all';
	type: CustomerType | 'all';
	location: string;
	minSpent: string;
	maxSpent: string;
}

const initialFiltersUI: CustomerFiltersUI = {
	search: '',
	status: 'all',
	type: 'all',
	location: '',
	minSpent: '',
	maxSpent: '',
};

function CustomerFiltersComponent({
	filters,
	onFilterChange,
	onReset,
}: {
	filters: CustomerFiltersUI;
	onFilterChange: (filters: CustomerFiltersUI) => void;
	onReset: () => void;
}) {
	const [isExpanded, setIsExpanded] = useState(false);

	const handleChange = (key: keyof CustomerFiltersUI, value: string) => {
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
						placeholder='Name, email, phone...'
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
							handleChange('status', e.target.value as CustomerStatus | 'all')
						}
						className='w-full p-2 bg-gray-700 rounded text-white'>
						<option value='all'>All Status</option>
						<option value='active'>Active</option>
						<option value='inactive'>Inactive</option>
						<option value='suspended'>Suspended</option>
						<option value='pending'>Pending</option>
					</select>
				</div>

				{isExpanded && (
					<>
						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								Customer Type
							</label>
							<select
								value={filters.type}
								onChange={(e) =>
									handleChange('type', e.target.value as CustomerType | 'all')
								}
								className='w-full p-2 bg-gray-700 rounded text-white'>
								<option value='all'>All Types</option>
								<option value='individual'>Individual</option>
								<option value='business'>Business</option>
								<option value='non_profit'>Non-Profit</option>
								<option value='government'>Government</option>
							</select>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								Location
							</label>
							<input
								type='text'
								placeholder='City, state, country...'
								value={filters.location}
								onChange={(e) => handleChange('location', e.target.value)}
								className='w-full p-2 bg-gray-700 rounded text-white'
							/>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								Min Lifetime Spent
							</label>
							<input
								type='number'
								placeholder='0.00'
								value={filters.minSpent}
								onChange={(e) => handleChange('minSpent', e.target.value)}
								className='w-full p-2 bg-gray-700 rounded text-white'
							/>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								Max Lifetime Spent
							</label>
							<input
								type='number'
								placeholder='99999.99'
								value={filters.maxSpent}
								onChange={(e) => handleChange('maxSpent', e.target.value)}
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
   CUSTOMER CARD COMPONENT (Mobile View)
───────────────────────────────────────── */

function CustomerCard({ customer }: { customer: Customer }) {
	const router = useRouter();

	return (
		<div className='bg-gray-800 rounded-lg p-4 mb-3'>
			<div className='flex justify-between items-start mb-2'>
				<div>
					<Link
						href={`/customers/${customer.id}`}
						className='text-lg font-semibold text-blue-400 hover:text-blue-300'>
						{customer.name}
					</Link>
					<p className='text-sm text-gray-400'>{customer.email}</p>
				</div>
				{getStatusBadge(customer.status)}
			</div>

			<div className='grid grid-cols-2 gap-2 mb-3 text-sm'>
				<div>
					<span className='text-gray-400'>Phone:</span>
					<span className='ml-2'>{customer.phone || 'N/A'}</span>
				</div>
				<div>
					<span className='text-gray-400'>Type:</span>
					<span className='ml-2'>{getCustomerTypeLabel(customer.type)}</span>
				</div>
				<div>
					<span className='text-gray-400'>Total Spent:</span>
					<span className='ml-2 font-semibold text-green-400'>
						{formatCurrency(customer.lifetimeSpent)}
					</span>
				</div>
				<div>
					<span className='text-gray-400'>Since:</span>
					<span className='ml-2'>{formatDate(customer.createdAt)}</span>
				</div>
			</div>

			<div className='flex justify-end space-x-3 pt-2 border-t border-gray-700'>
				<Link
					href={`/customers/${customer.id}/edit`}
					className='text-sm text-blue-400 hover:text-blue-300'>
					Edit
				</Link>
				<button
					onClick={() =>
						router.push(`/sales/orders/new?customerId=${customer.id}`)
					}
					className='text-sm text-green-400 hover:text-green-300'>
					New Order
				</button>
			</div>
		</div>
	);
}

/* ─────────────────────────────────────────
   MAIN CUSTOMERS PAGE
───────────────────────────────────────── */

export default function CustomersPage() {
	const { user, loading: authLoading } = useAuthStore();
	const companyId = user?.companyId;
	const router = useRouter();

	const {
		customers,
		loading,
		error,
		fetchCustomers,
		deleteCustomer,
		bulkDeleteCustomers,
		clearError,
	} = useCustomerStore();

	const [filters, setFilters] = useState<CustomerFiltersUI>(initialFiltersUI);
	const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(
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
			fetchCustomers(companyId);
		}
	}, [companyId, fetchCustomers]);

	/* ─────────────────────────────────────────
     FILTERING LOGIC
  ───────────────────────────────────────── */

	const filteredCustomers = useMemo(() => {
		let result = [...customers];

		// Search filter
		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			result = result.filter(
				(customer) =>
					customer.name.toLowerCase().includes(searchLower) ||
					customer.email.toLowerCase().includes(searchLower) ||
					customer.phone?.toLowerCase().includes(searchLower) ||
					customer.company?.toLowerCase().includes(searchLower)
			);
		}

		// Status filter
		if (filters.status !== 'all') {
			result = result.filter((customer) => customer.status === filters.status);
		}

		// Type filter
		if (filters.type !== 'all') {
			result = result.filter((customer) => customer.type === filters.type);
		}

		// Location filter
		if (filters.location) {
			const locationLower = filters.location.toLowerCase();
			result = result.filter(
				(customer) =>
					customer.billingCity?.toLowerCase().includes(locationLower) ||
					customer.billingState?.toLowerCase().includes(locationLower) ||
					customer.billingCountry?.toLowerCase().includes(locationLower)
			);
		}

		// Lifetime spent range filter
		if (filters.minSpent) {
			const min = parseFloat(filters.minSpent);
			result = result.filter((customer) => customer.lifetimeSpent >= min);
		}
		if (filters.maxSpent) {
			const max = parseFloat(filters.maxSpent);
			result = result.filter((customer) => customer.lifetimeSpent <= max);
		}

		// Sort by name
		result.sort((a, b) => a.name.localeCompare(b.name));

		return result;
	}, [customers, filters]);

	/* ─────────────────────────────────────────
     STATISTICS
  ───────────────────────────────────────── */

	const stats = useMemo(() => {
		const totalCustomers = filteredCustomers.length;
		const activeCustomers = filteredCustomers.filter(
			(c) => c.status === 'active'
		).length;
		const totalLifetimeValue = filteredCustomers.reduce(
			(sum, c) => sum + c.lifetimeSpent,
			0
		);
		const averageLifetimeValue =
			totalCustomers > 0 ? totalLifetimeValue / totalCustomers : 0;

		const typeBreakdown = filteredCustomers.reduce(
			(acc, customer) => {
				acc[customer.type] = (acc[customer.type] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);

		return {
			totalCustomers,
			activeCustomers,
			totalLifetimeValue,
			averageLifetimeValue,
			typeBreakdown,
		};
	}, [filteredCustomers]);

	/* ─────────────────────────────────────────
     HANDLERS
  ───────────────────────────────────────── */

	const handleFilterChange = (newFilters: CustomerFiltersUI) => {
		setFilters(newFilters);
	};

	const resetFilters = () => {
		setFilters(initialFiltersUI);
	};

	const handleDeleteCustomer = async (customerId: string) => {
		if (
			!confirm(
				'Are you sure you want to delete this customer? This action cannot be undone.'
			)
		) {
			return;
		}
		if (!companyId) return;
		try {
			await deleteCustomer(companyId, customerId);
			showToast('Customer deleted successfully', 'success');
		} catch (err) {
			showToast('Failed to delete customer', 'error');
		}
	};

	const handleBulkDelete = async () => {
		if (
			!confirm(
				`Delete ${selectedCustomers.size} customers? This action cannot be undone.`
			)
		) {
			return;
		}
		if (!companyId) return;
		try {
			await bulkDeleteCustomers(companyId, Array.from(selectedCustomers));
			showToast(`Deleted ${selectedCustomers.size} customers`, 'success');
			setSelectedCustomers(new Set());
			setShowBulkActions(false);
		} catch (err) {
			showToast('Failed to delete some customers', 'error');
		}
	};

	const toggleSelectCustomer = (customerId: string) => {
		const newSelected = new Set(selectedCustomers);
		if (newSelected.has(customerId)) {
			newSelected.delete(customerId);
		} else {
			newSelected.add(customerId);
		}
		setSelectedCustomers(newSelected);
		setShowBulkActions(newSelected.size > 0);
	};

	const toggleSelectAll = () => {
		if (selectedCustomers.size === filteredCustomers.length) {
			setSelectedCustomers(new Set());
			setShowBulkActions(false);
		} else {
			setSelectedCustomers(new Set(filteredCustomers.map((c) => c.id)));
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

	// Clear error when component unmounts
	useEffect(() => {
		return () => {
			clearError();
		};
	}, [clearError]);

	/* ─────────────────────────────────────────
     RENDER STATES
  ───────────────────────────────────────── */

	if (authLoading || loading) {
		return (
			<div className='p-6 text-white bg-[#0C0C0E] min-h-screen'>
				<div className='flex justify-center items-center h-64'>
					<div className='text-center'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
						<p>Loading customers...</p>
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
						onClick={() => companyId && fetchCustomers(companyId)}
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
					<h1 className='text-2xl font-bold'>Customers</h1>
					<p className='text-gray-400 text-sm mt-1'>
						Manage your customer relationships and track their activity
					</p>
				</div>
				<Link
					href='/customers/create'
					className='bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold transition-colors'>
					+ New Customer
				</Link>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Total Customers</p>
					<p className='text-2xl font-bold'>{stats.totalCustomers}</p>
					<p className='text-xs text-gray-500 mt-1'>
						{stats.activeCustomers} active
					</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Total Lifetime Value</p>
					<p className='text-2xl font-bold text-green-400'>
						{formatCurrency(stats.totalLifetimeValue)}
					</p>
					<p className='text-xs text-gray-500 mt-1'>Across all customers</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Average LTV</p>
					<p className='text-2xl font-bold'>
						{formatCurrency(stats.averageLifetimeValue)}
					</p>
					<p className='text-xs text-gray-500 mt-1'>per customer</p>
				</div>
				<div className='bg-gray-800 rounded-lg p-4'>
					<p className='text-gray-400 text-sm'>Customer Types</p>
					<p className='text-2xl font-bold'>
						{stats.typeBreakdown.business || 0}
					</p>
					<p className='text-xs text-gray-500 mt-1'>
						Businesses | {stats.typeBreakdown.individual || 0} Individuals
					</p>
				</div>
			</div>

			{/* Filters */}
			<CustomerFiltersComponent
				filters={filters}
				onFilterChange={handleFilterChange}
				onReset={resetFilters}
			/>

			{/* Bulk Actions Bar */}
			{showBulkActions && (
				<div className='bg-blue-500/20 border border-blue-500 rounded-lg p-3 mb-4 flex justify-between items-center'>
					<span>{selectedCustomers.size} customers selected</span>
					<div className='space-x-2'>
						<button
							onClick={handleBulkDelete}
							className='bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm'>
							Delete
						</button>
						<button
							onClick={() => {
								setSelectedCustomers(new Set());
								setShowBulkActions(false);
							}}
							className='bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm'>
							Cancel
						</button>
					</div>
				</div>
			)}

			{/* Customers Table (Desktop) */}
			<div className='hidden lg:block bg-gray-800 rounded-lg overflow-hidden'>
				<table className='w-full'>
					<thead className='bg-gray-700'>
						<tr className='text-left text-sm'>
							<th className='px-4 py-3'>
								<input
									type='checkbox'
									checked={
										selectedCustomers.size === filteredCustomers.length &&
										filteredCustomers.length > 0
									}
									onChange={toggleSelectAll}
									className='w-4 h-4'
								/>
							</th>
							<th className='px-4 py-3'>Name</th>
							<th className='px-4 py-3'>Contact</th>
							<th className='px-4 py-3'>Type</th>
							<th className='px-4 py-3'>Location</th>
							<th className='px-4 py-3 text-right'>Lifetime Spent</th>
							<th className='px-4 py-3'>Status</th>
							<th className='px-4 py-3 text-center'>Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredCustomers.length === 0 ?
							<tr>
								<td
									colSpan={8}
									className='px-4 py-8 text-center text-gray-400'>
									No customers found. Create your first customer to get started.
								</td>
							</tr>
						:	filteredCustomers.map((customer) => (
								<tr
									key={customer.id}
									className='border-t border-gray-700 hover:bg-gray-700/50'>
									<td className='px-4 py-3'>
										<input
											type='checkbox'
											checked={selectedCustomers.has(customer.id)}
											onChange={() => toggleSelectCustomer(customer.id)}
											className='w-4 h-4'
										/>
									</td>
									<td className='px-4 py-3'>
										<Link
											href={`/customers/${customer.id}`}
											className='font-medium text-blue-400 hover:text-blue-300'>
											{customer.name}
										</Link>
										{customer.company && (
											<p className='text-xs text-gray-400'>
												{customer.company}
											</p>
										)}
									</td>
									<td className='px-4 py-3'>
										<div>
											<p className='text-sm'>{customer.email}</p>
											<p className='text-xs text-gray-400'>
												{customer.phone || 'No phone'}
											</p>
										</div>
									</td>
									<td className='px-4 py-3 text-sm'>
										{getCustomerTypeLabel(customer.type)}
									</td>
									<td className='px-4 py-3 text-sm'>
										{[customer.billingCity, customer.billingState]
											.filter(Boolean)
											.join(', ') || 'N/A'}
									</td>
									<td className='px-4 py-3 text-right font-semibold text-green-400'>
										{formatCurrency(customer.lifetimeSpent)}
									</td>
									<td className='px-4 py-3'>
										{getStatusBadge(customer.status)}
									</td>
									<td className='px-4 py-3 text-center'>
										<div className='flex justify-center space-x-2'>
											<Link
												href={`/customers/${customer.id}/edit`}
												className='text-blue-400 hover:text-blue-300 text-sm'>
												Edit
											</Link>
											<button
												onClick={() =>
													router.push(
														`/sales/orders/new?customerId=${customer.id}`
													)
												}
												className='text-green-400 hover:text-green-300 text-sm'>
												Order
											</button>
											<button
												onClick={() => handleDeleteCustomer(customer.id)}
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

			{/* Customers Cards (Mobile/Tablet) */}
			<div className='lg:hidden'>
				{filteredCustomers.length === 0 ?
					<div className='bg-gray-800 rounded-lg p-8 text-center text-gray-400'>
						No customers found. Create your first customer to get started.
					</div>
				:	filteredCustomers.map((customer) => (
						<CustomerCard
							key={customer.id}
							customer={customer}
						/>
					))
				}
			</div>

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

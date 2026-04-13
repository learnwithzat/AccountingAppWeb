/** @format */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
	useCustomerStore,
	Customer,
	CustomerStatus,
	CustomerType,
} from '@/store/useCustomerStore';

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */

const getStatusColor = (status: CustomerStatus): string => {
	const colors = {
		active: 'bg-green-500',
		inactive: 'bg-gray-500',
		suspended: 'bg-red-500',
		pending: 'bg-yellow-500',
	};
	return colors[status];
};

/* ─────────────────────────────────────────
   MAIN CREATE CUSTOMER PAGE
───────────────────────────────────────── */

export default function CreateCustomerPage() {
	const { user, loading: authLoading } = useAuthStore();
	const companyId = user?.companyId;
	const router = useRouter();
	const { createCustomer, loading, error, clearError } = useCustomerStore();

	const [formData, setFormData] = useState({
		// Basic Information
		name: '',
		company: '',
		email: '',
		phone: '',
		alternativePhone: '',

		// Customer Details
		type: 'individual' as CustomerType,
		status: 'active' as CustomerStatus,
		taxId: '',
		website: '',

		// Billing Address
		billingAddress: '',
		billingCity: '',
		billingState: '',
		billingPostalCode: '',
		billingCountry: '',

		// Shipping Address (same as billing by default)
		shippingSameAsBilling: true,
		shippingAddress: '',
		shippingCity: '',
		shippingState: '',
		shippingPostalCode: '',
		shippingCountry: '',

		// Additional Info
		notes: '',
		tags: '',
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [toast, setToast] = useState({
		show: false,
		message: '',
		type: 'success',
	});

	/* ─────────────────────────────────────────
	   HANDLERS
	───────────────────────────────────────── */

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const { name, value, type } = e.target;
		const checked = (e.target as HTMLInputElement).checked;

		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));

		// Clear error for this field
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: '' }));
		}
	};

	const handleShippingSameAsBilling = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const checked = e.target.checked;
		setFormData((prev) => ({
			...prev,
			shippingSameAsBilling: checked,
			...(checked && {
				shippingAddress: prev.billingAddress,
				shippingCity: prev.billingCity,
				shippingState: prev.billingState,
				shippingPostalCode: prev.billingPostalCode,
				shippingCountry: prev.billingCountry,
			}),
		}));
	};

	const handleBillingAddressChange = () => {
		if (formData.shippingSameAsBilling) {
			setFormData((prev) => ({
				...prev,
				shippingAddress: prev.billingAddress,
				shippingCity: prev.billingCity,
				shippingState: prev.billingState,
				shippingPostalCode: prev.billingPostalCode,
				shippingCountry: prev.billingCountry,
			}));
		}
	};

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = 'Customer name is required';
		}

		if (!formData.email.trim()) {
			newErrors.email = 'Email address is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = 'Invalid email format';
		}

		if (formData.phone && !/^[\d\s\-+()]+$/.test(formData.phone)) {
			newErrors.phone = 'Invalid phone number format';
		}

		if (formData.taxId && formData.taxId.length < 5) {
			newErrors.taxId = 'Tax ID/VAT number is too short';
		}

		if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
			newErrors.website =
				'Invalid website URL (must start with http:// or https://)';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			showToast('Please fix the errors in the form', 'error');
			return;
		}

		if (!companyId) {
			showToast('Company not found', 'error');
			return;
		}

		try {
			// Prepare customer data
			const customerData: Partial<Customer> = {
				name: formData.name,
				company: formData.company || undefined,
				email: formData.email,
				phone: formData.phone || undefined,
				alternativePhone: formData.alternativePhone || undefined,
				type: formData.type,
				status: formData.status,
				taxId: formData.taxId || undefined,
				website: formData.website || undefined,
				billingAddress: formData.billingAddress || undefined,
				billingCity: formData.billingCity || undefined,
				billingState: formData.billingState || undefined,
				billingPostalCode: formData.billingPostalCode || undefined,
				billingCountry: formData.billingCountry || undefined,
				shippingAddress: formData.shippingAddress || undefined,
				shippingCity: formData.shippingCity || undefined,
				shippingState: formData.shippingState || undefined,
				shippingPostalCode: formData.shippingPostalCode || undefined,
				shippingCountry: formData.shippingCountry || undefined,
				notes: formData.notes || undefined,
				tags: formData.tags
					.split(',')
					.map((tag) => tag.trim())
					.filter((tag) => tag),
				companyId,
				lifetimeSpent: 0,
				totalOrders: 0,
			};

			await createCustomer(companyId, customerData);
			showToast('Customer created successfully!', 'success');

			// Redirect after a short delay
			setTimeout(() => {
				router.push('/customers');
			}, 1500);
		} catch (err) {
			showToast('Failed to create customer', 'error');
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

	if (authLoading) {
		return (
			<div className='p-6 text-white bg-[#0C0C0E] min-h-screen'>
				<div className='flex justify-center items-center h-64'>
					<div className='text-center'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
						<p>Loading...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!companyId) {
		return (
			<div className='p-6 text-white bg-[#0C0C0E] min-h-screen'>
				<div className='bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500'>
					<p>No company found. Please contact support.</p>
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
					<h1 className='text-2xl font-bold'>Create New Customer</h1>
					<p className='text-gray-400 text-sm mt-1'>
						Add a new customer to your CRM
					</p>
				</div>
				<button
					onClick={() => router.back()}
					className='bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-semibold transition-colors'>
					Cancel
				</button>
			</div>

			{/* Error Alert */}
			{error && (
				<div className='mb-6 bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-500'>
					<p>{error}</p>
				</div>
			)}

			{/* Form */}
			<form
				onSubmit={handleSubmit}
				className='space-y-6'>
				{/* Basic Information */}
				<div className='bg-gray-800 rounded-lg p-6'>
					<h2 className='text-lg font-semibold mb-4'>Basic Information</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								Customer Name <span className='text-red-400'>*</span>
							</label>
							<input
								type='text'
								name='name'
								value={formData.name}
								onChange={handleChange}
								placeholder='John Doe or Business Name'
								className={`w-full p-2 bg-gray-700 rounded text-white ${errors.name ? 'border border-red-500' : ''}`}
							/>
							{errors.name && (
								<p className='text-xs text-red-400 mt-1'>{errors.name}</p>
							)}
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								Company (Optional)
							</label>
							<input
								type='text'
								name='company'
								value={formData.company}
								onChange={handleChange}
								placeholder='Company name'
								className='w-full p-2 bg-gray-700 rounded text-white'
							/>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								Email Address <span className='text-red-400'>*</span>
							</label>
							<input
								type='email'
								name='email'
								value={formData.email}
								onChange={handleChange}
								placeholder='customer@example.com'
								className={`w-full p-2 bg-gray-700 rounded text-white ${errors.email ? 'border border-red-500' : ''}`}
							/>
							{errors.email && (
								<p className='text-xs text-red-400 mt-1'>{errors.email}</p>
							)}
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								Phone Number
							</label>
							<input
								type='tel'
								name='phone'
								value={formData.phone}
								onChange={handleChange}
								placeholder='+1 234 567 8900'
								className={`w-full p-2 bg-gray-700 rounded text-white ${errors.phone ? 'border border-red-500' : ''}`}
							/>
							{errors.phone && (
								<p className='text-xs text-red-400 mt-1'>{errors.phone}</p>
							)}
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								Alternative Phone
							</label>
							<input
								type='tel'
								name='alternativePhone'
								value={formData.alternativePhone}
								onChange={handleChange}
								placeholder='Alternative contact number'
								className='w-full p-2 bg-gray-700 rounded text-white'
							/>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								Customer Type
							</label>
							<select
								name='type'
								value={formData.type}
								onChange={handleChange}
								className='w-full p-2 bg-gray-700 rounded text-white'>
								<option value='individual'>Individual</option>
								<option value='business'>Business</option>
								<option value='non_profit'>Non-Profit</option>
								<option value='government'>Government</option>
							</select>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>Status</label>
							<select
								name='status'
								value={formData.status}
								onChange={handleChange}
								className='w-full p-2 bg-gray-700 rounded text-white'>
								<option value='active'>Active</option>
								<option value='pending'>Pending</option>
								<option value='inactive'>Inactive</option>
								<option value='suspended'>Suspended</option>
							</select>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								Tax ID / VAT Number
							</label>
							<input
								type='text'
								name='taxId'
								value={formData.taxId}
								onChange={handleChange}
								placeholder='Tax ID or VAT number'
								className={`w-full p-2 bg-gray-700 rounded text-white ${errors.taxId ? 'border border-red-500' : ''}`}
							/>
							{errors.taxId && (
								<p className='text-xs text-red-400 mt-1'>{errors.taxId}</p>
							)}
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								Website
							</label>
							<input
								type='url'
								name='website'
								value={formData.website}
								onChange={handleChange}
								placeholder='https://example.com'
								className={`w-full p-2 bg-gray-700 rounded text-white ${errors.website ? 'border border-red-500' : ''}`}
							/>
							{errors.website && (
								<p className='text-xs text-red-400 mt-1'>{errors.website}</p>
							)}
						</div>
					</div>
				</div>

				{/* Billing Address */}
				<div className='bg-gray-800 rounded-lg p-6'>
					<h2 className='text-lg font-semibold mb-4'>Billing Address</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='md:col-span-2'>
							<label className='block text-sm text-gray-400 mb-1'>
								Street Address
							</label>
							<input
								type='text'
								name='billingAddress'
								value={formData.billingAddress}
								onChange={(e) => {
									handleChange(e);
									handleBillingAddressChange();
								}}
								placeholder='Street address, P.O. Box'
								className='w-full p-2 bg-gray-700 rounded text-white'
							/>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>City</label>
							<input
								type='text'
								name='billingCity'
								value={formData.billingCity}
								onChange={(e) => {
									handleChange(e);
									handleBillingAddressChange();
								}}
								placeholder='City'
								className='w-full p-2 bg-gray-700 rounded text-white'
							/>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								State/Province
							</label>
							<input
								type='text'
								name='billingState'
								value={formData.billingState}
								onChange={(e) => {
									handleChange(e);
									handleBillingAddressChange();
								}}
								placeholder='State or Province'
								className='w-full p-2 bg-gray-700 rounded text-white'
							/>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								Postal Code
							</label>
							<input
								type='text'
								name='billingPostalCode'
								value={formData.billingPostalCode}
								onChange={(e) => {
									handleChange(e);
									handleBillingAddressChange();
								}}
								placeholder='Postal code'
								className='w-full p-2 bg-gray-700 rounded text-white'
							/>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								Country
							</label>
							<input
								type='text'
								name='billingCountry'
								value={formData.billingCountry}
								onChange={(e) => {
									handleChange(e);
									handleBillingAddressChange();
								}}
								placeholder='Country'
								className='w-full p-2 bg-gray-700 rounded text-white'
							/>
						</div>
					</div>
				</div>

				{/* Shipping Address */}
				<div className='bg-gray-800 rounded-lg p-6'>
					<div className='mb-4'>
						<label className='flex items-center space-x-2 cursor-pointer'>
							<input
								type='checkbox'
								name='shippingSameAsBilling'
								checked={formData.shippingSameAsBilling}
								onChange={handleShippingSameAsBilling}
								className='w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500'
							/>
							<span className='text-sm text-gray-300'>
								Same as billing address
							</span>
						</label>
					</div>

					{!formData.shippingSameAsBilling && (
						<div>
							<h2 className='text-lg font-semibold mb-4'>Shipping Address</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='md:col-span-2'>
									<label className='block text-sm text-gray-400 mb-1'>
										Street Address
									</label>
									<input
										type='text'
										name='shippingAddress'
										value={formData.shippingAddress}
										onChange={handleChange}
										placeholder='Street address'
										className='w-full p-2 bg-gray-700 rounded text-white'
									/>
								</div>

								<div>
									<label className='block text-sm text-gray-400 mb-1'>
										City
									</label>
									<input
										type='text'
										name='shippingCity'
										value={formData.shippingCity}
										onChange={handleChange}
										placeholder='City'
										className='w-full p-2 bg-gray-700 rounded text-white'
									/>
								</div>

								<div>
									<label className='block text-sm text-gray-400 mb-1'>
										State/Province
									</label>
									<input
										type='text'
										name='shippingState'
										value={formData.shippingState}
										onChange={handleChange}
										placeholder='State or Province'
										className='w-full p-2 bg-gray-700 rounded text-white'
									/>
								</div>

								<div>
									<label className='block text-sm text-gray-400 mb-1'>
										Postal Code
									</label>
									<input
										type='text'
										name='shippingPostalCode'
										value={formData.shippingPostalCode}
										onChange={handleChange}
										placeholder='Postal code'
										className='w-full p-2 bg-gray-700 rounded text-white'
									/>
								</div>

								<div>
									<label className='block text-sm text-gray-400 mb-1'>
										Country
									</label>
									<input
										type='text'
										name='shippingCountry'
										value={formData.shippingCountry}
										onChange={handleChange}
										placeholder='Country'
										className='w-full p-2 bg-gray-700 rounded text-white'
									/>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Additional Information */}
				<div className='bg-gray-800 rounded-lg p-6'>
					<h2 className='text-lg font-semibold mb-4'>Additional Information</h2>
					<div className='space-y-4'>
						<div>
							<label className='block text-sm text-gray-400 mb-1'>Notes</label>
							<textarea
								name='notes'
								value={formData.notes}
								onChange={handleChange}
								rows={3}
								placeholder='Any additional notes about this customer...'
								className='w-full p-2 bg-gray-700 rounded text-white resize-none'
							/>
						</div>

						<div>
							<label className='block text-sm text-gray-400 mb-1'>
								Tags (comma-separated)
							</label>
							<input
								type='text'
								name='tags'
								value={formData.tags}
								onChange={handleChange}
								placeholder='vip, wholesale, frequent-buyer'
								className='w-full p-2 bg-gray-700 rounded text-white'
							/>
							<p className='text-xs text-gray-500 mt-1'>
								Separate multiple tags with commas
							</p>
						</div>
					</div>
				</div>

				{/* Form Actions */}
				<div className='flex justify-end space-x-3'>
					<button
						type='button'
						onClick={() => router.back()}
						className='px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors font-medium'>
						Cancel
					</button>
					<button
						type='submit'
						disabled={loading}
						className='px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium'>
						{loading ? 'Creating...' : 'Create Customer'}
					</button>
				</div>
			</form>

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

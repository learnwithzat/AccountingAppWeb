/** @format */

'use client';

import { KeyboardEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '@/lib/api';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [form, setForm] = useState({
		companyName: '',
		username: '',
		email: '',
		phoneNumber: '',
		password: '',

		/* ERP */
		country: 'IN',
		currency: 'INR',
		taxSystem: 'GST',
		defaultTaxRate: 18,
		invoicePrefix: 'INV',
	});

	const [touched, setTouched] = useState({
		companyName: false,
		username: false,
		email: false,
		phoneNumber: false,
		password: false,
	});

	const validate = (): string | null => {
		if (!form.companyName.trim()) return 'Company name is required.';
		if (!form.username.trim()) return 'Username is required.';
		if (!form.email.trim()) return 'Email is required.';
		if (!form.phoneNumber.trim()) return 'Phone number is required.';
		if (!form.password) return 'Password is required.';
		return null;
	};

	const handleRegister = async () => {
		const errMsg = validate();
		if (errMsg) {
			setError(errMsg);
			return;
		}

		try {
			setLoading(true);
			setError(null);

			await API.post('/company/register', form);

			router.push('/login');
		} catch (err: any) {
			setError(err?.response?.data?.message ?? 'Registration failed');
		} finally {
			setLoading(false);
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') handleRegister();
	};
	const handleChange = (e: any) => {
		const { name, value } = e.target;

		setForm((prev) => {
			const updated = {
				...prev,
				[name]: value,
			};

			// 🚀 AUTO UPDATE WHEN COUNTRY CHANGES
			if (name === 'country') {
				const config = COUNTRY_CONFIG[value];

				if (config) {
					updated.currency = config.currency;
					updated.taxSystem = config.taxSystem;
					updated.defaultTaxRate = config.defaultTaxRate;
				}
			}

			return updated;
		});
	};
	const getInputClasses = (field: keyof typeof touched) => {
		const hasError = touched[field] && !form[field as keyof typeof form];

		return cn(
			'w-full rounded-md border px-3 py-2.5 text-sm outline-none transition bg-input/50',
			hasError ?
				'border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20'
			:	'border-border focus:border-primary focus:ring-2 focus:ring-ring/20'
		);
	};
	const COUNTRY_CONFIG: Record<
		string,
		{
			currency: string;
			taxSystem: 'GST' | 'VAT' | 'NONE';
			defaultTaxRate: number;
		}
	> = {
		IN: {
			currency: 'INR',
			taxSystem: 'GST',
			defaultTaxRate: 18,
		},
		SA: {
			currency: 'SAR',
			taxSystem: 'VAT',
			defaultTaxRate: 15,
		},
		AE: {
			currency: 'AED',
			taxSystem: 'VAT',
			defaultTaxRate: 5,
		},
		US: {
			currency: 'USD',
			taxSystem: 'NONE',
			defaultTaxRate: 0,
		},
	};
	return (
		<div className='flex min-h-screen items-center justify-center bg-background p-6'>
			<div className='w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm'>
				{/* Logo */}
				<div className='mb-6 flex items-center justify-center gap-2'>
					<span className='h-7 w-7 rounded-md bg-primary' />
					<span className='text-base font-semibold'>ZatGo</span>
				</div>

				{/* Heading */}
				<h1 className='text-xl font-semibold'>Create account</h1>
				<p className='mb-6 text-sm text-muted-foreground'>
					Start your ERP journey in minutes
				</p>

				{/* Error */}
				{error && (
					<div className='mb-5 flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
						<AlertCircle className='mt-0.5 h-4 w-4' />
						{error}
					</div>
				)}

				{/* FORM */}
				<div className='space-y-4'>
					{/* Company */}
					<div>
						<label className='mb-1 block text-xs uppercase text-muted-foreground'>
							Company
						</label>
						<input
							className={getInputClasses('companyName')}
							value={form.companyName}
							onChange={(e) =>
								setForm({ ...form, companyName: e.target.value })
							}
							onBlur={() => setTouched({ ...touched, companyName: true })}
							onKeyDown={handleKeyDown}
							placeholder='Company Name'
						/>
					</div>

					{/* Username */}
					<input
						className={getInputClasses('username')}
						placeholder='Username'
						value={form.username}
						onChange={(e) => setForm({ ...form, username: e.target.value })}
						onBlur={() => setTouched({ ...touched, username: true })}
						onKeyDown={handleKeyDown}
					/>

					{/* Email */}
					<input
						className={getInputClasses('email')}
						placeholder='Email'
						value={form.email}
						onChange={(e) => setForm({ ...form, email: e.target.value })}
						onBlur={() => setTouched({ ...touched, email: true })}
						onKeyDown={handleKeyDown}
					/>

					{/* Phone */}
					<input
						className={getInputClasses('phoneNumber')}
						placeholder='Phone Number'
						value={form.phoneNumber}
						onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
						onBlur={() => setTouched({ ...touched, phoneNumber: true })}
						onKeyDown={handleKeyDown}
					/>

					{/* Password */}
					<input
						type='password'
						className={getInputClasses('password')}
						placeholder='Password'
						value={form.password}
						onChange={(e) => setForm({ ...form, password: e.target.value })}
						onBlur={() => setTouched({ ...touched, password: true })}
						onKeyDown={handleKeyDown}
					/>

					{/* COUNTRY */}
					<select
						name='country'
						value={form.country}
						onChange={handleChange}>
						<option value='IN'>India</option>
						<option value='SA'>Saudi Arabia</option>
						<option value='AE'>UAE</option>
						<option value='US'>USA</option>
					</select>

					{/* TAX */}
					<select
						className='w-full rounded-md border border-border bg-input/50 px-3 py-2.5 text-sm'
						value={form.taxSystem}
						onChange={(e) => setForm({ ...form, taxSystem: e.target.value })}>
						<option value='GST'>GST</option>
						<option value='VAT'>VAT</option>
						<option value='NONE'>No Tax</option>
					</select>

					{/* TAX RATE */}
					<input
						type='number'
						className={getInputClasses('companyName')}
						placeholder='Default Tax Rate'
						value={form.defaultTaxRate}
						onChange={(e) =>
							setForm({ ...form, defaultTaxRate: Number(e.target.value) })
						}
					/>

					{/* CURRENCY */}
					<select
						className='w-full rounded-md border border-border bg-input/50 px-3 py-2.5 text-sm'
						value={form.currency}
						onChange={(e) => setForm({ ...form, currency: e.target.value })}>
						<option value='INR'>INR</option>
						<option value='SAR'>SAR</option>
						<option value='AED'>AED</option>
						<option value='USD'>USD</option>
					</select>

					{/* BUTTON */}
					<button
						onClick={handleRegister}
						disabled={loading}
						className='flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60'>
						{loading && <Loader2 className='h-4 w-4 animate-spin' />}
						{loading ? 'Creating...' : 'Create account'}
					</button>
				</div>

				{/* LOGIN LINK */}
				<p className='mt-5 text-center text-sm text-muted-foreground'>
					Already have an account?{' '}
					<Link
						href='/login'
						className='font-medium text-primary hover:underline'>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}

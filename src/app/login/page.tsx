/** @format */
'use client';

import { KeyboardEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '@/lib/api';
import { saveToken } from '@/lib/auth';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [form, setForm] = useState({ username: '', password: '' });
	const [touched, setTouched] = useState({ username: false, password: false });

	const validate = (): string | null => {
		if (!form.username.trim()) return 'Username is required.';
		if (!form.password) return 'Password is required.';
		return null;
	};

	const handleLogin = async () => {
		const validationError = validate();
		if (validationError) {
			setError(validationError);
			return;
		}

		try {
			setLoading(true);
			setError(null);
			const res = await API.post('/auth/login', form);
			saveToken(res.data.access_token);
			router.push('/dashboard');
		} catch (err: any) {
			setError(
				err?.response?.data?.message ??
					'Login failed. Please check your credentials.'
			);
		} finally {
			setLoading(false);
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') handleLogin();
	};

	const getInputClasses = (field: 'username' | 'password') => {
		const hasError = touched[field] && !form[field];
		return cn(
			'w-full rounded-md border px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none transition focus:ring-2 bg-input/50',
			hasError ?
				'border-destructive focus:border-destructive focus:ring-destructive/20'
			:	'border-border focus:border-primary focus:ring-ring/20'
		);
	};

	return (
		<div className='flex min-h-screen items-center justify-center bg-background p-6'>
			<div className='w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm'>
				{/* Logo */}
				<div className='mb-7 flex items-center justify-center gap-2'>
					<span className='h-7 w-7 rounded-md bg-primary' />
					<span className='text-base font-semibold tracking-tight text-foreground'>
						ZatGo
					</span>
				</div>

				{/* Heading */}
				<h1 className='mb-1 text-xl font-semibold tracking-tight text-foreground'>
					Sign in
				</h1>
				<p className='mb-6 text-sm text-muted-foreground'>
					Welcome back. Enter your credentials to continue.
				</p>

				{/* Error banner */}
				{error && (
					<div className='mb-5 flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive'>
						<AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
						{error}
					</div>
				)}

				{/* Username */}
				<div className='mb-4'>
					<label
						htmlFor='username'
						className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
						Username
					</label>
					<input
						id='username'
						className={getInputClasses('username')}
						placeholder='your-username'
						autoComplete='username'
						value={form.username}
						onChange={(e) => setForm({ ...form, username: e.target.value })}
						onBlur={() => setTouched((t) => ({ ...t, username: true }))}
						onKeyDown={handleKeyDown}
					/>
				</div>

				{/* Password */}
				<div className='mb-6'>
					<label
						htmlFor='password'
						className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
						Password
					</label>
					<input
						id='password'
						type='password'
						className={getInputClasses('password')}
						placeholder='••••••••'
						autoComplete='current-password'
						value={form.password}
						onChange={(e) => setForm({ ...form, password: e.target.value })}
						onBlur={() => setTouched((t) => ({ ...t, password: true }))}
						onKeyDown={handleKeyDown}
					/>
				</div>

				{/* Submit */}
				<button
					onClick={handleLogin}
					disabled={loading}
					className='flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'>
					{loading && <Loader2 className='h-4 w-4 animate-spin' />}
					{loading ? 'Signing in…' : 'Sign in'}
				</button>

				{/* Register link */}
				<p className='mt-5 text-center text-sm text-muted-foreground'>
					Don't have an account?{' '}
					<Link
						href='/register'
						className='font-medium text-primary hover:underline'>
						Create one
					</Link>
				</p>
			</div>
		</div>
	);
}

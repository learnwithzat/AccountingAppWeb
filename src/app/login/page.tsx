/** @format */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api-client';
import { useTenant } from '@/hooks/use-tenant';
import { useApp } from '@/context/app-context';
import Link from 'next/link';
import { authSchema } from '@/lib/validations';

export default function LoginPage() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();
	const { slug } = useTenant();
	const { login } = useApp();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		const result = authSchema.safeParse({ username, password });
		if (!result.success) {
			const errors: Record<string, string> = {};
			result.error.issues.forEach((issue) => {
				errors[issue.path[0] as string] = issue.message;
			});
			setFieldErrors(errors);
			return;
		}

		setFieldErrors({});
		setIsSubmitting(true);
		setError('');
		try {
			const response = await api.post('/auth/login', { username, password });
			await login(response.data.access_token);
			router.push('/dashboard');
		} catch (err: any) {
			setError(err.response?.data?.message || 'Login failed');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='flex flex-col items-center justify-center min-h-screen p-4'>
			<div className='w-full max-w-md p-8 space-y-4 bg-white rounded shadow-md'>
				<h1 className='text-2xl font-bold text-center'>
					Login to {slug ? slug.toUpperCase() : 'ZatGo'}
				</h1>
				{error && <p className='text-red-500 text-sm text-center'>{error}</p>}
				<form
					onSubmit={handleLogin}
					className='space-y-4'>
					<div>
						<input
							type='text'
							placeholder='Username'
							className={`w-full p-2 border rounded ${fieldErrors.username ? 'border-red-500' : ''}`}
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
						/>
						{fieldErrors.username && (
							<p className='text-red-500 text-xs mt-1'>
								{fieldErrors.username}
							</p>
						)}
					</div>
					<div>
						<input
							type='password'
							placeholder='Password'
							className={`w-full p-2 border rounded ${fieldErrors.password ? 'border-red-500' : ''}`}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
						{fieldErrors.password && (
							<p className='text-red-500 text-xs mt-1'>
								{fieldErrors.password}
							</p>
						)}
					</div>
					<button
						type='submit'
						disabled={isSubmitting}
						className='w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'>
						{isSubmitting ? 'Signing In...' : 'Sign In'}
					</button>
				</form>
				<p className='text-center text-sm text-gray-600'>
					Don't have an account?{' '}
					<Link
						href='/register'
						className='text-blue-600 hover:underline'>
						Register
					</Link>
				</p>
			</div>
		</div>
	);
}

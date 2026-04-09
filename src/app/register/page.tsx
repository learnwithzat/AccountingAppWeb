/** @format */

'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

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
	});

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleRegister = async (e: FormEvent) => {
		e.preventDefault();

		// Basic validation
		if (
			!form.companyName ||
			!form.username ||
			!form.email ||
			!form.phoneNumber ||
			!form.password
		) {
			setError('Please fill all fields');
			return;
		}

		try {
			setLoading(true);
			setError(null);
			await API.post('/company/register', form);
			router.push('/login');
		} catch (err: unknown) {
			const message =
				(err as any)?.response?.data?.message ?? 'Registration failed';
			setError(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex h-screen items-center justify-center'>
			<Card className='w-[380px]'>
				<CardContent className='space-y-4 p-6'>
					<h1 className='text-xl font-bold text-center'>
						Create Company Account
					</h1>

					{error && (
						<div className='flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive'>
							<AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
							{error}
						</div>
					)}

					<form
						onSubmit={handleRegister}
						className='space-y-4'>
						<Input
							name='companyName'
							placeholder='Company Name'
							value={form.companyName}
							onChange={handleChange}
						/>

						<Input
							name='username'
							placeholder='Username'
							value={form.username}
							onChange={handleChange}
						/>

						<Input
							name='email'
							placeholder='Email'
							type='email'
							value={form.email}
							onChange={handleChange}
						/>

						<Input
							name='phoneNumber'
							placeholder='Phone Number'
							value={form.phoneNumber}
							onChange={handleChange}
						/>

						<Input
							name='password'
							type='password'
							placeholder='Password'
							value={form.password}
							onChange={handleChange}
						/>

						<Button
							type='submit'
							disabled={loading}
							className='w-full'>
							{loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
							{loading ? 'Creating...' : 'Register Company'}
						</Button>
					</form>

					<p className='text-sm text-center text-muted-foreground'>
						Already have an account?{' '}
						<Link
							href='/login'
							className='text-primary hover:underline font-medium'>
							Sign in
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

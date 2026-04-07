/** @format */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/api';
import { saveToken } from '@/lib/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function LoginPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({ email: '', password: '' });

	const handleLogin = async () => {
		try {
			setLoading(true);
			const res = await post('/auth/login', form);

			saveToken(res.access_token);
			router.push('/dashboard');
		} catch (err: any) {
			alert(err.message || 'Login failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex h-screen items-center justify-center'>
			<Card className='w-[350px]'>
				<CardContent className='space-y-4 p-6'>
					<h1 className='text-xl font-bold'>Login</h1>

					<Input
						placeholder='Email'
						onChange={(e) => setForm({ ...form, email: e.target.value })}
					/>

					<Input
						type='password'
						placeholder='Password'
						onChange={(e) => setForm({ ...form, password: e.target.value })}
					/>

					<Button
						onClick={handleLogin}
						disabled={loading}
						className='w-full'>
						{loading ? 'Loading...' : 'Login'}
					</Button>

					<p
						className='text-sm cursor-pointer text-center'
						onClick={() => router.push('/register')}>
						Create account
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

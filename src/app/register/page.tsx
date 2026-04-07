/** @format */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { post } from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function RegisterPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({
		name: '',
		email: '',
		password: '',
	});

	const handleRegister = async () => {
		try {
			setLoading(true);
			await post('/auth/register', form);

			alert('Registered successfully');
			router.push('/login');
		} catch (err: any) {
			alert(err.message || 'Register failed');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex h-screen items-center justify-center'>
			<Card className='w-[350px]'>
				<CardContent className='space-y-4 p-6'>
					<h1 className='text-xl font-bold'>Register</h1>

					<Input
						placeholder='Name'
						onChange={(e) => setForm({ ...form, name: e.target.value })}
					/>

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
						onClick={handleRegister}
						disabled={loading}
						className='w-full'>
						{loading ? 'Loading...' : 'Register'}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

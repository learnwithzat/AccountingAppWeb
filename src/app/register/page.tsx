/** @format */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function RegisterPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const [form, setForm] = useState({
		companyName: '',
		username: '',
		email: '',
		phoneNumber: '',
		password: '',
	});

	const handleRegister = async () => {
		// 🔹 Basic validation
		if (
			!form.companyName ||
			!form.username ||
			!form.email ||
			!form.phoneNumber ||
			!form.password
		) {
			alert('Please fill all fields');
			return;
		}

		try {
			setLoading(true);

			await API.post('/company/register', form);

			alert('Company registered successfully');

			router.push('/login');
		} catch (err: any) {
			alert(err?.response?.data?.message || 'Register failed');
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

					<Input
						placeholder='Company Name'
						onChange={(e) => setForm({ ...form, companyName: e.target.value })}
					/>

					<Input
						placeholder='Username'
						onChange={(e) => setForm({ ...form, username: e.target.value })}
					/>

					<Input
						placeholder='Email'
						type='email'
						onChange={(e) => setForm({ ...form, email: e.target.value })}
					/>

					<Input
						placeholder='Phone Number'
						onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
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
						{loading ? 'Creating...' : 'Register Company'}
					</Button>

					<p
						className='text-sm cursor-pointer text-center'
						onClick={() => router.push('/login')}>
						Already have an account?
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

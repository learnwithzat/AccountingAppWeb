/** @format */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, logout } from '@/lib/auth';

import { Button } from '@/components/ui/button';

export default function DashboardPage() {
	const router = useRouter();

	useEffect(() => {
		const token = getToken();
		if (!token) {
			router.push('/login');
		}
	}, []);

	return (
		<div className='p-6'>
			<h1 className='text-2xl font-bold'>Dashboard</h1>

			<Button
				onClick={logout}
				className='mt-4'>
				Logout
			</Button>
		</div>
	);
}

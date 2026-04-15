/** @format */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api-client';
import { useTenant } from '@/hooks/use-tenant';
import { useApp } from '@/context/app-context';

interface User {
	id: string;
	email: string;
	role: string;
}

export default function DashboardPage() {
	const [users, setUsers] = useState<User[]>([]);
	const { user, isLoading } = useApp();
	const { slug } = useTenant();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !user) {
			router.push('/login');
		}
	}, [user, isLoading, router]);

	useEffect(() => {
		if (user) {
			api
				.get('/users')
				.then((res) => setUsers(res.data))
				.catch((err) => console.error('Failed to fetch users', err));
		}
	}, [user]);

	if (isLoading || !user) {
		return <div className='p-8 text-center'>Loading...</div>;
	}

	return (
		<div className='p-8'>
			<h1 className='text-3xl font-bold mb-6'>Dashboard: {slug}</h1>
			<div className='bg-white shadow rounded-lg p-6'>
				<h2 className='text-xl font-semibold mb-4'>Users in this Tenant</h2>
				<ul className='divide-y'>
					{users.map((user) => (
						<li
							key={user.id}
							className='py-3 flex justify-between'>
							<span>{user.email}</span>
							<span className='text-gray-500 uppercase text-xs font-bold bg-gray-100 px-2 py-1 rounded'>
								{user.role}
							</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

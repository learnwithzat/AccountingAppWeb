/** @format */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, logout } from '@/lib/auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardPage() {
	const router = useRouter();

	useEffect(() => {
		const token = getToken();
		if (!token) router.push('/login');
	}, []);

	return (
		<div className='p-6 space-y-6'>
			{/* Header */}
			<div className='flex justify-between items-center'>
				<h1 className='text-3xl font-bold'>Dashboard</h1>
				<Button
					variant='outline'
					onClick={logout}>
					Logout
				</Button>
			</div>

			{/* Stats Cards */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
				<Card>
					<CardHeader>
						<CardTitle>Total Sales</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='text-2xl font-semibold'>$12,450</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>New Users</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='text-2xl font-semibold'>342</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Orders</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='text-2xl font-semibold'>128</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Revenue</CardTitle>
					</CardHeader>
					<CardContent>
						<p className='text-2xl font-semibold'>$8,200</p>
					</CardContent>
				</Card>
			</div>

			{/* Tabs Section */}
			<Tabs
				defaultValue='overview'
				className='space-y-4'>
				<TabsList>
					<TabsTrigger value='overview'>Overview</TabsTrigger>
					<TabsTrigger value='reports'>Reports</TabsTrigger>
					<TabsTrigger value='settings'>Settings</TabsTrigger>
				</TabsList>

				<TabsContent value='overview'>
					<Card>
						<CardHeader>
							<CardTitle>Overview</CardTitle>
						</CardHeader>
						<CardContent>
							<p>Welcome to your dashboard! Track stats, reports, and more.</p>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='reports'>
					<Card>
						<CardHeader>
							<CardTitle>Reports</CardTitle>
						</CardHeader>
						<CardContent>
							<p>Generate sales and user reports here.</p>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='settings'>
					<Card>
						<CardHeader>
							<CardTitle>Settings</CardTitle>
						</CardHeader>
						<CardContent>
							<p>Update your profile and account settings here.</p>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}

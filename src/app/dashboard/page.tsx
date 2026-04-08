/** @format */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, logout } from '@/lib/auth';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { jwtDecode } from 'jwt-decode';

type TokenPayload = {
	username: string;
	companyId: string;
	companyName: string;
};

type CompanyStatus = {
	plan: 'free' | 'basic' | 'pro';
	isSubscribed: boolean;
	isActiveSubscription: boolean;
	trialEnd: string;
};

export default function DashboardPage() {
	const router = useRouter();

	const [user, setUser] = useState({
		username: '',
		companyName: '',
		companyId: '',
	});
	const [companyStatus, setCompanyStatus] = useState<CompanyStatus | null>(
		null
	);
	const [loading, setLoading] = useState(true);

	const fetchCompanyStatus = async (companyId: string, token: string) => {
		try {
			const { data } = await axios.get(`/api/company/${companyId}`, {
				baseURL: process.env.NEXT_PUBLIC_API_URL || '',
				headers: { Authorization: `Bearer ${token}` },
			});
			setCompanyStatus(data);
		} catch (err: any) {
			console.error('Error fetching company status', err);
			if (err.response?.status === 401) logout();
		}
	};

	useEffect(() => {
		const init = async () => {
			const token = getToken();
			if (!token) {
				router.push('/login');
				return;
			}

			try {
				const decoded: TokenPayload = jwtDecode(token);
				setUser({
					username: decoded.username,
					companyName: decoded.companyName,
					companyId: decoded.companyId,
				});

				await fetchCompanyStatus(decoded.companyId, token);

				// Auto refresh subscription every 5 minutes
				const interval = setInterval(() => {
					fetchCompanyStatus(decoded.companyId, token);
				}, 300_000); // 300,000 ms = 5 min

				return () => clearInterval(interval);
			} catch (err) {
				console.error('Invalid token', err);
				logout();
			} finally {
				setLoading(false);
			}
		};

		init();
	}, [router]);

	if (loading) return <p className='p-6'>Loading dashboard...</p>;

	return (
		<div className='p-6 space-y-6'>
			{/* Header */}
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-3xl font-bold'>Dashboard</h1>
					<p className='text-sm text-muted-foreground mt-1'>
						{user.companyName} • {user.username}
					</p>
				</div>
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

				{/* Subscription Card - always visible */}
				<Card>
					<CardHeader>
						<CardTitle>Subscription</CardTitle>
					</CardHeader>
					<CardContent>
						{companyStatus ?
							<>
								<p>Plan: {companyStatus.plan.toUpperCase()}</p>
								<p>
									Status:{' '}
									<span
										className={`font-semibold ${
											companyStatus.isActiveSubscription ? 'text-green-600' : (
												'text-red-600'
											)
										}`}>
										{companyStatus.isActiveSubscription ? 'Active' : 'Inactive'}
									</span>
								</p>
								<p>
									Trial ends:{' '}
									{new Date(companyStatus.trialEnd).toLocaleDateString()}
								</p>
							</>
						:	<p>Loading subscription info...</p>}
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
							<p>
								Welcome {user.username} 👋 to {user.companyName}
							</p>
							{companyStatus && !companyStatus.isActiveSubscription && (
								<p className='text-red-600 mt-2'>
									Your subscription is inactive. Activate now!
								</p>
							)}
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

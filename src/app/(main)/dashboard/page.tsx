/** @format */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
	ResponsiveContainer,
	BarChart,
	Bar,
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
} from 'recharts';

import { TrendingUp, Package, Users, Repeat, DollarSign } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/useDashboardStore';

/* ───────── COMPONENT ───────── */

export default function DashboardPage() {
	const router = useRouter();
	const { user, loading: authLoading, logout } = useAuthStore();
	const {
		summary,
		salesChart,
		purchaseChart,
		loading: dataLoading,
		fetchDashboardData,
	} = useDashboardStore();

	/* ───── LOAD DATA ───── */
	useEffect(() => {
		if (authLoading) return;

		if (!user?.companyId) {
			router.push('/login');
			return;
		}

		fetchDashboardData(user.companyId);
	}, [user?.companyId, authLoading, fetchDashboardData, router]);

	/* ───── LOADING ───── */
	if (authLoading || dataLoading) {
		return (
			<div className='p-10 text-gray-500 bg-white min-h-screen'>
				Loading dashboard...
			</div>
		);
	}

	/* ───── UI ───── */
	return (
		<div className='p-6 space-y-6 max-w-7xl bg-white min-h-screen text-gray-900'>
			{/* HEADER */}
			<div>
				<h1 className='text-2xl font-bold'>Live ERP Dashboard</h1>
				<p className='text-sm text-gray-500'>{user?.companyName}</p>
			</div>

			{/* KPI CARDS */}
			<div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
				<Card
					title='Sales'
					value={summary?.sales}
					icon={TrendingUp}
				/>
				<Card
					title='Purchases'
					value={summary?.purchases}
					icon={Package}
				/>
				<Card
					title='Customers'
					value={summary?.customers}
					icon={Users}
				/>
				<Card
					title='Transactions'
					value={summary?.transactions}
					icon={Repeat}
				/>
				<Card
					title='Profit'
					value={summary?.profit}
					icon={DollarSign}
				/>
			</div>

			{/* SALES CHART */}
			<div className='border rounded-lg p-6 bg-card'>
				<h2 className='mb-4 font-semibold'>Sales Overview</h2>

				<ResponsiveContainer
					width='100%'
					height={300}>
					<BarChart data={salesChart}>
						<CartesianGrid strokeDasharray='3 3' />
						<XAxis dataKey='month' />
						<YAxis />
						<Tooltip />
						<Bar dataKey='sales' />
					</BarChart>
				</ResponsiveContainer>
			</div>

			{/* PURCHASE CHART */}
			<div className='border rounded-lg p-6 bg-card'>
				<h2 className='mb-4 font-semibold'>Purchase Overview</h2>

				<ResponsiveContainer
					width='100%'
					height={300}>
					<LineChart data={purchaseChart}>
						<CartesianGrid strokeDasharray='3 3' />
						<XAxis dataKey='month' />
						<YAxis />
						<Tooltip />
						<Line
							dataKey='purchases'
							stroke='#ef4444'
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>

			{/* LOGOUT */}
			<button
				onClick={logout}
				className='border px-4 py-2 rounded text-red-600'>
				Logout
			</button>
		</div>
	);
}

/* ───────── KPI CARD ───────── */
function Card({
	title,
	value,
	icon: Icon,
}: {
	title: string;
	value: any;
	icon: any;
}) {
	return (
		<div className='border rounded-lg p-4 bg-card'>
			<div className='flex justify-between'>
				<span className='text-xs text-muted-foreground uppercase'>{title}</span>
				<Icon className='h-4 w-4 text-primary' />
			</div>

			<p className='text-xl font-semibold mt-2'>{value}</p>
		</div>
	);
}

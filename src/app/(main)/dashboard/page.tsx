/** @format */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { logout } from '@/lib/auth';

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

/* ───────── TYPES ───────── */

type Summary = {
	sales: number;
	purchases: number;
	customers: number;
	transactions: number;
	profit: number;
};

/* ───────── COMPONENT ───────── */

export default function DashboardPage() {
	const router = useRouter();
	const { companyId, companyName, loading } = useAuth();

	const [summary, setSummary] = useState<Summary | null>(null);
	const [salesChart, setSalesChart] = useState<any[]>([]);
	const [purchaseChart, setPurchaseChart] = useState<any[]>([]);
	const [pageLoading, setPageLoading] = useState(true);

	/* ───── LOAD DATA ───── */
	useEffect(() => {
		if (loading) return;

		if (!companyId) {
			router.push('/login');
			return;
		}

		const loadDashboard = async () => {
			try {
				setPageLoading(true);

				const [summaryRes, salesRes, purchaseRes] = await Promise.all([
					API.get(`/dashboard/summary?companyId=${companyId}`),
					API.get(`/dashboard/sales-chart?companyId=${companyId}`),
					API.get(`/dashboard/purchase-chart?companyId=${companyId}`),
				]);

				setSummary(summaryRes.data);
				setSalesChart(salesRes.data);
				setPurchaseChart(purchaseRes.data);
			} catch (err) {
				console.error('Dashboard load error:', err);
			} finally {
				setPageLoading(false);
			}
		};

		loadDashboard();
	}, [companyId, loading]);

	/* ───── LOADING ───── */
	if (loading || pageLoading) {
		return (
			<div className='p-10 text-muted-foreground'>Loading dashboard...</div>
		);
	}

	/* ───── UI ───── */
	return (
		<div className='p-6 space-y-6 max-w-7xl'>
			{/* HEADER */}
			<div>
				<h1 className='text-2xl font-semibold'>Live ERP Dashboard</h1>
				<p className='text-sm text-muted-foreground'>{companyName}</p>
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

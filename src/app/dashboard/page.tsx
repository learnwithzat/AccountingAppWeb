/** @format */
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, logout } from '@/lib/auth';
import API from '@/lib/api';
import { jwtDecode } from 'jwt-decode';
import {
	TrendingUp,
	Users,
	ShoppingCart,
	DollarSign,
	AlertCircle,
	Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

const STAT_CARDS = [
	{ label: 'Total Sales', value: '$12,450', icon: TrendingUp },
	{ label: 'New Users', value: '342', icon: Users },
	{ label: 'Orders', value: '128', icon: ShoppingCart },
	{ label: 'Revenue', value: '$8,200', icon: DollarSign },
];

const TABS = ['overview', 'reports', 'settings'] as const;
type Tab = (typeof TABS)[number];

const PLAN_BADGE: Record<string, string> = {
	free: 'bg-secondary text-secondary-foreground',
	basic: 'bg-primary/10 text-primary',
	pro: 'bg-accent text-accent-foreground',
};

export default function DashboardPage() {
	const router = useRouter();
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const [user, setUser] = useState<TokenPayload>({
		username: '',
		companyId: '',
		companyName: '',
	});
	const [companyStatus, setCompanyStatus] = useState<CompanyStatus | null>(
		null
	);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<Tab>('overview');

	const fetchCompanyStatus = async (companyId: string) => {
		try {
			const { data } = await API.get<CompanyStatus>(`/company/${companyId}`);
			setCompanyStatus(data);
		} catch (err: any) {
			if (err.response?.status === 401) logout();
		}
	};

	useEffect(() => {
		const token = getToken();
		if (!token) {
			router.push('/login');
			return;
		}

		try {
			const decoded = jwtDecode<TokenPayload>(token);
			setUser({
				username: decoded.username,
				companyName: decoded.companyName,
				companyId: decoded.companyId,
			});

			fetchCompanyStatus(decoded.companyId).finally(() => setLoading(false));

			intervalRef.current = setInterval(
				() => fetchCompanyStatus(decoded.companyId),
				300_000
			);
		} catch {
			logout();
		}

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router]);

	if (loading) {
		return (
			<div className='flex items-center gap-3 p-12 text-sm text-muted-foreground'>
				<Loader2 className='h-4 w-4 animate-spin text-primary' />
				Loading dashboard…
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-7 p-6 md:p-8 max-w-6xl'>
			{/* ── Header ── */}
			<div className='flex items-start justify-between gap-4'>
				<div>
					<h1 className='text-2xl font-semibold tracking-tight text-foreground'>
						Dashboard
					</h1>
					<p className='mt-1 text-sm text-muted-foreground'>
						<span className='font-medium text-foreground/80'>
							{user.companyName}
						</span>
						{' · '}
						{user.username}
					</p>
				</div>
				<button
					onClick={logout}
					className='shrink-0 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground'>
					Sign out
				</button>
			</div>

			{/* ── Subscription alert ── */}
			{companyStatus && !companyStatus.isActiveSubscription && (
				<div className='flex items-center gap-2.5 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive'>
					<AlertCircle className='h-4 w-4 shrink-0' />
					Your subscription is inactive. Upgrade to restore full access.
				</div>
			)}

			{/* ── Stats grid ── */}
			<div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
				{STAT_CARDS.map(({ label, value, icon: Icon }) => (
					<div
						key={label}
						className='rounded-lg border border-border bg-card p-5 shadow-sm transition hover:shadow-md'>
						<div className='mb-3 flex items-center justify-between'>
							<span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
								{label}
							</span>
							<span className='flex h-8 w-8 items-center justify-center rounded-full bg-muted text-primary'>
								<Icon className='h-4 w-4' />
							</span>
						</div>
						<p className='text-2xl font-semibold tracking-tight text-foreground'>
							{value}
						</p>
					</div>
				))}
			</div>

			{/* ── Subscription card ── */}
			<div className='flex flex-wrap items-center gap-6 rounded-lg border border-border bg-card px-6 py-4 shadow-sm'>
				{companyStatus ?
					<>
						<div className='flex flex-col gap-1.5'>
							<span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
								Plan
							</span>
							<span
								className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wide ${PLAN_BADGE[companyStatus.plan]}`}>
								{companyStatus.plan}
							</span>
						</div>

						<div className='h-10 w-px bg-border' />

						<div className='flex flex-col gap-1.5'>
							<span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
								Status
							</span>
							<span
								className={cn(
									'flex items-center gap-1.5 text-sm font-medium',
									companyStatus.isActiveSubscription ? 'text-emerald-600' : (
										'text-destructive'
									)
								)}>
								<span
									className={cn(
										'h-2 w-2 rounded-full',
										companyStatus.isActiveSubscription ? 'bg-emerald-500' : (
											'bg-destructive'
										)
									)}
								/>
								{companyStatus.isActiveSubscription ? 'Active' : 'Inactive'}
							</span>
						</div>

						<div className='h-10 w-px bg-border' />

						<div className='flex flex-col gap-1.5'>
							<span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
								Trial ends
							</span>
							<span className='text-sm font-medium text-foreground/90'>
								{new Date(companyStatus.trialEnd).toLocaleDateString('en-US', {
									month: 'short',
									day: 'numeric',
									year: 'numeric',
								})}
							</span>
						</div>
					</>
				:	<span className='text-sm text-muted-foreground'>
						Loading subscription…
					</span>
				}
			</div>

			{/* ── Tabs ── */}
			<div>
				<div className='flex border-b border-border'>
					{TABS.map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={cn(
								'-mb-px border-b-2 px-5 py-2.5 text-sm font-medium capitalize transition',
								activeTab === tab ?
									'border-primary text-primary'
								:	'border-transparent text-muted-foreground hover:text-foreground'
							)}>
							{tab}
						</button>
					))}
				</div>

				<div className='mt-3 rounded-lg border border-border bg-card p-6 shadow-sm'>
					{activeTab === 'overview' && (
						<>
							<h3 className='mb-2 text-base font-semibold text-foreground'>
								Overview
							</h3>
							<p className='text-sm leading-relaxed text-muted-foreground'>
								Welcome back,{' '}
								<span className='font-semibold text-primary'>
									{user.username}
								</span>
								. You're managing{' '}
								<span className='font-medium text-foreground'>
									{user.companyName}
								</span>
								.
							</p>
						</>
					)}
					{activeTab === 'reports' && (
						<>
							<h3 className='mb-2 text-base font-semibold text-foreground'>
								Reports
							</h3>
							<p className='text-sm text-muted-foreground'>
								Generate and download sales and user reports here.
							</p>
						</>
					)}
					{activeTab === 'settings' && (
						<>
							<h3 className='mb-2 text-base font-semibold text-foreground'>
								Settings
							</h3>
							<p className='text-sm text-muted-foreground'>
								Update your profile and account settings here.
							</p>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

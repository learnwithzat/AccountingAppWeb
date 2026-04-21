/** @format */

'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { StatCard } from '@/components/ui/stat-card';
import {
	BuildingOfficeIcon,
	UserGroupIcon,
	MapPinIcon,
	KeyIcon,
	ClockIcon,
	CreditCardIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
	const { user, permissions } = useAuth();

	const membership = user?.memberships?.find((m: any) => m.isActive);
	const tenant = membership?.tenant;
	const role = membership?.role;

	// safe counts (now backend supports them)
	const companiesCount = tenant?.companies?.length ?? 0;
	const branchesCount = tenant?.branches?.length ?? 0;
	const rolesCount = tenant?.roles?.length ?? 0;

	const subscription = tenant?.subscriptions?.[0];
	const auditLogs = tenant?.auditLogs ?? [];

	return (
		<div className='space-y-6'>
			{/* HEADER */}
			<div className='border-b pb-4'>
				<h1 className='text-3xl font-bold'>Dashboard</h1>
				<div className='text-sm text-gray-500 flex gap-2 items-center'>
					<BuildingOfficeIcon className='h-4 w-4' />
					{tenant?.name} ({tenant?.slug})
				</div>
			</div>

			{/* KPI */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
				<StatCard
					title='Users'
					value={user?.memberships?.length ?? 0}
					icon={UserGroupIcon}
				/>
				<StatCard
					title='Companies'
					value={companiesCount}
					icon={BuildingOfficeIcon}
				/>
				<StatCard
					title='Branches'
					value={branchesCount}
					icon={MapPinIcon}
				/>
				<StatCard
					title='Roles'
					value={rolesCount}
					icon={KeyIcon}
				/>
			</div>

			{/* SUBSCRIPTION + ACCESS */}
			<div className='grid lg:grid-cols-2 gap-6'>
				{/* Subscription */}
				<div className='border rounded-lg p-6'>
					<div className='flex gap-2 items-center border-b pb-3'>
						<CreditCardIcon className='h-5 w-5' />
						<h3 className='font-semibold'>Subscription</h3>
					</div>

					<div className='mt-4 space-y-2'>
						<div>Status: {subscription?.status ?? 'TRIAL'}</div>
						<div>Plan: {subscription?.plan?.name ?? 'No Plan'}</div>
					</div>
				</div>

				{/* Access */}
				<div className='border rounded-lg p-6'>
					<div className='flex gap-2 items-center border-b pb-3'>
						<KeyIcon className='h-5 w-5' />
						<h3 className='font-semibold'>My Access</h3>
					</div>

					<div className='mt-4 space-y-2'>
						<div>Role: {role?.name}</div>
						<div>Type: {role?.type}</div>

						<div className='flex flex-wrap gap-2 mt-2'>
							{permissions.slice(0, 8).map((p) => (
								<span
									key={p}
									className='px-2 py-1 bg-gray-100 text-xs rounded'>
									{p}
								</span>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* ACTIVITY */}
			<div className='border rounded-lg p-6'>
				<div className='flex gap-2 items-center border-b pb-3'>
					<ClockIcon className='h-5 w-5' />
					<h3 className='font-semibold'>Recent Activity</h3>
				</div>

				<div className='mt-4'>
					{auditLogs.length === 0 ?
						<p className='text-gray-400'>No activity</p>
					:	auditLogs.slice(0, 5).map((log: any) => (
							<div
								key={log.id}
								className='py-2 border-b'>
								{log.action} → {log.entity}
							</div>
						))
					}
				</div>
			</div>
		</div>
	);
}

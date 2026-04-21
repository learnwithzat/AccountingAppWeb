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
import { useTranslation } from 'react-i18next';
export default function DashboardPage() {
	const { user, permissions } = useAuth();
	const { t } = useTranslation();

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
				<h1 className='text-3xl font-bold'>{t('dashboard.title')}</h1>
				<div className='text-sm text-gray-500 flex gap-2 items-center'>
					<BuildingOfficeIcon className='h-4 w-4' />
					{tenant?.name} ({tenant?.slug})
				</div>
			</div>

			{/* KPI */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
				<StatCard
					title={t('dashboard.stats.users')}
					value={user?.memberships?.length ?? 0}
					icon={UserGroupIcon}
				/>
				<StatCard
					title={t('dashboard.stats.companies')}
					value={companiesCount}
					icon={BuildingOfficeIcon}
				/>
				<StatCard
					title={t('dashboard.stats.branches')}
					value={branchesCount}
					icon={MapPinIcon}
				/>
				<StatCard
					title={t('dashboard.stats.roles')}
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
						<h3 className='font-semibold'>
							{t('dashboard.sections.subscription')}
						</h3>
					</div>

					<div className='mt-4 space-y-2'>
						<div>
							{t('common.status')}:{' '}
							{subscription?.status ?
								t(`subscription.status.${subscription.status.toLowerCase()}`)
							:	t('subscription.trial')}
						</div>
						<div>
							{t('subscription.plan')}:{' '}
							{subscription?.plan?.name ?? t('subscription.no_plan')}
						</div>
					</div>
				</div>

				{/* Access */}
				<div className='border rounded-lg p-6'>
					<div className='flex gap-2 items-center border-b pb-3'>
						<KeyIcon className='h-5 w-5' />
						<h3 className='font-semibold'>{t('dashboard.sections.access')}</h3>
					</div>

					<div className='mt-4 space-y-2'>
						<div>
							{t('role.label')}: {role?.name}
						</div>
						<div>
							{t('common.type')}: {role?.type}
						</div>

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
					<h3 className='font-semibold'>{t('dashboard.sections.activity')}</h3>
				</div>

				<div className='mt-4'>
					{auditLogs.length === 0 ?
						<p className='text-gray-400'>{t('dashboard.activity.none')}</p>
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

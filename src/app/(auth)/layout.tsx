/** @format */

'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/components/providers/AuthProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export type MenuItem = {
	label: string;
	path: string;
	permission?: string;
};

type MenuBaseItem = Omit<MenuItem, 'label'> & { fallbackLabel?: string };

const BASE_MENU: MenuBaseItem[] = [
	{ path: '/dashboard', fallbackLabel: 'DashBoard' },
	{ path: '/expiremanage', fallbackLabel: 'Expire Manager' },
	{ path: '/tenant', permission: 'tenant.view' },
	{ path: '/user', permission: 'user.view' },
	{ path: '/company', permission: 'company.view' },
	{ path: '/role', permission: 'role.view' },
	{ path: '/plan', permission: 'plan.view' },
	{ path: '/subscription', permission: 'subscription.view' },
	{ path: '/membership', permission: 'membership.view' },
	{ path: '/audit-log', permission: 'audit.view' },
];

/** Derives the i18n key from a route path.
 *  '/audit-log' → 'menu.audit-log'
 *  '/'          → 'menu.dashboard'
 */
function menuKey(path: string): string {
	const segment = path.replace(/^\//, '') || 'dashboard';
	return `menu.${segment}`;
}

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { loading, isAuthenticated, permissions } = useAuth();
	const router = useRouter();
	const { t } = useTranslation();

	// ── Auth guard ────────────────────────────────────────────────────────────
	useEffect(() => {
		if (!loading && !isAuthenticated) {
			router.replace('/login');
		}
	}, [loading, isAuthenticated, router]);

	// ── Build translated menu (re-runs only when locale changes) ─────────────
	const menu = useMemo<MenuItem[]>(
		() =>
			BASE_MENU.map((item) => {
				const key = menuKey(item.path);
				const segment = item.path.replace(/^\//, '') || 'dashboard';

				// Prioritize the custom fallbackLabel, otherwise generate one from the path
				const fallback =
					item.fallbackLabel ||
					segment
						.split('-')
						.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
						.join(' ');

				return { ...item, label: t(key, fallback) };
			}),
		[t]
	);

	// ── Loading state ─────────────────────────────────────────────────────────
	if (loading) {
		return <div className='p-10 text-slate-500'>{t('common.loading')}</div>;
	}

	// ── Block render until auth confirmed ─────────────────────────────────────
	if (!isAuthenticated) return null;

	// ── UI ────────────────────────────────────────────────────────────────────
	return (
		<div className='flex min-h-screen bg-slate-100'>
			<Sidebar
				menu={menu}
				permissions={permissions}
			/>

			<main className='flex flex-1 flex-col gap-5 p-6'>
				<div className='flex justify-end'>
					<LanguageSwitcher />
				</div>

				{children}
			</main>
		</div>
	);
}

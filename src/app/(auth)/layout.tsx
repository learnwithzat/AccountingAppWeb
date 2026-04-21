/** @format */

'use client';

import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const menu = [
	{ name: 'Dashboard', path: '/dashboard', permission: null },
	{
		name: 'Expire Manager',
		path: '/expiremanage',
		permission: null,
	},
	{ name: 'Tenants', path: '/tenant', permission: 'tenant.view' },
	{ name: 'Users', path: '/user', permission: 'user.view' },
	{ name: 'Companies', path: '/company', permission: 'company.view' },
	{ name: 'Roles', path: '/role', permission: 'role.view' },
	{ name: 'Plans', path: '/plan', permission: 'plan.view' },
	{
		name: 'Subscriptions',
		path: '/subscription',
		permission: 'subscription.view',
	},
	{ name: 'Memberships', path: '/membership', permission: 'membership.view' },
	{ name: 'Audit Logs', path: '/audit-log', permission: 'audit.view' },
];

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { loading, isAuthenticated, permissions, logout } = useAuth();
	const router = useRouter();
	const { t } = useTranslation();

	//////////////////////////////////////////////////////
	// REDIRECT IF NOT AUTHENTICATED
	//////////////////////////////////////////////////////
	useEffect(() => {
		if (!loading && !isAuthenticated) {
			router.replace('/login');
		}
	}, [loading, isAuthenticated]);

	//////////////////////////////////////////////////////
	// LOADING STATE
	//////////////////////////////////////////////////////
	if (loading) {
		return <div style={{ padding: 40 }}>{t('common.loading')}</div>;
	}

	if (!isAuthenticated) {
		return null;
	}

	//////////////////////////////////////////////////////
	// UI
	//////////////////////////////////////////////////////
	return (
		<div style={{ display: 'flex', minHeight: '100vh' }}>
			<Sidebar
				menu={menu.map((m) => ({
					...m,
					name: t(`menu.${m.path.replace('/', '') || 'dashboard'}`),
				}))}
				permissions={permissions}
			/>

			<main
				style={{
					flex: 1,
					padding: 24,
					background: '#f1f5f9',
					display: 'flex',
					flexDirection: 'column',
					gap: 20,
				}}>
				<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
					<LanguageSwitcher />
				</div>

				{children}
			</main>
		</div>
	);
}

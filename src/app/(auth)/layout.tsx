/** @format */

'use client';

import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const menu = [
	{ name: 'Dashboard', path: '/dashboard', permission: null },
	{ name: 'Tenants', path: '/tenant', permission: null },
	{ name: 'Users', path: '/user', permission: null },
	{ name: 'Companies', path: '/company', permission: null },
	{ name: 'Roles', path: '/role', permission: null },
	{ name: 'Plans', path: '/plan', permission: null },
	{
		name: 'Subscriptions',
		path: '/subscription',
		permission: null,
	},
	{ name: 'Memberships', path: '/membership', permission: null },
	{ name: 'Audit Logs', path: '/audit-log', permission: null },
];

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { loading, isAuthenticated, permissions, logout } = useAuth();
	const router = useRouter();

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
		return <div style={{ padding: 40 }}>Loading...</div>;
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
				menu={menu}
				permissions={permissions}
				onLogout={logout}
			/>

			<main
				style={{
					flex: 1,
					padding: 24,
					background: '#f1f5f9',
				}}>
				{children}
			</main>
		</div>
	);
}

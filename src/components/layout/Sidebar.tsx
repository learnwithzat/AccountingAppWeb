/** @format */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { useAuth } from '@/components/providers/AuthProvider';

export default function Sidebar({ menu, permissions }: any) {
	const pathname = usePathname();
	const router = useRouter();
	const { user, tenant, role, logout: ctxLogout } = useAuth();

	//////////////////////////////////////////////////////
	// SAFE PERMISSIONS
	//////////////////////////////////////////////////////
	const safePermissions = permissions ?? [];

	//////////////////////////////////////////////////////
	// FILTER MENU
	//////////////////////////////////////////////////////
	const filtered = menu.filter((m: any) =>
		!m.permission ? true : safePermissions.includes(m.permission)
	);

	//////////////////////////////////////////////////////
	// LOGOUT (CLEAN + STATE RESET)
	//////////////////////////////////////////////////////
	const logout = () => {
		AuthService.logout();

		// reset context safely first
		if (ctxLogout) ctxLogout();

		// full reset app
		router.replace('/login');
	};

	//////////////////////////////////////////////////////
	// ACTIVE ROUTE
	//////////////////////////////////////////////////////
	const isActive = (path: string) => {
		if (path === '/') return pathname === '/';
		return pathname.startsWith(path);
	};

	return (
		<aside
			style={{
				width: 260,
				background: '#0f172a',
				color: 'white',
				padding: 20,
				display: 'flex',
				flexDirection: 'column',
			}}>
			{/* HEADER */}
			<div style={{ marginBottom: 20 }}>
				<h2>SaaS ERP</h2>

				{/* TENANT INFO */}
				<div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
					<div>{tenant?.name || 'No Tenant'}</div>
					<div>{role?.name || 'No Role'}</div>
				</div>
			</div>

			{/* NAV */}
			<nav style={{ flex: 1 }}>
				{filtered.map((item: any) => (
					<Link
						key={item.path}
						href={item.path}
						style={{ textDecoration: 'none' }}>
						<div
							style={{
								padding: '10px 12px',
								marginBottom: 6,
								borderRadius: 6,
								cursor: 'pointer',
								background: isActive(item.path) ? '#1e293b' : 'transparent',
								transition: '0.2s',
							}}>
							{item.name}
						</div>
					</Link>
				))}
			</nav>

			{/* FOOTER */}
			<div style={{ marginTop: 10, fontSize: 12, color: '#94a3b8' }}>
				{user?.name}
			</div>

			{/* LOGOUT */}
			<button
				onClick={logout}
				style={{
					marginTop: 10,
					padding: 10,
					background: '#ef4444',
					borderRadius: 6,
					color: 'white',
					border: 'none',
					cursor: 'pointer',
				}}>
				Logout
			</button>
		</aside>
	);
}

/** @format */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { MenuItem } from '@/app/(auth)/layout';

type SidebarProps = {
	menu: MenuItem[];
	permissions?: string[];
};

export default function Sidebar({ menu, permissions = [] }: SidebarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const { user, tenant, role, logout } = useAuth();

	// ── Helpers ──────────────────────────────────────────────────────────────
	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	// ── RBAC filter ───────────────────────────────────────────────────────────
	const filteredMenu = menu.filter(({ permission }) => {
		if (!permission) return true;
		if (permissions.includes('all')) return true;
		return permissions.includes(permission);
	});

	// ── Active-route check (avoids false prefix matches) ─────────────────────
	const isActive = (path: string) =>
		path === '/' ?
			pathname === '/'
		:	pathname === path || pathname.startsWith(path + '/');

	// ── Logout ────────────────────────────────────────────────────────────────
	// Delegates entirely to the auth context so there is a single source of
	// truth; AuthProvider is responsible for clearing tokens/cookies.
	const handleLogout = () => {
		logout?.();
		router.replace('/login');
	};

	// ── UI ────────────────────────────────────────────────────────────────────
	return (
		<aside className='flex w-[260px] flex-col bg-slate-900 p-5 text-white'>
			{/* Header */}
			<div className='mb-5'>
				<h2 className='text-lg font-semibold'>SaaS ERP</h2>

				<div className='mt-2 space-y-0.5 text-xs text-slate-400'>
					<p>{tenant?.name ?? 'No Tenant'}</p>
					<p>{role?.name ?? 'No Role'}</p>
				</div>
			</div>

			{/* Navigation */}
			<nav className='flex-1 space-y-0.5'>
				{filteredMenu.map(({ path, label, icon: Icon }) => (
					<Tooltip key={path}>
						<TooltipTrigger
							render={
								<Link
									href={path}
									className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
										isActive(path) ?
											'bg-slate-700 text-white'
										:	'text-slate-300 hover:bg-slate-800 hover:text-white'
									}`}
								/>
							}>
							{Icon && <Icon className="h-4 w-4 shrink-0 opacity-70" />}
							<span className="truncate">{label}</span>
						</TooltipTrigger>
						<TooltipContent side='right'>{label}</TooltipContent>
					</Tooltip>
				))}
			</nav>

			{/* User info */}
			{user && (
				<div className='mt-4 border-t border-slate-800 pt-4 pb-2'>
					<Tooltip>
						<TooltipTrigger
							render={<div className='flex items-center gap-3 px-1' />}>
							<div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-slate-800'>
								{getInitials(user.name || user.email || 'U')}
							</div>
							<div className='min-w-0 flex-1 overflow-hidden text-left'>
								<p className='truncate text-sm font-medium text-slate-200'>
									{user.name || 'User'}
								</p>
								{user.email && (
									<p className='truncate text-[10px] text-slate-500'>
										{user.email}
									</p>
								)}
							</div>
						</TooltipTrigger>
						<TooltipContent side='right'>Manage Profile</TooltipContent>
					</Tooltip>
				</div>
			)}

			{/* Logout */}
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							variant='ghost'
							size='sm'
							onClick={handleLogout}
							className='mt-3 w-full justify-start text-slate-400 hover:bg-red-500/10 hover:text-red-400'
						/>
					}>
					<LogOut className='mr-2 h-4 w-4' />
					<span>Logout</span>
				</TooltipTrigger>
				<TooltipContent side='right'>Sign out of your account</TooltipContent>
			</Tooltip>
		</aside>
	);
}

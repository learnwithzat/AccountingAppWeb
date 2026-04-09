/** @format */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/lib/auth';
import {
	LayoutDashboard,
	Building2,
	Users,
	Settings,
	LogOut,
	X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
	className?: string;
	onClose?: () => void;
}

const NAV_ITEMS = [
	{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
	{ href: '/companies', label: 'Companies', icon: Building2 },
	{ href: '/users', label: 'Users', icon: Users },
	{ href: '/settings', label: 'Settings', icon: Settings },
] as const;

export default function Sidebar({ className = '', onClose }: SidebarProps) {
	const pathname = usePathname();

	return (
		<aside
			className={cn(
				'flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground',
				className
			)}>
			{/* Header */}
			<div className='flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-4'>
				<div className='flex items-center gap-2'>
					<span className='h-6 w-6 rounded bg-primary' />
					<span className='text-sm font-semibold tracking-tight'>ZatGo</span>
				</div>

				{/* Close button — mobile only */}
				{onClose && (
					<button
						onClick={onClose}
						aria-label='Close sidebar'
						className='flex h-7 w-7 items-center justify-center rounded text-sidebar-foreground/60 transition hover:bg-sidebar-accent hover:text-sidebar-foreground md:hidden'>
						<X className='h-4 w-4' />
					</button>
				)}
			</div>

			{/* Nav */}
			<nav
				className='flex-1 overflow-y-auto px-2 py-3'
				aria-label='Main navigation'>
				{NAV_ITEMS.map(({ href, label, icon: Icon }) => {
					const isActive = pathname === href || pathname.startsWith(href + '/');
					return (
						<Link
							key={href}
							href={href}
							onClick={onClose}
							aria-current={isActive ? 'page' : undefined}
							className={cn(
								'mb-0.5 flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition active:scale-95',
								isActive ?
									'bg-sidebar-primary text-sidebar-primary-foreground'
								:	'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
							)}>
							<Icon className='h-4 w-4 shrink-0' />
							{label}
						</Link>
					);
				})}
			</nav>

			{/* Footer / logout */}
			<div className='shrink-0 border-t border-sidebar-border px-2 py-3'>
				<button
					onClick={logout}
					className='flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10'>
					<LogOut className='h-4 w-4 shrink-0' />
					Sign out
				</button>
			</div>
		</aside>
	);
}

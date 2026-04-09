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
	Book,
	ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface SidebarProps {
	className?: string;
	onClose?: () => void;
}

type SubItem = {
	href: string;
	label: string;
};

type NavItem = {
	label: string;
	icon: any;
	href?: string;
	children?: SubItem[];
};

const NAV_ITEMS: NavItem[] = [
	{
		label: 'Dashboard',
		icon: LayoutDashboard,
		href: '/dashboard',
	},

	// SALES
	{
		label: 'Sales',
		icon: Users,
		children: [
			{ href: '/sales/invoices', label: 'Invoices' },
			{ href: '/sales/orders', label: 'Orders' },
			{ href: '/sales/returns', label: 'Returns' },
		],
	},

	// PURCHASES
	{
		label: 'Purchases',
		icon: Building2,
		children: [
			{ href: '/purchases/bills', label: 'Bills' },
			{ href: '/purchases/orders', label: 'Orders' },
		],
	},

	// ACCOUNTS / TRANSACTIONS ✅ (NEW)
	{
		label: 'Transactions',
		icon: Book,
		children: [
			{ href: '/Transactions/party-payment', label: 'Party Payment' },
			{ href: '/Transactions/party-receipt', label: 'Party Receipt' },
			{ href: '/Transactions/general-payment', label: 'General Payment' },
			{ href: '/Transactions/general-receipt', label: 'General Receipt' },
		],
	},

	// CUSTOMERS
	{
		label: 'Customers',
		icon: Users,
		children: [
			{ href: '/customers/list', label: 'Customer List' },
			{ href: '/customers/groups', label: 'Groups' },
		],
	},

	// REPORTS
	{
		label: 'Reports',
		icon: Book,
		children: [
			{ href: '/reports/sales', label: 'Sales Report' },
			{ href: '/reports/purchase', label: 'Purchase Report' },
		],
	},

	{
		label: 'Settings',
		icon: Settings,
		href: '/settings',
	},
	{
		label: 'Billing',
		icon: Book,
		href: '/billing',
	},
];

export default function Sidebar({ className = '', onClose }: SidebarProps) {
	const pathname = usePathname();
	const [openMenus, setOpenMenus] = useState<string[]>([]);

	// auto-open active parent
	useEffect(() => {
		const activeMenus = NAV_ITEMS.filter((item) =>
			item.children?.some((sub) => pathname.startsWith(sub.href))
		).map((item) => item.label);

		setOpenMenus(activeMenus);
	}, [pathname]);

	const toggleMenu = (label: string) => {
		setOpenMenus((prev) =>
			prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
		);
	};

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

				{onClose && (
					<button
						onClick={onClose}
						className='flex h-7 w-7 items-center justify-center rounded text-sidebar-foreground/60 hover:bg-sidebar-accent md:hidden'>
						<X className='h-4 w-4' />
					</button>
				)}
			</div>

			{/* Nav */}
			<nav className='flex-1 overflow-y-auto px-2 py-3'>
				{NAV_ITEMS.map((item) => {
					const Icon = item.icon;

					// simple link
					if (!item.children) {
						const isActive =
							pathname === item.href || pathname.startsWith(item.href + '/');

						return (
							<Link
								key={item.label}
								href={item.href!}
								onClick={onClose}
								className={cn(
									'mb-1 flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium',
									isActive ?
										'bg-sidebar-primary text-sidebar-primary-foreground'
									:	'text-sidebar-foreground/70 hover:bg-sidebar-accent'
								)}>
								<Icon className='h-4 w-4' />
								{item.label}
							</Link>
						);
					}

					// module with children
					const isOpen = openMenus.includes(item.label);
					const isActive = item.children.some((sub) =>
						pathname.startsWith(sub.href)
					);

					return (
						<div key={item.label}>
							{/* Parent */}
							<button
								onClick={() => toggleMenu(item.label)}
								className={cn(
									'mb-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium',
									isActive ?
										'bg-sidebar-primary text-sidebar-primary-foreground'
									:	'text-sidebar-foreground/70 hover:bg-sidebar-accent'
								)}>
								<span className='flex items-center gap-2.5'>
									<Icon className='h-4 w-4' />
									{item.label}
								</span>
								<ChevronDown
									className={cn(
										'h-4 w-4 transition-transform',
										isOpen && 'rotate-180'
									)}
								/>
							</button>

							{/* Children */}
							{isOpen && (
								<div className='ml-6 space-y-1'>
									{item.children.map((sub) => {
										const active = pathname.startsWith(sub.href);

										return (
											<Link
												key={sub.href}
												href={sub.href}
												onClick={onClose}
												className={cn(
													'block rounded-md px-3 py-1.5 text-sm',
													active ?
														'text-primary font-medium'
													:	'text-sidebar-foreground/60 hover:text-sidebar-foreground'
												)}>
												{sub.label}
											</Link>
										);
									})}
								</div>
							)}
						</div>
					);
				})}
			</nav>

			{/* Footer */}
			<div className='border-t border-sidebar-border px-2 py-3'>
				<button
					onClick={logout}
					className='flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10'>
					<LogOut className='h-4 w-4' />
					Sign out
				</button>
			</div>
		</aside>
	);
}

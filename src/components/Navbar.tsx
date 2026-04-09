/** @format */
'use client';

import Link from 'next/link';
import { Menu, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
	return (
		<header
			className={cn(
				'flex h-14 items-center justify-between border-b border-border bg-card px-4'
			)}>
			{/* Left: hamburger + brand */}
			<div className='flex items-center gap-3'>
				<button
					aria-label='Toggle navigation menu'
					className='flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-accent-foreground md:hidden'>
					<Menu className='h-5 w-5' />
				</button>

				<Link
					href='/dashboard'
					className='flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground'>
					<span className='h-5 w-5 rounded bg-primary' />
					ZatGo
				</Link>
			</div>

			{/* Right: icon buttons */}
			<div className='flex items-center gap-1'>
				<button
					aria-label='Notifications'
					className='flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-accent-foreground'>
					<Bell className='h-4 w-4' />
				</button>
				<button
					aria-label='Profile'
					className='flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-accent-foreground'>
					<User className='h-4 w-4' />
				</button>
			</div>
		</header>
	);
}

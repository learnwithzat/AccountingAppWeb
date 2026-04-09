/** @format */

'use client';

/** @format */

import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export default function MainLayout({ children }: { children: ReactNode }) {
	return (
		<div className='flex min-h-screen'>
			{/* Sidebar */}
			<Sidebar />

			{/* Right Side */}
			<div className='flex flex-col flex-1'>
				{/* Navbar */}
				<Navbar />

				{/* Page Content */}
				<main className='flex-1 p-4 bg-muted/40'>{children}</main>
			</div>
		</div>
	);
}

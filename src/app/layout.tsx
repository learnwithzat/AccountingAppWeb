/** @format */

import type { Metadata } from 'next';
import './globals.css';
import { ReactNode } from 'react';
import { AppProvider } from '@/context/app-context';

export const metadata: Metadata = {
	title: 'Zatgo App',
	description: 'Modern SaaS App',
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang='en'>
			<body className='min-h-screen bg-background antialiased'>
				<AppProvider>{children}</AppProvider>
			</body>
		</html>
	);
}

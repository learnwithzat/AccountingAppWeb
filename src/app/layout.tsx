/** @format */

import './globals.css';
import { ReactNode } from 'react';
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
	title: 'ZatGo App',
	description: 'Multi-tenant SaaS',
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang='en' className={cn("font-sans", inter.variable)}>
			<body className='min-h-screen bg-background text-foreground'>
				{children}
			</body>
		</html>
	);
}

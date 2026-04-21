/** @format */

import { AuthProvider } from '@/components/providers/AuthProvider';
import './globals.css';
import { Inter, IBM_Plex_Sans_Arabic } from 'next/font/google';
import I18nProvider from '@/components/providers/I18nProvider';

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
	subsets: ['arabic'],
	weight: ['300', '400', '500', '600', '700'],
	variable: '--font-arabic',
	display: 'swap',
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			suppressHydrationWarning
			className={`${inter.variable} ${ibmPlexArabic.variable}`}>
			<body
				style={{
					fontFamily: 'var(--font-inter), var(--font-arabic), sans-serif',
					lineHeight: '1.6', // Improved default for Arabic legibility
				}}>
				<AuthProvider><I18nProvider>{children}</I18nProvider></AuthProvider>
			</body>
		</html>
	);
}

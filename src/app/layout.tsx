/** @format */

import { AuthProvider } from '@/components/providers/AuthProvider';
import './globals.css';
import {
	Inter,
	IBM_Plex_Sans_Arabic,
	Noto_Sans_Devanagari,
	Noto_Sans_Malayalam,
	Noto_Nastaliq_Urdu,
} from 'next/font/google';
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

const hindiFont = Noto_Sans_Devanagari({
	subsets: ['devanagari'],
	variable: '--font-hindi',
	display: 'swap',
});

const malayalamFont = Noto_Sans_Malayalam({
	subsets: ['malayalam'],
	variable: '--font-malayalam',
	display: 'swap',
});

const urduFont = Noto_Nastaliq_Urdu({
	weight: ['400', '700'],
	variable: '--font-urdu',
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
			className={`${inter.variable} ${ibmPlexArabic.variable} ${hindiFont.variable} ${malayalamFont.variable} ${urduFont.variable}`}>
			<body
				style={{
					fontFamily:
						'var(--font-inter), var(--font-arabic), var(--font-hindi), var(--font-malayalam), var(--font-urdu), sans-serif',
					lineHeight: '1.6', // Improved default for Arabic legibility
				}}>
				<AuthProvider>
					<I18nProvider>{children}</I18nProvider>
				</AuthProvider>
			</body>
		</html>
	);
}

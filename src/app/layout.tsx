/** @format */

import type { Metadata } from 'next';
import {
	Inter,
	IBM_Plex_Sans_Arabic,
	Noto_Sans_Devanagari,
	Noto_Sans_Malayalam,
	Noto_Nastaliq_Urdu,
} from 'next/font/google';

import { AuthProvider } from '@/components/providers/AuthProvider';
import I18nProvider from '@/components/providers/I18nProvider';
import './globals.css';

// ── Fonts ─────────────────────────────────────────────────────────────────────

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
	display: 'swap',
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
	subsets: ['arabic'],
	weight: ['300', '400', '500', '600', '700'],
	variable: '--font-arabic',
	display: 'swap',
});

const notoDevanagari = Noto_Sans_Devanagari({
	subsets: ['devanagari'],
	variable: '--font-hindi',
	display: 'swap',
});

const notoMalayalam = Noto_Sans_Malayalam({
	subsets: ['malayalam'],
	variable: '--font-malayalam',
	display: 'swap',
});

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
	weight: ['400', '700'],
	variable: '--font-urdu',
	display: 'swap',
});

// Collect all variable class names once so the JSX stays readable.
const fontVariables = [
	inter.variable,
	ibmPlexArabic.variable,
	notoDevanagari.variable,
	notoMalayalam.variable,
	notoNastaliqUrdu.variable,
].join(' ');

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
	title: 'SaaS ERP',
	description: 'Multi-tenant SaaS ERP platform',
};

// ── Layout ────────────────────────────────────────────────────────────────────

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		// lang/dir are set at runtime by LanguageSwitcher; suppress the mismatch
		// warning that arises from SSR defaulting to 'en'/'ltr'.
		<html
			lang='en'
			dir='ltr'
			suppressHydrationWarning
			className={fontVariables}>
			{/*
			 * Font stack: script-specific fonts listed before the Latin fallback so
			 * each script's own font wins over Inter for its Unicode range.
			 * line-height of 1.7 aids legibility for Arabic and Nastaliq scripts.
			 */}
			<body className='font-[var(--font-urdu),var(--font-arabic),var(--font-hindi),var(--font-malayalam),var(--font-inter),sans-serif] leading-[1.7]'>
				<AuthProvider>
					<I18nProvider>{children}</I18nProvider>
				</AuthProvider>
			</body>
		</html>
	);
}

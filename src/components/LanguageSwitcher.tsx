/** @format */

'use client';

import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';

import { Button } from './ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from './ui/dropdown-menu';

// ── Constants ─────────────────────────────────────────────────────────────────

const LANGUAGES = [
	{ code: 'en', label: 'English' },
	{ code: 'ar', label: 'العربية' },
	{ code: 'ml', label: 'മലയാളം' },
	{ code: 'hi', label: 'हिन्दी' },
	{ code: 'ur', label: 'اردو' },
] as const;

type LanguageCode = (typeof LANGUAGES)[number]['code'];

const RTL_CODES = new Set<LanguageCode>(['ar', 'ur']);

// ── Helpers ───────────────────────────────────────────────────────────────────

function isRtlLanguage(lang: string): boolean {
	return [...RTL_CODES].some((code) => lang.startsWith(code));
}

function getLabelForCode(code: string): string {
	return LANGUAGES.find((l) => l.code === code)?.label ?? 'English';
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LanguageSwitcher() {
	const { i18n } = useTranslation();
	const currentLang = i18n.language;

	// Sync <html> attributes whenever the language changes.
	// i18next already persists the selected language via its own storage plugin,
	// so the manual localStorage.setItem is not needed here.
	useEffect(() => {
		document.documentElement.dir = isRtlLanguage(currentLang) ? 'rtl' : 'ltr';
		document.documentElement.lang = currentLang;
	}, [currentLang]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant='outline'
						size='sm'
						className='flex min-w-[120px] items-center gap-2 font-medium'
					/>
				}>
				<Globe className='h-4 w-4' />
				<span>{getLabelForCode(currentLang)}</span>
				<ChevronDown className='h-3 w-3 opacity-50' />
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align='end'
				className='min-w-[120px]'>
				{LANGUAGES.map((lang) => (
					<DropdownMenuItem
						key={lang.code}
						className={`cursor-pointer ${
							currentLang === lang.code ? 'bg-accent font-bold' : ''
						}`}
						onClick={() => i18n.changeLanguage(lang.code)}>
						{lang.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

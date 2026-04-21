/** @format */

'use client';

import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';

const languages = [
	{ code: 'en', label: 'English' },
	{ code: 'ar', label: 'العربية' },
	{ code: 'ml', label: 'മലയാളം' },
	{ code: 'hi', label: 'हिन्दी' },
	{ code: 'ur', label: 'اردو' },
];

export function LanguageSwitcher() {
	const { i18n } = useTranslation();

	// Synchronize HTML dir and lang attributes
	useEffect(() => {
		const rtlLanguages = ['ar', 'ur'];
		const isRtl = rtlLanguages.some((lang) => i18n.language.startsWith(lang));

		document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
		document.documentElement.lang = i18n.language;
		// Save preference to localStorage for persistence
		localStorage.setItem('i18nextLng', i18n.language);
	}, [i18n.language]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Button
					variant='outline'
					size='sm'
					className='flex items-center gap-2 font-medium min-w-[120px]'>
					<Globe className='h-4 w-4' />
					<span>
						{languages.find((l) => l.code === i18n.language)?.label ||
							'English'}
					</span>
					<ChevronDown className='h-3 w-3 opacity-50' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align='end'
				className='min-w-[120px]'>
				{languages.map((lang) => (
					<DropdownMenuItem
						key={lang.code}
						className={`cursor-pointer ${i18n.language === lang.code ? 'bg-accent font-bold' : ''}`}
						onClick={() => i18n.changeLanguage(lang.code)}>
						{lang.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

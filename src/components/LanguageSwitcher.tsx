/** @format */

'use client';

import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { useEffect } from 'react';

export function LanguageSwitcher() {
	const { i18n } = useTranslation();

	const toggleLanguage = () => {
		const newLang = i18n.language === 'en' ? 'ar' : 'en';
		i18n.changeLanguage(newLang);
	};

	// Synchronize HTML dir and lang attributes
	useEffect(() => {
		const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
		document.documentElement.dir = dir;
		document.documentElement.lang = i18n.language;
		// Save preference to localStorage for persistence
		localStorage.setItem('i18nextLng', i18n.language);
	}, [i18n.language]);

	return (
		<Button
			variant='outline'
			onClick={toggleLanguage}
			className='text-sm font-medium min-w-[100px]'>
			{i18n.language === 'en' ? 'العربية' : 'English'}
		</Button>
	);
}

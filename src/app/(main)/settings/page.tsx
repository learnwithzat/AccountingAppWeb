/** @format */

'use client';

import { useState } from 'react';

export default function SettingsPage() {
	// Theme
	const [theme, setTheme] = useState<'light' | 'dark'>('light');

	// Language
	const [language, setLanguage] = useState('en');

	// User Info
	const [user, setUser] = useState({
		name: 'Admin User',
		email: 'admin@zatgo.com',
		phone: '',
	});

	const handleSave = () => {
		console.log({
			theme,
			language,
			user,
		});

		alert('Settings saved successfully');
	};

	return (
		<div className='p-6 space-y-8 max-w-3xl'>
			{/* HEADER */}
			<div>
				<h1 className='text-xl font-semibold'>Settings</h1>
				<p className='text-sm text-gray-500'>
					Manage system preferences and profile
				</p>
			</div>

			{/* THEME */}
			<div className='border rounded-lg p-4 space-y-3'>
				<h2 className='font-medium'>Theme</h2>

				<div className='flex gap-4'>
					<label className='flex items-center gap-2'>
						<input
							type='radio'
							checked={theme === 'light'}
							onChange={() => setTheme('light')}
						/>
						Light
					</label>

					<label className='flex items-center gap-2'>
						<input
							type='radio'
							checked={theme === 'dark'}
							onChange={() => setTheme('dark')}
						/>
						Dark
					</label>
				</div>
			</div>

			{/* LANGUAGE (i18n ready) */}
			<div className='border rounded-lg p-4 space-y-3'>
				<h2 className='font-medium'>Language</h2>

				<select
					className='border p-2 rounded w-full'
					value={language}
					onChange={(e) => setLanguage(e.target.value)}>
					<option value='en'>English</option>
					<option value='ar'>Arabic</option>
					<option value='hi'>Hindi</option>
					<option value='ur'>Urdu</option>
				</select>

				<p className='text-xs text-gray-500'>
					i18n ready (connect next-i18next or next-intl later)
				</p>
			</div>

			{/* USER INFO */}
			<div className='border rounded-lg p-4 space-y-3'>
				<h2 className='font-medium'>User Information</h2>

				<input
					className='border p-2 rounded w-full'
					placeholder='Name'
					value={user.name}
					onChange={(e) => setUser({ ...user, name: e.target.value })}
				/>

				<input
					className='border p-2 rounded w-full'
					placeholder='Email'
					value={user.email}
					onChange={(e) => setUser({ ...user, email: e.target.value })}
				/>

				<input
					className='border p-2 rounded w-full'
					placeholder='Phone'
					value={user.phone}
					onChange={(e) => setUser({ ...user, phone: e.target.value })}
				/>
			</div>

			{/* SAVE BUTTON */}
			<button
				onClick={handleSave}
				className='bg-black text-white px-4 py-2 rounded'>
				Save Settings
			</button>
		</div>
	);
}

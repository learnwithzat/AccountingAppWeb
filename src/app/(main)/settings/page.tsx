/** @format */

'use client';

import { useState } from 'react';

type TabType = 'general' | 'company' | 'tax';

export default function SettingsPage() {
	// Active Tab
	const [activeTab, setActiveTab] = useState<TabType>('general');

	// Theme
	const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

	// Language
	const [language, setLanguage] = useState('en');

	// Company Details
	const [company, setCompany] = useState({
		name: 'Zatgo Technologies',
		email: 'contact@zatgo.com',
		phone: '+1 (555) 123-4567',
		address: '123 Business Ave, Suite 100, San Francisco, CA 94105',
		website: 'https://zatgo.com',
		registrationNumber: 'REG-2024-001',
	});

	// Tax Settings
	const [tax, setTax] = useState({
		defaultTaxRate: 18,
		taxId: 'GST123456789',
		applyTaxOnShipping: true,
		taxInclusivePricing: false,
		taxRegion: 'US-CA',
	});

	const handleSave = () => {
		console.log({
			theme,
			language,
			company,
			tax,
		});

		alert('Settings saved successfully');
	};

	// Language options with native names
	const languageOptions = [
		{ code: 'en', name: 'English', nativeName: 'English' },
		{ code: 'es', name: 'Spanish', nativeName: 'Español' },
		{ code: 'fr', name: 'French', nativeName: 'Français' },
		{ code: 'de', name: 'German', nativeName: 'Deutsch' },
		{ code: 'zh', name: 'Chinese', nativeName: '中文' },
		{ code: 'ja', name: 'Japanese', nativeName: '日本語' },
		{ code: 'ar', name: 'Arabic', nativeName: 'العربية' },
		{ code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
		{ code: 'ur', name: 'Urdu', nativeName: 'اردو' },
	];

	const tabs = [
		{ id: 'general' as TabType, label: 'General', icon: '⚙️' },
		{ id: 'company' as TabType, label: 'Company', icon: '🏢' },
		{ id: 'tax' as TabType, label: 'Tax', icon: '💰' },
	];

	return (
		<div className='p-6 max-w-5xl mx-auto'>
			{/* HEADER */}
			<div className='mb-6'>
				<h1 className='text-2xl font-bold'>Settings</h1>
				<p className='text-sm text-gray-500 dark:text-gray-400'>
					Manage system preferences, company information, and tax configurations
				</p>
			</div>

			{/* TABS */}
			<div className='border-b border-gray-200 dark:border-gray-700 mb-6'>
				<div className='flex gap-2'>
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`
								flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-all
								${
									activeTab === tab.id ?
										'border-b-2 border-blue-600 text-blue-600 dark:text-blue-500 bg-white dark:bg-gray-900'
									:	'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
								}
							`}>
							<span>{tab.icon}</span>
							<span>{tab.label}</span>
						</button>
					))}
				</div>
			</div>

			{/* TAB CONTENT */}
			<div className='space-y-6'>
				{/* GENERAL TAB */}
				{activeTab === 'general' && (
					<div className='space-y-6'>
						{/* THEME */}
						<div className='border rounded-lg p-6 space-y-4 dark:border-gray-700'>
							<div>
								<h2 className='font-semibold text-lg flex items-center gap-2'>
									<span>🎨</span> Theme Preferences
								</h2>
								<p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
									Choose your preferred visual appearance for the application
								</p>
							</div>

							<div className='flex gap-4 flex-wrap'>
								<label className='flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'>
									<input
										type='radio'
										name='theme'
										checked={theme === 'light'}
										onChange={() => setTheme('light')}
										className='cursor-pointer'
									/>
									<span>☀️ Light</span>
								</label>

								<label className='flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'>
									<input
										type='radio'
										name='theme'
										checked={theme === 'dark'}
										onChange={() => setTheme('dark')}
										className='cursor-pointer'
									/>
									<span>🌙 Dark</span>
								</label>

								<label className='flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'>
									<input
										type='radio'
										name='theme'
										checked={theme === 'system'}
										onChange={() => setTheme('system')}
										className='cursor-pointer'
									/>
									<span>💻 System</span>
								</label>
							</div>
						</div>

						{/* LANGUAGE */}
						<div className='border rounded-lg p-6 space-y-4 dark:border-gray-700'>
							<div>
								<h2 className='font-semibold text-lg flex items-center gap-2'>
									<span>🌐</span> Language Settings
								</h2>
								<p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
									Select your preferred language for the interface
								</p>
							</div>

							<select
								className='border p-3 rounded-lg w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								value={language}
								onChange={(e) => setLanguage(e.target.value)}>
								{languageOptions.map((lang) => (
									<option
										key={lang.code}
										value={lang.code}>
										{lang.nativeName} ({lang.name})
									</option>
								))}
							</select>
						</div>
					</div>
				)}

				{/* COMPANY TAB */}
				{activeTab === 'company' && (
					<div className='border rounded-lg p-6 space-y-4 dark:border-gray-700'>
						<div>
							<h2 className='font-semibold text-lg flex items-center gap-2'>
								<span>🏢</span> Company Information
							</h2>
							<p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
								Update your company details and contact information
							</p>
						</div>

						<div className='space-y-4'>
							<div>
								<label className='block text-sm font-medium mb-1'>
									Company Name *
								</label>
								<input
									className='border p-2 rounded-lg w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									placeholder='Enter company name'
									value={company.name}
									onChange={(e) =>
										setCompany({ ...company, name: e.target.value })
									}
								/>
							</div>

							<div>
								<label className='block text-sm font-medium mb-1'>
									Company Email *
								</label>
								<input
									className='border p-2 rounded-lg w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									placeholder='contact@company.com'
									type='email'
									value={company.email}
									onChange={(e) =>
										setCompany({ ...company, email: e.target.value })
									}
								/>
							</div>

							<div>
								<label className='block text-sm font-medium mb-1'>
									Company Phone
								</label>
								<input
									className='border p-2 rounded-lg w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									placeholder='+1 (555) 123-4567'
									value={company.phone}
									onChange={(e) =>
										setCompany({ ...company, phone: e.target.value })
									}
								/>
							</div>

							<div>
								<label className='block text-sm font-medium mb-1'>
									Company Address
								</label>
								<textarea
									className='border p-2 rounded-lg w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									placeholder='Full company address'
									rows={3}
									value={company.address}
									onChange={(e) =>
										setCompany({ ...company, address: e.target.value })
									}
								/>
							</div>

							<div>
								<label className='block text-sm font-medium mb-1'>
									Company Website
								</label>
								<input
									className='border p-2 rounded-lg w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									placeholder='https://yourcompany.com'
									type='url'
									value={company.website}
									onChange={(e) =>
										setCompany({ ...company, website: e.target.value })
									}
								/>
							</div>

							<div>
								<label className='block text-sm font-medium mb-1'>
									Registration Number
								</label>
								<input
									className='border p-2 rounded-lg w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									placeholder='Business registration number'
									value={company.registrationNumber}
									onChange={(e) =>
										setCompany({
											...company,
											registrationNumber: e.target.value,
										})
									}
								/>
							</div>
						</div>
					</div>
				)}

				{/* TAX TAB */}
				{activeTab === 'tax' && (
					<div className='border rounded-lg p-6 space-y-4 dark:border-gray-700'>
						<div>
							<h2 className='font-semibold text-lg flex items-center gap-2'>
								<span>💰</span> Tax Configuration
							</h2>
							<p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
								Configure tax rates and rules for your business operations
							</p>
						</div>

						<div className='space-y-4'>
							<div>
								<label className='block text-sm font-medium mb-1'>
									Default Tax Rate (%) *
								</label>
								<input
									type='number'
									className='border p-2 rounded-lg w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									value={tax.defaultTaxRate}
									onChange={(e) =>
										setTax({
											...tax,
											defaultTaxRate: parseFloat(e.target.value) || 0,
										})
									}
									step='0.1'
									min='0'
									max='100'
								/>
								<p className='text-xs text-gray-500 mt-1'>
									Default tax rate applied to all products
								</p>
							</div>

							<div>
								<label className='block text-sm font-medium mb-1'>
									Tax ID / VAT Number
								</label>
								<input
									className='border p-2 rounded-lg w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									placeholder='GST/VAT number'
									value={tax.taxId}
									onChange={(e) => setTax({ ...tax, taxId: e.target.value })}
								/>
							</div>

							<div>
								<label className='block text-sm font-medium mb-1'>
									Tax Region
								</label>
								<select
									className='border p-2 rounded-lg w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									value={tax.taxRegion}
									onChange={(e) =>
										setTax({ ...tax, taxRegion: e.target.value })
									}>
									<option value='US-CA'>United States - California</option>
									<option value='US-NY'>United States - New York</option>
									<option value='US-TX'>United States - Texas</option>
									<option value='UK'>United Kingdom</option>
									<option value='EU'>European Union</option>
									<option value='AU'>Australia</option>
									<option value='IN'>India</option>
									<option value='CA'>Canada</option>
								</select>
							</div>

							<div className='space-y-3 pt-2'>
								<label className='flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors'>
									<input
										type='checkbox'
										checked={tax.applyTaxOnShipping}
										onChange={(e) =>
											setTax({ ...tax, applyTaxOnShipping: e.target.checked })
										}
										className='cursor-pointer w-4 h-4'
									/>
									<span className='text-sm'>Apply tax on shipping charges</span>
								</label>

								<label className='flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors'>
									<input
										type='checkbox'
										checked={tax.taxInclusivePricing}
										onChange={(e) =>
											setTax({ ...tax, taxInclusivePricing: e.target.checked })
										}
										className='cursor-pointer w-4 h-4'
									/>
									<span className='text-sm'>
										Prices displayed are tax inclusive
									</span>
								</label>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* ACTION BUTTONS */}
			<div className='flex gap-4 mt-8 pt-6 border-t dark:border-gray-700'>
				<button
					onClick={handleSave}
					className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors font-medium'>
					Save All Settings
				</button>

				<button
					onClick={() => {
						setTheme('light');
						setLanguage('en');
						setCompany({
							name: 'Zatgo Technologies',
							email: 'contact@zatgo.com',
							phone: '+1 (555) 123-4567',
							address: '123 Business Ave, Suite 100, San Francisco, CA 94105',
							website: 'https://zatgo.com',
							registrationNumber: 'REG-2024-001',
						});
						setTax({
							defaultTaxRate: 18,
							taxId: 'GST123456789',
							applyTaxOnShipping: true,
							taxInclusivePricing: false,
							taxRegion: 'US-CA',
						});
					}}
					className='border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 px-6 py-2.5 rounded-lg transition-colors font-medium'>
					Reset to Defaults
				</button>
			</div>
		</div>
	);
}

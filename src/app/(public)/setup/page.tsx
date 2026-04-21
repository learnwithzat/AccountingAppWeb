/** @format */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSetup } from '@/hooks/useSetup';
import { TenantService } from '@/services/tenant.service';
import { AuthService } from '@/services/auth.service';
import { useTranslation } from 'react-i18next';
export default function SetupPage() {
	const router = useRouter();
	const { t } = useTranslation();

	const [tenantName, setTenantName] = useState('');
	const [slug, setSlug] = useState('');

	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const { handleSetup } = useSetup();

	const setup = async () => {
		await handleSetup({
			name,
			email,
			username,
			password,
			tenantName,
			slug,
		});
	};
	return (
		<div className='min-h-screen flex items-center justify-center bg-muted/40 p-4'>
			<div className='w-full max-w-3xl space-y-6'>
				<div className='text-center space-y-1'>
					<h1 className='text-3xl font-bold'>{t('setup.title')}</h1>
					<p className='text-muted-foreground'>{t('setup.description')}</p>
				</div>

				{error && (
					<Alert variant='destructive'>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<div className='grid md:grid-cols-2 gap-6'>
					{/* Tenant */}
					<Card>
						<CardHeader>
							<CardTitle>{t('tenant.workspace')}</CardTitle>
						</CardHeader>

						<CardContent className='space-y-4'>
							<div>
								<Label>{t('tenant.name')}</Label>
								<Input
									placeholder='Acme Corp'
									value={tenantName}
									onChange={(e) => setTenantName(e.target.value)}
								/>
							</div>

							<div>
								<Label>{t('tenant.slug')}</Label>
								<Input
									placeholder='acme-corp'
									value={slug}
									onChange={(e) =>
										setSlug(
											e.target.value
												.toLowerCase()
												.replace(/[^a-z0-9-]/g, '')
												.replace(/\s+/g, '-'),
										)
									}
								/>
							</div>
						</CardContent>
					</Card>

					{/* User */}
					<Card>
						<CardHeader>
							<CardTitle>{t('auth.admin_account')}</CardTitle>
						</CardHeader>

						<CardContent className='space-y-4'>
							<div>
								<Label>{t('common.name')}</Label>
								<Input
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</div>

							<div>
								<Label>{t('auth.email')}</Label>
								<Input
									type='email'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>

							<div>
								<Label>{t('auth.username')}</Label>
								<Input
									value={username}
									onChange={(e) => setUsername(e.target.value)}
								/>
							</div>

							<div>
								<Label>{t('auth.password')}</Label>
								<Input
									type='password'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</div>
						</CardContent>
					</Card>
				</div>

				<Button
					className='w-full'
					onClick={setup}
					disabled={loading}>
					{loading ? t('setup.creating') : t('setup.create_button')}
				</Button>
			</div>
		</div>
	);
}

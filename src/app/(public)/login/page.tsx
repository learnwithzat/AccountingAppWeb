/** @format */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
export default function LoginPage() {
	const router = useRouter();
	const { t } = useTranslation();

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	//////////////////////////////////////////////////////
	// LOGIN
	//////////////////////////////////////////////////////
	const login = async () => {
		setError('');

		if (!username || !password) {
			setError(t('auth.error_required'));
			return;
		}

		try {
			setLoading(true);

			await AuthService.login(username, password);

			// full refresh so AuthProvider reloads correctly
			window.location.href = '/dashboard';
		} catch (e: any) {
			setError(e?.response?.data?.message || t('auth.error_invalid'));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex items-center justify-center h-screen bg-muted/40'>
			<div className='absolute top-4 right-4 rtl:right-auto rtl:left-4'>
				<LanguageSwitcher />
			</div>

			<Card className='w-[350px] shadow-xl'>
				<CardHeader>
					<CardTitle className='text-2xl text-center'>
						{t('auth.login')}
					</CardTitle>
				</CardHeader>

				<CardContent className='space-y-4'>
					{error && (
						<Alert variant='destructive'>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<Input
						placeholder={t('auth.username')}
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>

					<Input
						type='password'
						placeholder={t('auth.password')}
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>

					<Button
						className='w-full'
						onClick={login}
						disabled={loading}>
						{loading ? t('auth.signing_in') : t('auth.login_button')}
					</Button>

					{/* 👇 Register link */}
					<p className='text-center text-sm text-muted-foreground'>
						{t('auth.no_account')}{' '}
						<Link
							href='/register'
							className='text-blue-600 hover:underline'>
							{t('auth.create_account')}
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

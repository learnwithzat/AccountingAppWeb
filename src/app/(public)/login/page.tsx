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

export default function LoginPage() {
	const router = useRouter();

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
			setError('Username and password are required');
			return;
		}

		try {
			setLoading(true);

			await AuthService.login(username, password);

			// full refresh so AuthProvider reloads correctly
			window.location.href = '/dashboard';
		} catch (e: any) {
			setError(e?.response?.data?.message || 'Invalid credentials');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex items-center justify-center h-screen bg-muted/40'>
			<Card className='w-[350px] shadow-xl'>
				<CardHeader>
					<CardTitle className='text-2xl text-center'>Login</CardTitle>
				</CardHeader>

				<CardContent className='space-y-4'>
					{error && (
						<Alert variant='destructive'>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<Input
						placeholder='Username'
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>

					<Input
						type='password'
						placeholder='Password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>

					<Button
						className='w-full'
						onClick={login}
						disabled={loading}>
						{loading ? 'Signing in...' : 'Login'}
					</Button>

					{/* 👇 Register link */}
					<p className='text-center text-sm text-muted-foreground'>
						No account?{' '}
						<Link
							href='/register'
							className='text-blue-600 hover:underline'>
							Create account
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

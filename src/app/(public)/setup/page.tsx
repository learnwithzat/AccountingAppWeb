/** @format */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { TenantService } from '@/services/tenant.service';
import { AuthService } from '@/services/auth.service';

export default function SetupPage() {
	const router = useRouter();

	const [tenantName, setTenantName] = useState('');
	const [slug, setSlug] = useState('');

	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const setup = async () => {
		setError('');

		if (!tenantName || !slug || !name || !email || !username || !password) {
			setError('All fields are required');
			return;
		}

		try {
			setLoading(true);

			const res = await AuthService.setup({
				name,
				email,
				username,
				password,
				tenantName,
				slug,
			});

			localStorage.setItem('token', res.access_token);
			localStorage.setItem('tenantId', res.tenant.id);

			router.push('/');
		} catch (err: any) {
			setError(err?.response?.data?.message || 'Setup failed');
		} finally {
			setLoading(false);
		}
	};
	return (
		<div className='min-h-screen flex items-center justify-center bg-muted/40 p-4'>
			<div className='w-full max-w-3xl space-y-6'>
				<div className='text-center space-y-1'>
					<h1 className='text-3xl font-bold'>Create Workspace</h1>
					<p className='text-muted-foreground'>
						Set up your SaaS tenant and admin account
					</p>
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
							<CardTitle>Workspace</CardTitle>
						</CardHeader>

						<CardContent className='space-y-4'>
							<div>
								<Label>Workspace Name</Label>
								<Input
									placeholder='Acme Corp'
									value={tenantName}
									onChange={(e) => setTenantName(e.target.value)}
								/>
							</div>

							<div>
								<Label>Slug</Label>
								<Input
									placeholder='acme-corp'
									value={slug}
									onChange={(e) => setSlug(e.target.value.toLowerCase())}
								/>
							</div>
						</CardContent>
					</Card>

					{/* User */}
					<Card>
						<CardHeader>
							<CardTitle>Admin Account</CardTitle>
						</CardHeader>

						<CardContent className='space-y-4'>
							<div>
								<Label>Name</Label>
								<Input
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</div>

							<div>
								<Label>Email</Label>
								<Input
									type='email'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>

							<div>
								<Label>Username</Label>
								<Input
									value={username}
									onChange={(e) => setUsername(e.target.value)}
								/>
							</div>

							<div>
								<Label>Password</Label>
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
					{loading ? 'Creating Workspace...' : 'Create Workspace'}
				</Button>
			</div>
		</div>
	);
}

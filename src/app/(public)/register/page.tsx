/** @format */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { AuthService } from '@/services/auth.service';
import { useSetup } from '@/hooks/useSetup';

export default function RegisterPage() {
	const router = useRouter();

	//////////////////////////////////////////////////////
	// WORKSPACE (TENANT)
	//////////////////////////////////////////////////////
	const [tenantName, setTenantName] = useState('');
	const [slug, setSlug] = useState('');

	//////////////////////////////////////////////////////
	// ADMIN USER
	//////////////////////////////////////////////////////
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	//////////////////////////////////////////////////////
	// UI STATE
	//////////////////////////////////////////////////////
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const { handleSetup } = useSetup();
	//////////////////////////////////////
	// REGISTER = FULL SETUP FLOW
	//////////////////////////////////////////////////////
	const register = async () => {
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
				<div className='text-center'>
					<h1 className='text-3xl font-bold'>Create Account</h1>
					<p className='text-muted-foreground'>
						Setup your workspace and admin access
					</p>
				</div>

				{error && (
					<Alert variant='destructive'>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<div className='grid md:grid-cols-2 gap-6'>
					{/* TENANT */}
					<Card>
						<CardHeader>
							<CardTitle>Workspace</CardTitle>
						</CardHeader>

						<CardContent className='space-y-4'>
							<div>
								<Label>Workspace Name</Label>
								<Input
									value={tenantName}
									onChange={(e) => setTenantName(e.target.value)}
									placeholder='Acme Corp'
								/>
							</div>

							<div>
								<Label>Slug</Label>
								<Input
									value={slug}
									onChange={(e) =>
										setSlug(
											e.target.value
												.toLowerCase()
												.replace(/[^a-z0-9-]/g, '')
												.replace(/\s+/g, '-')
										)
									}
									placeholder='acme-corp'
								/>
							</div>
						</CardContent>
					</Card>

					{/* USER */}
					<Card>
						<CardHeader>
							<CardTitle>Admin User</CardTitle>
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
					onClick={register}
					disabled={loading}>
					{loading ? 'Creating Account...' : 'Create Account'}
				</Button>
			</div>
		</div>
	);
}
function handleSetup(arg0: { name: string; email: string; username: string; password: string; tenantName: string; slug: string; }) {
	throw new Error('Function not implemented.');
}


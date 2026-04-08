/** @format */

'use client';

import API from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function BillingPage() {
	const handleUpgrade = async () => {
		const res = await API.post('/billing/checkout');
		window.location.href = res.data.url; // redirect to Stripe
	};

	return (
		<div className='flex justify-center items-center h-screen'>
			<Card className='w-[400px]'>
				<CardContent className='p-6 space-y-4'>
					<h1 className='text-xl font-bold text-center'>Upgrade Plan</h1>

					<p className='text-sm text-center text-muted-foreground'>
						Your trial expired. Upgrade to continue using the app.
					</p>

					<Button
						onClick={handleUpgrade}
						className='w-full'>
						Upgrade to Pro
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

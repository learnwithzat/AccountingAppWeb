/** @format */

'use client';

import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';

export default function BillingPage() {
	return (
		<div className='flex flex-col gap-6 p-6'>
			<div>
				<h1 className='text-2xl font-bold tracking-tight'>
					Billing & Subscription
				</h1>
				<p className='text-sm text-muted-foreground'>
					Manage your plan and payment methods.
				</p>
			</div>

			<Card className='max-w-2xl'>
				<CardHeader>
					<CardTitle>Current Plan</CardTitle>
					<CardDescription>You are currently on the Free plan.</CardDescription>
				</CardHeader>
				<CardContent className='flex items-center justify-between'>
					<Button className='gap-2'>Upgrade to Pro</Button>
					<Button
						variant='ghost'
						className='text-muted-foreground'>
						Manage Payment Methods
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

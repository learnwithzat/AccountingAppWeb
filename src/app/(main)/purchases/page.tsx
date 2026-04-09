/** @format */

'use client';

import {
	ShoppingBag,
	Plus,
	CreditCard,
	ArrowDownCircle,
	Search,
	Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const PURCHASE_SUMMARY = [
	{
		label: 'Total Expenses',
		value: '$18,240.50',
		icon: CreditCard,
		color: 'text-red-600',
	},
	{
		label: 'Unpaid Bills',
		value: '$4,120.00',
		icon: Wallet,
		color: 'text-amber-600',
	},
	{
		label: 'Recent Orders',
		value: '8',
		icon: ArrowDownCircle,
		color: 'text-blue-600',
	},
];

export default function PurchasesPage() {
	return (
		<div className='flex flex-col gap-6 p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>Purchases</h1>
					<p className='text-sm text-muted-foreground'>
						Manage your company's expense and purchase records.
					</p>
				</div>
				<Button className='gap-2'>
					<Plus className='h-4 w-4' />
					New Purchase
				</Button>
			</div>

			<Card className='flex min-h-[400px] flex-col items-center justify-center border-dashed text-center'>
				<CardContent className='flex flex-col items-center gap-2 py-10'>
					<div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
						<ShoppingBag className='h-6 w-6 text-muted-foreground' />
					</div>
					<h3 className='text-lg font-semibold'>No purchases found</h3>
					<p className='max-w-xs text-sm text-muted-foreground'>
						You haven't recorded any purchases yet. Click the button above to
						get started.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

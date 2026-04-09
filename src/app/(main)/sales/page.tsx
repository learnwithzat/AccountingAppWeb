/** @format */

'use client';

import { Receipt, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function SalesPage() {
	return (
		<div className='flex flex-col gap-6 p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>Sales</h1>
					<p className='text-sm text-muted-foreground'>
						Track your invoices and sales revenue.
					</p>
				</div>
				<Button className='gap-2'>
					<Plus className='h-4 w-4' />
					Create Invoice
				</Button>
			</div>

			<Card className='flex min-h-[400px] flex-col items-center justify-center border-dashed text-center'>
				<CardContent className='flex flex-col items-center gap-2 py-10'>
					<div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
						<Receipt className='h-6 w-6 text-muted-foreground' />
					</div>
					<h3 className='text-lg font-semibold'>No sales recorded</h3>
					<p className='max-w-xs text-sm text-muted-foreground'>
						Start generating revenue by creating your first customer invoice.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

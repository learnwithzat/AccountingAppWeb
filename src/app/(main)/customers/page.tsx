/** @format */

'use client';

import { Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function CustomersPage() {
	return (
		<div className='flex flex-col gap-6 p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>Customers</h1>
					<p className='text-sm text-muted-foreground'>
						Maintain your directory of clients and contacts.
					</p>
				</div>
				<Button className='gap-2'>
					<UserPlus className='h-4 w-4' />
					Add Customer
				</Button>
			</div>

			<Card className='flex min-h-[400px] flex-col items-center justify-center border-dashed text-center'>
				<CardContent className='flex flex-col items-center gap-2 py-10'>
					<div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
						<Users className='h-6 w-6 text-muted-foreground' />
					</div>
					<h3 className='text-lg font-semibold'>No customers yet</h3>
					<p className='max-w-xs text-sm text-muted-foreground'>
						Import your contact list or add your first customer manually.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

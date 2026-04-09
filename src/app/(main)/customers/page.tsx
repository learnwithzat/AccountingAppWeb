/** @format */

'use client';

import {
	Users,
	UserPlus,
	Search,
	Mail,
	Phone,
	MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

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

			<div className='flex items-center gap-4'>
				<div className='relative flex-1 max-w-sm'>
					<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
					<Input
						placeholder='Search customers by name, email...'
						className='pl-9'
					/>
				</div>
			</div>

			<Card>
				<CardContent className='p-0'>
					<div className='w-full overflow-auto'>
						<table className='w-full text-sm'>
							<thead className='bg-muted/50 border-b'>
								<tr className='text-left font-medium text-muted-foreground'>
									<th className='p-4'>Name</th>
									<th className='p-4'>Contact</th>
									<th className='p-4'>Last Activity</th>
									<th className='p-4'>Balance</th>
									<th className='p-4'></th>
								</tr>
							</thead>
							<tbody>
								<tr className='border-b'>
									<td
										colSpan={5}
										className='p-16 text-center'>
										<div className='flex flex-col items-center gap-3'>
											<div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
												<Users className='h-6 w-6 text-muted-foreground' />
											</div>
											<div className='space-y-1'>
												<h3 className='font-semibold'>No customers yet</h3>
												<p className='text-sm text-muted-foreground'>
													Your customer directory will appear here.
												</p>
											</div>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

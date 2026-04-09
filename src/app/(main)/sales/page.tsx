/** @format */

'use client';

import {
	Receipt,
	Plus,
	Search,
	Filter,
	TrendingUp,
	Clock,
	CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const SALES_STATS = [
	{
		label: 'Total Revenue',
		value: '$45,231.89',
		icon: TrendingUp,
		color: 'text-emerald-600',
	},
	{
		label: 'Pending Invoices',
		value: '12',
		icon: Clock,
		color: 'text-amber-600',
	},
	{
		label: 'Paid This Month',
		value: '24',
		icon: CheckCircle2,
		color: 'text-blue-600',
	},
];

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

			{/* Stats Grid */}
			<div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
				{SALES_STATS.map((stat) => (
					<Card key={stat.label}>
						<CardContent className='flex items-center gap-4 p-6'>
							<div className={`rounded-full bg-muted p-2 ${stat.color}`}>
								<stat.icon className='h-5 w-5' />
							</div>
							<div>
								<p className='text-sm font-medium text-muted-foreground'>
									{stat.label}
								</p>
								<h3 className='text-2xl font-bold'>{stat.value}</h3>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Table Header / Actions */}
			<div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
				<div className='relative flex-1 max-w-sm'>
					<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
					<Input
						placeholder='Search invoices...'
						className='pl-9'
					/>
				</div>
				<div className='flex items-center gap-2'>
					<Button
						variant='outline'
						size='sm'
						className='gap-2'>
						<Filter className='h-4 w-4' />
						Filter
					</Button>
				</div>
			</div>

			{/* Data Table Placeholder */}
			<Card>
				<CardContent className='p-0'>
					<div className='relative w-full overflow-auto'>
						<table className='w-full caption-bottom text-sm'>
							<thead className='[&_tr]:border-b bg-muted/50'>
								<tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
									<th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>
										Invoice
									</th>
									<th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>
										Customer
									</th>
									<th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>
										Date
									</th>
									<th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>
										Amount
									</th>
									<th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>
										Status
									</th>
								</tr>
							</thead>
							<tbody className='[&_tr:last-child]:border-0'>
								<tr className='border-b transition-colors hover:bg-muted/50'>
									<td
										colSpan={5}
										className='p-12 text-center text-muted-foreground'>
										<div className='flex flex-col items-center gap-2'>
											<Receipt className='h-8 w-8 opacity-20' />
											<p>
												No invoices found. Create your first one to get started.
											</p>
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

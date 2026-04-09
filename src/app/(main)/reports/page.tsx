/** @format */

'use client';

import {
	FileText,
	Download,
	BarChart3,
	PieChart,
	Landmark,
	ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const REPORT_CATEGORIES = [
	{
		title: 'Profit & Loss',
		description: 'Summary of your revenue, costs, and expenses.',
		icon: BarChart3,
	},
	{
		title: 'Balance Sheet',
		description: 'Detailed view of assets, liabilities, and equity.',
		icon: Landmark,
	},
	{
		title: 'Tax Summary',
		description: 'Prepare your business for tax season with ease.',
		icon: PieChart,
	},
];

export default function ReportsPage() {
	return (
		<div className='flex flex-col gap-6 p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>
						Financial Reports
					</h1>
					<p className='text-sm text-muted-foreground'>
						Analyze your business performance with detailed data.
					</p>
				</div>
				<Button
					variant='outline'
					className='gap-2'>
					<Download className='h-4 w-4' />
					Export All
				</Button>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				{REPORT_CATEGORIES.map((report) => (
					<Card
						key={report.title}
						className='group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all'>
						<CardContent className='flex flex-col gap-4 p-6'>
							<div className='flex items-center justify-between'>
								<div className='rounded-lg bg-primary/10 p-3'>
									<report.icon className='h-6 w-6 text-primary' />
								</div>
								<ArrowRight className='h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity' />
							</div>
							<h3 className='font-bold text-lg'>{report.title}</h3>
							<p className='text-sm text-muted-foreground leading-relaxed'>
								{report.description}
							</p>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

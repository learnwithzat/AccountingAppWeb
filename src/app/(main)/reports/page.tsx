/** @format */

'use client';

import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
				{['Profit & Loss', 'Balance Sheet', 'Tax Summary'].map((report) => (
					<Card
						key={report}
						className='cursor-pointer hover:bg-muted/50 transition-colors'>
						<CardContent className='flex items-center gap-4 p-6'>
							<div className='rounded-md bg-primary/10 p-2'>
								<FileText className='h-6 w-6 text-primary' />
							</div>
							<span className='font-medium'>{report}</span>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

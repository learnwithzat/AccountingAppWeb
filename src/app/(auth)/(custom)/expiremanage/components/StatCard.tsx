/** @format */

import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

export function StatCard({
	label,
	value,
	icon: Icon,
}: {
	label: string;
	value: number;
	icon: LucideIcon;
}) {
	return (
		<Card size='sm'>
			<CardContent className='flex items-center gap-4'>
				<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary'>
					<Icon className='h-5 w-5' />
				</div>
				<div>
					<p className='text-xs font-medium text-muted-foreground'>{label}</p>
					<p className='text-2xl font-bold'>{value}</p>
				</div>
			</CardContent>
		</Card>
	);
}

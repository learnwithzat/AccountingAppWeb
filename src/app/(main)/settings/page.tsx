/** @format */

'use client';

import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ProductsPage() {
	return (
		<div className='flex flex-col gap-6 p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>Products</h1>
					<p className='text-sm text-muted-foreground'>
						Manage your inventory and service catalog.
					</p>
				</div>
				<Button className='gap-2'>
					<Plus className='h-4 w-4' />
					Add Product
				</Button>
			</div>

			<Card className='flex min-h-[400px] flex-col items-center justify-center border-dashed text-center'>
				<CardContent className='flex flex-col items-center gap-2 py-10'>
					<div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
						<Package className='h-6 w-6 text-muted-foreground' />
					</div>
					<h3 className='text-lg font-semibold'>Catalog is empty</h3>
					<p className='max-w-xs text-sm text-muted-foreground'>
						Add your items or services here to quickly include them in sales and
						purchases.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

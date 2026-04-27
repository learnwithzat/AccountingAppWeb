/** @format */

import { PackageSearch } from 'lucide-react';

export function EmptyState({ text }: { text: string }) {
	return (
		<div className='flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center'>
			<PackageSearch className='mb-4 h-10 w-10 text-muted-foreground/40' />
			<p className='text-sm font-medium text-muted-foreground'>{text}</p>
		</div>
	);
}

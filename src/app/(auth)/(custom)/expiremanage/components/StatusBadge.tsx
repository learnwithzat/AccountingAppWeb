/** @format */

import { DocStatus } from '../types';
import { Badge } from '@/components/ui/badge';

export function StatusBadge({ status }: { status: DocStatus }) {
	const variantMap: Record<DocStatus, 'destructive' | 'secondary' | 'default'> =
		{
			expired: 'destructive',
			soon: 'secondary',
			active: 'default', // Or a custom 'success' if you add it to badge.tsx
		} as const;

	return (
		<Badge
			variant={variantMap[status]}
			className='capitalize'>
			{status}
		</Badge>
	);
}

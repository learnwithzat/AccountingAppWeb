/** @format */

import { DocumentItem } from '../types';
import {
	getDaysDiff,
	getStatus,
	formatDate,
	formatCountdown,
	TYPE_ICONS,
} from '../utils/docUtils';
import { StatusBadge } from './StatusBadge';
import { Card, CardContent } from '@/components/ui/card';

export function DocCard({ doc, range }: { doc: DocumentItem; range: number }) {
	const diff = getDaysDiff(doc.expiryDate);
	const status = getStatus(diff, range);

	return (
		<Card size='sm'>
			<CardContent className='flex items-center gap-4 py-3'>
				<div className='flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-xl dark:bg-slate-800'>
					{TYPE_ICONS[doc.type]}
				</div>

				<div className='flex-1 min-w-0'>
					<div className='font-medium truncate'>{doc.name}</div>
					<div className='text-xs text-muted-foreground truncate'>
						ID: {doc.owner}
					</div>
				</div>

				<div className='text-right text-xs shrink-0'>
					<div className='font-medium'>{formatDate(doc.expiryDate)}</div>
					<div className='text-muted-foreground'>{formatCountdown(diff)}</div>
				</div>

				<StatusBadge status={status} />
			</CardContent>
		</Card>
	);
}

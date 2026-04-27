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

export function DocCard({ doc, range }: { doc: DocumentItem; range: number }) {
	const diff = getDaysDiff(doc.expiryDate);
	const status = getStatus(diff, range);

	return (
		<div className='flex items-center gap-4 border p-4 rounded-lg'>
			<div className='text-xl'>{TYPE_ICONS[doc.type]}</div>

			<div className='flex-1'>
				<div className='font-medium'>{doc.name}</div>
				<div className='text-sm text-gray-500'>{doc.owner}</div>
			</div>

			<div className='text-right text-sm'>
				<div>{formatDate(doc.expiryDate)}</div>
				<div>{formatCountdown(diff)}</div>
			</div>

			<StatusBadge status={status} />
		</div>
	);
}

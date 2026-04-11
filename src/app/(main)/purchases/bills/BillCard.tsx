/** @format */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bill, BillStatus } from '@/store/useBillStore';
import {
	formatCurrency,
	formatDate,
	getStatusBadge,
	getBillTypeLabel,
	getBillMetadata,
} from './page';

export default function BillCard({
	bill,
	onStatusChange,
	onPay,
}: {
	bill: Bill;
	onStatusChange: (id: string, status: BillStatus) => void;
	onPay: (bill: Bill) => void;
}) {
	const [showStatusMenu, setShowStatusMenu] = useState(false);

	const statusOptions: BillStatus[] = [
		'draft',
		'pending',
		'approved',
		'paid',
		'partial',
		'cancelled',
	];

	const { isOverdue, dueAmount, effectiveStatus } = getBillMetadata(bill);

	return (
		<div className='bg-gray-800 rounded-lg p-4 mb-3'>
			<div className='flex justify-between items-start mb-2'>
				<div>
					<Link
						href={`/purchases/bills/${bill.id}`}
						className='text-lg font-semibold text-blue-400 hover:text-blue-300'>
						{bill.billNumber || `BILL-${bill.id.slice(0, 8)}`}
					</Link>
					<p className='text-sm text-gray-400'>{bill.vendorName}</p>
				</div>
				{getStatusBadge(effectiveStatus as BillStatus)}
			</div>

			<div className='grid grid-cols-2 gap-2 mb-3 text-sm'>
				<div>
					<span className='text-gray-400'>Bill Date:</span>
					<span className='ml-2'>{formatDate(bill.billDate)}</span>
				</div>
				<div>
					<span className='text-gray-400'>Due Date:</span>
					<span className={`ml-2 ${isOverdue ? 'text-red-400' : ''}`}>
						{formatDate(bill.dueDate)}
					</span>
				</div>
				<div>
					<span className='text-gray-400'>Amount:</span>
					<span className='ml-2 font-semibold'>
						{formatCurrency(bill.totalAmount, bill.currency)}
					</span>
				</div>
				<div>
					<span className='text-gray-400'>Paid:</span>
					<span className='ml-2'>
						{formatCurrency(bill.paidAmount, bill.currency)}
					</span>
				</div>
				<div className='col-span-2'>
					<span className='text-gray-400'>Type:</span>
					<span className='ml-2'>{getBillTypeLabel(bill.type)}</span>
				</div>
			</div>

			{bill.status !== 'paid' && bill.status !== 'cancelled' && (
				<div className='flex justify-between items-center pt-2 border-t border-gray-700'>
					<div className='relative'>
						<button
							onClick={() => setShowStatusMenu(!showStatusMenu)}
							className='text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600'>
							Change Status
						</button>
						{showStatusMenu && (
							<div className='absolute bottom-full mb-2 left-0 bg-gray-700 rounded shadow-lg z-10 min-w-[120px]'>
								{statusOptions.map((status) => (
									<button
										key={status}
										onClick={() => {
											onStatusChange(bill.id, status);
											setShowStatusMenu(false);
										}}
										className='block w-full text-left px-3 py-2 text-sm hover:bg-gray-600 rounded'>
										{status.charAt(0).toUpperCase() + status.slice(1)}
									</button>
								))}
							</div>
						)}
					</div>

					<div className='space-x-2'>
						{dueAmount > 0 && (
							<button
								onClick={() => onPay(bill)}
								className='text-sm bg-green-600 hover:bg-green-700 px-3 py-1 rounded'>
								Record Payment
							</button>
						)}
						<Link
							href={`/purchases/bills/${bill.id}/edit`}
							className='text-sm text-blue-400 hover:text-blue-300'>
							Edit
						</Link>
					</div>
				</div>
			)}
		</div>
	);
}

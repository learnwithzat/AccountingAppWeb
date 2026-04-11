/** @format */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
	PurchaseOrder,
	PurchaseOrderStatus,
} from '@/store/usePurchaseOrderStore';
import {
	formatCurrency,
	formatDate,
	getStatusBadge,
	getOrderMetadata,
} from './page';

export default function PurchaseOrderCard({
	po,
	onStatusChange,
	onReceive,
}: {
	po: PurchaseOrder;
	onStatusChange: (id: string, status: PurchaseOrderStatus) => void;
	onReceive: (po: PurchaseOrder) => void;
}) {
	const [showStatusMenu, setShowStatusMenu] = useState(false);

	const statusOptions: PurchaseOrderStatus[] = [
		'draft',
		'pending',
		'approved',
		'ordered',
		'received',
		'completed',
		'cancelled',
	];

	const { isOverdue, isOpen } = getOrderMetadata(po);

	return (
		<div className='bg-gray-800 rounded-lg p-4 mb-3'>
			<div className='flex justify-between items-start mb-2'>
				<div>
					<Link
						href={`/purchases/orders/${po.id}`}
						className='text-lg font-semibold text-blue-400 hover:text-blue-300'>
						{po.poNumber || `PO-${po.id.slice(0, 8)}`}
					</Link>
					<p className='text-sm text-gray-400'>{po.vendorName}</p>
				</div>
				{getStatusBadge(po.status)}
			</div>

			<div className='grid grid-cols-2 gap-2 mb-3 text-sm'>
				<div>
					<span className='text-gray-400'>Order Date:</span>
					<span className='ml-2'>{formatDate(po.orderDate)}</span>
				</div>
				<div>
					<span className='text-gray-400'>Expected:</span>
					<span
						className={`ml-2 ${isOverdue ? 'text-red-400 font-semibold' : ''}`}>
						{formatDate(po.expectedDeliveryDate)}
					</span>
				</div>
				<div>
					<span className='text-gray-400'>Amount:</span>
					<span className='ml-2 font-semibold'>
						{formatCurrency(po.totalAmount, po.currency)}
					</span>
				</div>
			</div>

			{po.status !== 'completed' && po.status !== 'cancelled' && (
				<div className='flex justify-between items-center pt-2 border-t border-gray-700'>
					<div className='relative'>
						<button
							onClick={() => setShowStatusMenu(!showStatusMenu)}
							className='text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600'>
							Status
						</button>
						{showStatusMenu && (
							<div className='absolute bottom-full mb-2 left-0 bg-gray-700 rounded shadow-lg z-10 min-w-[120px]'>
								{statusOptions.map((status) => (
									<button
										key={status}
										onClick={() => {
											onStatusChange(po.id, status);
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
						{isOpen && (
							<button
								onClick={() => onReceive(po)}
								className='text-sm bg-green-600 hover:bg-green-700 px-3 py-1 rounded'>
								Receive
							</button>
						)}
						<Link
							href={`/purchases/orders/${po.id}/edit`}
							className='text-sm text-blue-400 hover:text-blue-300'>
							Edit
						</Link>
					</div>
				</div>
			)}
		</div>
	);
}

/** @format */

'use client';

import { useState } from 'react';

export default function GeneralReceiptPage() {
	const [note, setNote] = useState('');
	const [amount, setAmount] = useState('');
	const [data, setData] = useState<any[]>([]);

	const add = () => {
		if (!note || !amount) return;

		setData([
			...data,
			{
				id: Date.now(),
				note,
				amount: Number(amount),
				date: new Date().toISOString().slice(0, 10),
			},
		]);

		setNote('');
		setAmount('');
	};

	return (
		<div className='p-6 space-y-6'>
			<h1 className='text-xl font-semibold'>General Receipt</h1>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
				<input
					className='border p-2 rounded'
					placeholder='Receipt Note'
					value={note}
					onChange={(e) => setNote(e.target.value)}
				/>

				<input
					className='border p-2 rounded'
					placeholder='Amount'
					type='number'
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
				/>

				<button
					onClick={add}
					className='bg-green-600 text-white rounded p-2'>
					Add Receipt
				</button>
			</div>

			<table className='w-full border mt-4'>
				<thead className='bg-gray-100'>
					<tr>
						<th className='border p-2'>Note</th>
						<th className='border p-2'>Amount</th>
						<th className='border p-2'>Date</th>
					</tr>
				</thead>
				<tbody>
					{data.map((r) => (
						<tr key={r.id}>
							<td className='border p-2'>{r.note}</td>
							<td className='border p-2'>{r.amount}</td>
							<td className='border p-2'>{r.date}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

/** @format */

'use client';

import { useState } from 'react';

type Payment = {
	id: number;
	party: string;
	amount: number;
	date: string;
	method: string;
};

export default function PartyPaymentPage() {
	const [party, setParty] = useState('');
	const [amount, setAmount] = useState('');
	const [method, setMethod] = useState('Cash');

	const [data, setData] = useState<Payment[]>([]);

	const handleAdd = () => {
		if (!party || !amount) return;

		setData([
			...data,
			{
				id: Date.now(),
				party,
				amount: Number(amount),
				date: new Date().toISOString().slice(0, 10),
				method,
			},
		]);

		setParty('');
		setAmount('');
	};

	return (
		<div className='p-6 space-y-6'>
			<h1 className='text-xl font-semibold'>Party Payment</h1>

			<div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
				<input
					className='border p-2 rounded'
					placeholder='Party Name'
					value={party}
					onChange={(e) => setParty(e.target.value)}
				/>

				<input
					className='border p-2 rounded'
					placeholder='Amount'
					type='number'
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
				/>

				<select
					className='border p-2 rounded'
					value={method}
					onChange={(e) => setMethod(e.target.value)}>
					<option>Cash</option>
					<option>Bank</option>
					<option>Cheque</option>
				</select>

				<button
					onClick={handleAdd}
					className='bg-black text-white rounded p-2'>
					Add Payment
				</button>
			</div>

			<table className='w-full border mt-4'>
				<thead className='bg-gray-100'>
					<tr>
						<th className='p-2 border'>Party</th>
						<th className='p-2 border'>Amount</th>
						<th className='p-2 border'>Method</th>
						<th className='p-2 border'>Date</th>
					</tr>
				</thead>
				<tbody>
					{data.map((item) => (
						<tr key={item.id}>
							<td className='p-2 border'>{item.party}</td>
							<td className='p-2 border'>{item.amount}</td>
							<td className='p-2 border'>{item.method}</td>
							<td className='p-2 border'>{item.date}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

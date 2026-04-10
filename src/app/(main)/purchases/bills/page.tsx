/** @format */

'use client';

import { useState } from 'react';

type Bill = {
	id: number;
	supplier: string;
	billNo: string;
	amount: number;
	date: string;
};

export default function PurchaseBillsPage() {
	const [supplier, setSupplier] = useState('');
	const [billNo, setBillNo] = useState('');
	const [amount, setAmount] = useState('');
	const [data, setData] = useState<Bill[]>([]);

	const addBill = () => {
		if (!supplier || !billNo || !amount) return;

		setData([
			...data,
			{
				id: Date.now(),
				supplier,
				billNo,
				amount: Number(amount),
				date: new Date().toISOString().slice(0, 10),
			},
		]);

		setSupplier('');
		setBillNo('');
		setAmount('');
	};

	return (
		<div className='p-6 space-y-6'>
			<h1 className='text-xl font-semibold'>Purchase Bills</h1>

			{/* FORM */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
				<input
					className='border p-2 rounded'
					placeholder='Supplier Name'
					value={supplier}
					onChange={(e) => setSupplier(e.target.value)}
				/>

				<input
					className='border p-2 rounded'
					placeholder='Bill No'
					value={billNo}
					onChange={(e) => setBillNo(e.target.value)}
				/>

				<input
					className='border p-2 rounded'
					placeholder='Amount'
					type='number'
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
				/>

				<button
					onClick={addBill}
					className='bg-black text-white rounded p-2'>
					Add Bill
				</button>
			</div>

			{/* TABLE */}
			<div className='border rounded-lg overflow-hidden'>
				<table className='w-full'>
					<thead className='bg-gray-100'>
						<tr>
							<th className='p-2 border'>Supplier</th>
							<th className='p-2 border'>Bill No</th>
							<th className='p-2 border'>Amount</th>
							<th className='p-2 border'>Date</th>
						</tr>
					</thead>

					<tbody>
						{data.map((b) => (
							<tr key={b.id}>
								<td className='p-2 border'>{b.supplier}</td>
								<td className='p-2 border'>{b.billNo}</td>
								<td className='p-2 border'>{b.amount}</td>
								<td className='p-2 border'>{b.date}</td>
							</tr>
						))}

						{data.length === 0 && (
							<tr>
								<td
									colSpan={4}
									className='text-center p-4 text-gray-500'>
									No bills found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

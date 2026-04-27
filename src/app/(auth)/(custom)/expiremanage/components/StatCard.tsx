/** @format */

export function StatCard({ label, value }: { label: string; value: number }) {
	return (
		<div className='p-4 border rounded-lg'>
			<div className='text-xs text-gray-500'>{label}</div>
			<div className='text-2xl font-semibold'>{value}</div>
		</div>
	);
}

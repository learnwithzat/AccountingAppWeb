/** @format */

'use client';

import { useMemo, useState } from 'react';
import { DocCard } from './components/DocCard';
import { StatCard } from './components/StatCard';
import { EmptyState } from './components/EmptyState';
import { getDaysDiff, getStatus } from './utils/docUtils';
import { DocStatus } from './types';
import { useDocuments } from './hook/useDocuments';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from '@/components/ui/input-group';
import { SearchIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ExpireManagerPage() {
	const { docs, loading, error, refetch } = useDocuments();

	const [search, setSearch] = useState('');
	const [range, setRange] = useState(30);
	const [tab, setTab] = useState<DocStatus>('expired');

	//////////////////////////////////////////////////////
	// FILTER
	//////////////////////////////////////////////////////
	const filtered = useMemo(() => {
		return docs.filter((d) =>
			`${d.name} ${d.ownerType} ${d.ownerId}`
				.toLowerCase()
				.includes(search.toLowerCase())
		);
	}, [docs, search]);

	//////////////////////////////////////////////////////
	// CATEGORIZE
	//////////////////////////////////////////////////////
	const categorized = useMemo(() => {
		const map: Record<DocStatus, typeof docs> = {
			expired: [],
			soon: [],
			active: [],
		};

		filtered.forEach((d) => {
			const diff = getDaysDiff(d.expiryDate);
			const status = getStatus(diff, range);
			map[status].push(d);
		});

		return map;
	}, [filtered, range]);

	//////////////////////////////////////////////////////
	// LOADING / ERROR
	//////////////////////////////////////////////////////
	if (loading)
		return (
			<div className='p-6 text-sm text-gray-500'>Loading documents...</div>
		);

	if (error)
		return (
			<div className='p-6 text-red-500 text-sm'>
				{error}
				<button
					className='ml-2 underline'
					onClick={refetch}>
					Retry
				</button>
			</div>
		);

	const visibleDocs = categorized[tab];

	return (
		<div className='p-6 max-w-4xl mx-auto space-y-4'>
			<h1 className='text-xl font-semibold'>Expire Manager</h1>

			{/* SEARCH */}
			<InputGroup>
				<InputGroupAddon align='inline-start'>
					<SearchIcon className='h-4 w-4 opacity-50' />
				</InputGroupAddon>
				<InputGroupInput
					placeholder='Search by name or owner ID...'
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</InputGroup>

			{/* TABS */}
			<Tabs
				value={tab}
				onValueChange={(v) => setTab(v as DocStatus)}>
				<TabsList variant='line'>
					<TabsTrigger value='expired'>Expired</TabsTrigger>
					<TabsTrigger value='soon'>Expiring Soon</TabsTrigger>
					<TabsTrigger value='active'>Active</TabsTrigger>
				</TabsList>
			</Tabs>

			{/* STATS */}
			<div className='grid grid-cols-3 gap-2'>
				<StatCard
					label='Expired'
					value={categorized.expired.length}
				/>
				<StatCard
					label='Soon'
					value={categorized.soon.length}
				/>
				<StatCard
					label='Active'
					value={categorized.active.length}
				/>
			</div>

			{/* LIST */}
			<div className='space-y-2'>
				{visibleDocs.length === 0 ?
					<EmptyState text='No documents found' />
				:	visibleDocs.map((doc) => (
						<DocCard
							key={doc.id}
							doc={doc}
							range={range}
						/>
					))
				}
			</div>
		</div>
	);
}

/** @format */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	FiSearch,
	FiAlertTriangle,
	FiCheckCircle,
	FiClock,
} from 'react-icons/fi';

// Mock type (replace with real API data)
type DocumentItem = {
	id: string;
	name: string;
	type: string; // passport, visa, employee-doc, etc.
	owner: string; // employee/vendor name
	expiryDate: string;
};

const mockData: DocumentItem[] = [
	{
		id: '1',
		name: 'Iqama',
		type: 'employee',
		owner: 'Ahmed',
		expiryDate: '2026-04-25',
	},
	{
		id: '2',
		name: 'Passport',
		type: 'employee',
		owner: 'John',
		expiryDate: '2026-08-01',
	},
	{
		id: '3',
		name: 'License',
		type: 'vehicle',
		owner: 'Truck 12',
		expiryDate: '2025-12-01',
	},
	{
		id: '4',
		name: 'Contract',
		type: 'vendor',
		owner: 'ABC Co',
		expiryDate: '2024-10-10',
	},
];

const rangeOptions = [
	{ label: '1 Week', value: 7 },
	{ label: '1 Month', value: 30 },
	{ label: '3 Months', value: 90 },
	{ label: '1 Year', value: 365 },
];

export default function ExpireManagePage() {
	const [documents, setDocuments] = useState<DocumentItem[]>([]);
	const [search, setSearch] = useState('');
	const [range, setRange] = useState(30);

	useEffect(() => {
		// TODO: replace with API call
		setDocuments(mockData);
	}, []);

	const today = new Date();

	const filtered = useMemo(() => {
		return documents.filter(
			(doc) =>
				doc.name.toLowerCase().includes(search.toLowerCase()) ||
				doc.owner.toLowerCase().includes(search.toLowerCase()),
		);
	}, [documents, search]);

	const categorized = useMemo(() => {
		const expired: DocumentItem[] = [];
		const expiringSoon: DocumentItem[] = [];
		const active: DocumentItem[] = [];

		filtered.forEach((doc) => {
			const expiry = new Date(doc.expiryDate);
			const diffDays = Math.ceil(
				(expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
			);

			if (diffDays < 0) {
				expired.push(doc);
			} else if (diffDays <= range) {
				expiringSoon.push(doc);
			} else {
				active.push(doc);
			}
		});

		return { expired, expiringSoon, active };
	}, [filtered, range]);

	const renderCard = (doc: DocumentItem) => {
		const expiry = new Date(doc.expiryDate);
		const diffDays = Math.ceil(
			(expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
		);

		let badge;
		if (diffDays < 0) {
			badge = <Badge variant='destructive'>Expired</Badge>;
		} else if (diffDays <= range) {
			badge = <Badge variant='secondary'>Soon</Badge>;
		} else {
			badge = <Badge variant='default'>Active</Badge>;
		}

		return (
			<Card
				key={doc.id}
				className='mb-3'>
				<CardContent className='flex justify-between items-center p-4'>
					<div>
						<div className='font-medium'>{doc.name}</div>
						<div className='text-sm text-muted-foreground'>{doc.owner}</div>
						<div className='text-xs'>Expiry: {doc.expiryDate}</div>
					</div>
					<div className='flex items-center gap-2'>{badge}</div>
				</CardContent>
			</Card>
		);
	};

	return (
		<div className='p-6 space-y-6'>
			<Card>
				<CardHeader>
					<CardTitle>Expire Manager</CardTitle>
				</CardHeader>
				<CardContent className='flex flex-col md:flex-row gap-4'>
					<div className='relative w-full md:w-1/3'>
						<FiSearch className='absolute left-3 top-3 text-gray-400' />
						<Input
							placeholder='Search documents...'
							className='pl-10'
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>

					<Select
						value={String(range)}
						onValueChange={(val) => setRange(Number(val))}>
						<SelectTrigger className='w-full md:w-48'>
							<SelectValue placeholder='Range' />
						</SelectTrigger>
						<SelectContent>
							{rangeOptions.map((opt) => (
								<SelectItem
									key={opt.value}
									value={String(opt.value)}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</CardContent>
			</Card>

			<Tabs defaultValue='soon'>
				<TabsList>
					<TabsTrigger value='soon'>
						<FiClock className='mr-2' /> Expiring Soon
					</TabsTrigger>
					<TabsTrigger value='expired'>
						<FiAlertTriangle className='mr-2' /> Expired
					</TabsTrigger>
					<TabsTrigger value='active'>
						<FiCheckCircle className='mr-2' /> Active
					</TabsTrigger>
				</TabsList>

				<TabsContent value='soon'>
					{categorized.expiringSoon.map(renderCard)}
				</TabsContent>

				<TabsContent value='expired'>
					{categorized.expired.map(renderCard)}
				</TabsContent>

				<TabsContent value='active'>
					{categorized.active.map(renderCard)}
				</TabsContent>
			</Tabs>
		</div>
	);
}

/** @format */

'use client';

import { useEffect, useState } from 'react';
import { OrgService } from '@/services/org.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CompanyPage() {
	const [companies, setCompanies] = useState<any[]>([]);
	const [name, setName] = useState('');
	const [loading, setLoading] = useState(false);

	//////////////////////////////////////////////////////
	// LOAD
	//////////////////////////////////////////////////////
	const load = async () => {
		setLoading(true);
		const res = await OrgService.getCompanies();
		setCompanies(res.data || []);
		setLoading(false);
	};

	useEffect(() => {
		load();
	}, []);

	//////////////////////////////////////////////////////
	// CREATE
	//////////////////////////////////////////////////////
	const create = async () => {
		if (!name) return;

		await OrgService.createCompany({ name });
		setName('');
		load();
	};

	//////////////////////////////////////////////////////
	// UI
	//////////////////////////////////////////////////////
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
			<h1 style={{ fontSize: 24, fontWeight: 700 }}>Company Management</h1>

			{/* CREATE */}
			<div
				style={{
					background: '#fff',
					padding: 16,
					borderRadius: 10,
					display: 'flex',
					gap: 10,
				}}>
				<Input
					placeholder='Company name'
					value={name}
					onChange={(e: any) => setName(e.target.value)}
				/>

				<Button onClick={create}>Create</Button>
			</div>

			{/* LIST */}
			<div style={{ background: '#fff', borderRadius: 10 }}>
				{loading ?
					<div style={{ padding: 20 }}>Loading...</div>
				:	companies.map((c) => (
						<div
							key={c.id}
							style={{
								padding: 12,
								borderBottom: '1px solid #eee',
								display: 'flex',
								justifyContent: 'space-between',
							}}>
							<div>
								<strong>{c.name}</strong>
							</div>

							<div style={{ display: 'flex', gap: 8 }}>
								<Button
									onClick={() => OrgService.deleteCompany(c.id).then(load)}
									style={{ background: 'red' }}>
									Delete
								</Button>
							</div>
						</div>
					))
				}
			</div>
		</div>
	);
}

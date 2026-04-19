/** @format */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { TenantService } from '@/services/tenant.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Page() {
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);

	const [name, setName] = useState('');
	const [slug, setSlug] = useState('');

	//////////////////////////////////////////////////////
	// FILTERS
	//////////////////////////////////////////////////////
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState('ALL');

	//////////////////////////////////////////////////////
	// LOAD
	//////////////////////////////////////////////////////
	const load = async () => {
		try {
			setLoading(true);
			const res = await TenantService.getAll();
			setData(res?.data || []);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	//////////////////////////////////////////////////////
	// CREATE
	//////////////////////////////////////////////////////
	const create = async () => {
		if (!name || !slug) return;

		await TenantService.create({ name, slug });

		setName('');
		setSlug('');
		load();
	};

	//////////////////////////////////////////////////////
	// FILTERED DATA (CLIENT SIDE)
	//////////////////////////////////////////////////////
	const filtered = useMemo(() => {
		return data.filter((t) => {
			if (status !== 'ALL' && t.status !== status) return false;

			if (
				search &&
				!t.name.toLowerCase().includes(search.toLowerCase()) &&
				!t.slug.toLowerCase().includes(search.toLowerCase())
			) {
				return false;
			}

			return true;
		});
	}, [data, search, status]);

	//////////////////////////////////////////////////////
	// DELETE (SAFE)
	//////////////////////////////////////////////////////
	const remove = async (id: string) => {
		const ok = confirm('Are you sure you want to delete this tenant?');
		if (!ok) return;

		await TenantService.remove(id);
		load();
	};

	//////////////////////////////////////////////////////
	// UI
	//////////////////////////////////////////////////////
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
			{/* HEADER */}
			<div>
				<h1 style={{ fontSize: 24, fontWeight: 700 }}>Tenant Management</h1>
				<p style={{ color: '#64748b' }}>
					Manage organizations, status, and access
				</p>
			</div>

			{/* CREATE */}
			<div
				style={{
					display: 'flex',
					gap: 10,
					background: '#fff',
					padding: 16,
					borderRadius: 10,
				}}>
				<Input
					placeholder='Tenant Name'
					value={name}
					onChange={(e: any) => setName(e.target.value)}
				/>

				<Input
					placeholder='Slug'
					value={slug}
					onChange={(e: any) => setSlug(e.target.value)}
				/>

				<Button onClick={create}>Create</Button>
			</div>

			{/* FILTER BAR */}
			<div
				style={{
					display: 'flex',
					gap: 10,
					background: '#fff',
					padding: 16,
					borderRadius: 10,
				}}>
				<Input
					placeholder='Search tenants...'
					value={search}
					onChange={(e: any) => setSearch(e.target.value)}
				/>

				<select
					value={status}
					onChange={(e) => setStatus(e.target.value)}
					style={{
						padding: 8,
						borderRadius: 6,
						border: '1px solid #ddd',
					}}>
					<option value='ALL'>All</option>
					<option value='ACTIVE'>Active</option>
					<option value='SUSPENDED'>Suspended</option>
					<option value='DELETED'>Deleted</option>
				</select>
			</div>

			{/* TABLE */}
			<div style={{ background: '#fff', borderRadius: 10 }}>
				{/* HEADER */}
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
						padding: 12,
						fontWeight: 600,
						background: '#f1f5f9',
					}}>
					<div>Name</div>
					<div>Slug</div>
					<div>Status</div>
					<div>Created</div>
					<div>Actions</div>
				</div>

				{/* BODY */}
				{loading ?
					<div style={{ padding: 20 }}>Loading...</div>
				: filtered.length === 0 ?
					<div style={{ padding: 20, color: '#64748b' }}>No tenants found</div>
				:	filtered.map((t) => (
						<div
							key={t.id}
							style={{
								display: 'grid',
								gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
								padding: 12,
								borderTop: '1px solid #eee',
								alignItems: 'center',
							}}>
							<div>
								<strong>{t.name}</strong>
							</div>

							<div>{t.slug}</div>

							<div>
								<span
									style={{
										padding: '4px 8px',
										borderRadius: 6,
										fontSize: 12,
										background:
											t.status === 'ACTIVE' ? '#dcfce7'
											: t.status === 'SUSPENDED' ? '#fef3c7'
											: '#fee2e2',
									}}>
									{t.status}
								</span>
							</div>

							<div>{new Date(t.createdAt).toLocaleDateString()}</div>

							<div style={{ display: 'flex', gap: 6 }}>
								<Button
									onClick={() => console.log('edit', t.id)}
									style={{ padding: '4px 8px' }}>
									Edit
								</Button>

								<Button
									onClick={() => remove(t.id)}
									style={{
										padding: '4px 8px',
										background: 'red',
									}}>
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

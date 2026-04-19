/** @format */

'use client';

import { useEffect, useState } from 'react';
import { UserService } from '@/services/user.service';
import { TenantService } from '@/services/tenant.service';
import { RoleService } from '@/services/role.service';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function UserPage() {
	const [users, setUsers] = useState<any[]>([]);
	const [tenants, setTenants] = useState<any[]>([]);
	const [roles, setRoles] = useState<any[]>([]);

	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');

	const [form, setForm] = useState({
		name: '',
		email: '',
		username: '',
		password: '',
		tenantId: '',
		roleId: '',
	});

	//////////////////////////////////////////////////////
	// LOAD DATA
	//////////////////////////////////////////////////////
	const load = async () => {
		try {
			setLoading(true);

			const [u, t, r] = await Promise.all([
				UserService.getAll(),
				TenantService.getAll(),
				RoleService.getAll(),
			]);

			setUsers(u?.data || []);
			setTenants(t?.data || []);
			setRoles(r?.data || []);
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
	// CREATE USER WITH MEMBERSHIP
	//////////////////////////////////////////////////////
	const create = async () => {
		if (!form.tenantId || !form.roleId) {
			alert('Tenant & Role required');
			return;
		}

		await UserService.create(form);

		setForm({
			name: '',
			email: '',
			username: '',
			password: '',
			tenantId: '',
			roleId: '',
		});

		load();
	};

	//////////////////////////////////////////////////////
	// FILTER
	//////////////////////////////////////////////////////
	const filtered = users.filter(
		(u) =>
			u.name?.toLowerCase().includes(search.toLowerCase()) ||
			u.email?.toLowerCase().includes(search.toLowerCase())
	);

	//////////////////////////////////////////////////////
	// UI
	//////////////////////////////////////////////////////
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
			{/* HEADER */}
			<div>
				<h1 style={{ fontSize: 24, fontWeight: 700 }}>
					User Management (Enterprise)
				</h1>
				<p style={{ color: '#64748b' }}>
					Users → Membership → Tenant → Role
				</p>
			</div>

			{/* CREATE */}
			<div
				style={{
					background: '#fff',
					padding: 16,
					borderRadius: 10,
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gap: 10,
				}}>
				<Input
					placeholder='Name'
					value={form.name}
					onChange={(e) => setForm({ ...form, name: e.target.value })}
				/>
				<Input
					placeholder='Email'
					value={form.email}
					onChange={(e) => setForm({ ...form, email: e.target.value })}
				/>
				<Input
					placeholder='Username'
					value={form.username}
					onChange={(e) => setForm({ ...form, username: e.target.value })}
				/>
				<Input
					type='password'
					placeholder='Password'
					value={form.password}
					onChange={(e) => setForm({ ...form, password: e.target.value })}
				/>

				{/* TENANT SELECT */}
				<select
					value={form.tenantId}
					onChange={(e) =>
						setForm({ ...form, tenantId: e.target.value })
					}>
					<option value=''>Select Tenant</option>
					{tenants.map((t) => (
						<option key={t.id} value={t.id}>
							{t.name}
						</option>
					))}
				</select>

				{/* ROLE SELECT */}
				<select
					value={form.roleId}
					onChange={(e) =>
						setForm({ ...form, roleId: e.target.value })
					}>
					<option value=''>Select Role</option>
					{roles.map((r) => (
						<option key={r.id} value={r.id}>
							{r.name}
						</option>
					))}
				</select>

				<Button onClick={create}>Create User</Button>
			</div>

			{/* SEARCH */}
			<Input
				placeholder='Search users...'
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>

			{/* TABLE */}
			<div style={{ background: '#fff', borderRadius: 10 }}>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '2fr 2fr 2fr 2fr 1fr 1fr',
						padding: 12,
						fontWeight: 600,
						background: '#f1f5f9',
					}}>
					<div>Name</div>
					<div>Email</div>
					<div>Username</div>
					<div>Tenant / Role</div>
					<div>Status</div>
					<div>Actions</div>
				</div>

				{loading ? (
					<div style={{ padding: 20 }}>Loading...</div>
				) : (
					filtered.map((u) => {
						const m = u.memberships?.[0];

						return (
							<div
								key={u.id}
								style={{
									display: 'grid',
									gridTemplateColumns: '2fr 2fr 2fr 2fr 1fr 1fr',
									padding: 12,
									borderTop: '1px solid #eee',
								}}>
								<div>{u.name}</div>
								<div>{u.email}</div>
								<div>{u.username}</div>

								<div>
									{m?.tenant?.name || 'N/A'} <br />
									<small>{m?.role?.name}</small>
								</div>

								<div>
									<span
										style={{
											padding: '4px 8px',
											borderRadius: 6,
											fontSize: 12,
											background: u.isActive
												? '#dcfce7'
												: '#fee2e2',
										}}>
										{u.isActive ? 'ACTIVE' : 'DISABLED'}
									</span>
								</div>

								<div style={{ display: 'flex', gap: 6 }}>
									<Button
										onClick={() =>
											UserService.update(u.id, {
												isActive: !u.isActive,
											}).then(load)
										}>
										Toggle
									</Button>

									<Button
										onClick={() =>
											UserService.remove(u.id).then(load)
										}
										style={{ background: 'red' }}>
										Delete
									</Button>
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
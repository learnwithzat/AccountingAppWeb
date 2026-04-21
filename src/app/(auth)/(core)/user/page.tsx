/** @format */

'use client';

import { useEffect, useState } from 'react';
import { UserService } from '@/services/user.service';
import { RoleService } from '@/services/role.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslation } from 'react-i18next';
export default function UserPage() {
	const { activeTenantId } = useAuth();
	const { t } = useTranslation();

	const [users, setUsers] = useState<any[]>([]);
	const [roles, setRoles] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');

	const [form, setForm] = useState({
		name: '',
		email: '',
		username: '',
		password: '',
		roleId: '',
	});

	//////////////////////////////////////////////////////
	// LOAD USERS
	//////////////////////////////////////////////////////
	const loadUsers = async () => {
		if (!activeTenantId) return;

		try {
			const res = await UserService.getAll(activeTenantId);
			setUsers(res?.data || res);
		} catch (err) {
			console.error(err);
		}
	};

	//////////////////////////////////////////////////////
	// LOAD ROLES
	//////////////////////////////////////////////////////
	const loadRoles = async () => {
		if (!activeTenantId) return;

		try {
			const res = await RoleService.getAll(activeTenantId);
			setRoles(res?.data || res);
		} catch (err) {
			console.error(err);
		}
	};

	//////////////////////////////////////////////////////
	// INIT
	//////////////////////////////////////////////////////
	useEffect(() => {
		if (!activeTenantId) return;

		const init = async () => {
			setLoading(true);
			await Promise.all([loadUsers(), loadRoles()]);
			setLoading(false);
		};

		init();
	}, [activeTenantId]);

	//////////////////////////////////////////////////////
	// CREATE USER
	//////////////////////////////////////////////////////
	const create = async () => {
		if (!form.roleId) {
			alert(t('role.error_required'));
			return;
		}

		await UserService.create(
			{
				...form,
				tenantId: activeTenantId,
			},
			activeTenantId,
		);

		setForm({
			name: '',
			email: '',
			username: '',
			password: '',
			roleId: '',
		});

		await loadUsers();
	};

	//////////////////////////////////////////////////////
	// FILTER
	//////////////////////////////////////////////////////
	const filtered = users.filter(
		(u) =>
			u.name?.toLowerCase().includes(search.toLowerCase()) ||
			u.email?.toLowerCase().includes(search.toLowerCase()),
	);

	//////////////////////////////////////////////////////
	// UI (UNCHANGED)
	//////////////////////////////////////////////////////
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
			{/* HEADER */}
			<div>
				<h1 style={{ fontSize: 24, fontWeight: 700 }}>{t('user.title')}</h1>
				<p style={{ color: '#64748b' }}>
					{t('tenant.active')}: {activeTenantId}
				</p>
			</div>

			{/* CREATE USER */}
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
					placeholder={t('common.name')}
					value={form.name}
					onChange={(e) => setForm({ ...form, name: e.target.value })}
				/>

				<Input
					placeholder={t('auth.email')}
					value={form.email}
					onChange={(e) => setForm({ ...form, email: e.target.value })}
				/>

				<Input
					placeholder={t('auth.username')}
					value={form.username}
					onChange={(e) => setForm({ ...form, username: e.target.value })}
				/>

				<Input
					type='password'
					placeholder={t('auth.password')}
					value={form.password}
					onChange={(e) => setForm({ ...form, password: e.target.value })}
				/>

				<select
					value={form.roleId}
					onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
					<option value=''>{t('role.select')}</option>
					{roles.map((r) => (
						<option
							key={r.id}
							value={r.id}>
							{r.name}
						</option>
					))}
				</select>

				<Button onClick={create}>{t('user.create_button')}</Button>
			</div>

			{/* SEARCH */}
			<Input
				placeholder={t('user.search_placeholder')}
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
					<div>{t('common.name')}</div>
					<div>{t('auth.email')}</div>
					<div>{t('auth.username')}</div>
					<div>{t('role.label')}</div>
					<div>{t('common.status')}</div>
					<div>{t('common.actions')}</div>
				</div>

				{loading ?
					<div style={{ padding: 20 }}>{t('common.loading')}</div>
				:	filtered.map((u) => {
						const m = u.memberships?.find(
							(x: any) => x.tenantId === activeTenantId,
						);

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
								<div>{m?.role?.name || t('common.na')}</div>

								<div>
									<span
										style={{
											padding: '4px 8px',
											borderRadius: 6,
											fontSize: 12,
											background: u.isActive ? '#dcfce7' : '#fee2e2',
										}}>
										{u.isActive ?
											t('common.status_active')
										:	t('common.status_disabled')}
									</span>
								</div>

								<div style={{ display: 'flex', gap: 6 }}>
									<Button
										onClick={() =>
											UserService.update(
												u.id,
												{
													isActive: !u.isActive,
												},
												activeTenantId,
											).then(loadUsers)
										}>
										{t('common.toggle')}
									</Button>

									<Button
										onClick={() =>
											UserService.remove(u.id, activeTenantId).then(loadUsers)
										}
										style={{ background: 'red' }}>
										{t('common.delete')}
									</Button>
								</div>
							</div>
						);
					})
				}
			</div>
		</div>
	);
}

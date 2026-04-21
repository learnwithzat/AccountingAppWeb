/** @format */

'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { TenantService } from '@/services/tenant.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
type Tenant = {
	id: string;
	name: string;
	slug: string;
	status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
	createdAt: string;
};

export default function Page() {
	const [data, setData] = useState<Tenant[]>([]);
	const [loading, setLoading] = useState(false);
	const { t, i18n } = useTranslation();

	const [name, setName] = useState('');
	const [slug, setSlug] = useState('');

	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<'ALL' | Tenant['status']>('ALL');

	//////////////////////////////////////////////////////
	// REFRESH (REUSABLE & SAFE)
	//////////////////////////////////////////////////////
	const refresh = useCallback(async () => {
		try {
			setLoading(true);
			const res = await TenantService.getAll();
			setData(res?.data || []);
		} catch (err) {
			console.error(err);
		} finally {
			setLoading(false);
		}
	}, []);

	//////////////////////////////////////////////////////
	// INIT
	//////////////////////////////////////////////////////
	useEffect(() => {
		refresh();
	}, [refresh]);

	//////////////////////////////////////////////////////
	// CREATE
	//////////////////////////////////////////////////////
	const create = async () => {
		if (!name || !slug) return;

		try {
			await TenantService.create({ name, slug });

			setName('');
			setSlug('');

			await refresh();
		} catch (err) {
			console.error(err);
			alert(t('tenant.create_failed'));
		}
	};

	//////////////////////////////////////////////////////
	// DELETE
	//////////////////////////////////////////////////////
	const remove = async (id: string) => {
		const ok = confirm(t('tenant.confirm_delete'));
		if (!ok) return;

		try {
			await TenantService.remove(id);
			await refresh();
		} catch (err) {
			console.error(err);
			alert(t('common.delete_failed'));
		}
	};

	//////////////////////////////////////////////////////
	// FILTERED DATA
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
	// UI (UNCHANGED)
	//////////////////////////////////////////////////////
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
			<div>
				<h1 style={{ fontSize: 24, fontWeight: 700 }}>{t('tenant.title')}</h1>
				<p style={{ color: '#64748b' }}>{t('tenant.description')}</p>
			</div>

			<div
				style={{
					display: 'flex',
					gap: 10,
					background: '#fff',
					padding: 16,
					borderRadius: 10,
				}}>
				<Input
					placeholder={t('tenant.name')}
					value={name}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setName(e.target.value)
					}
				/>

				<Input
					placeholder={t('tenant.slug')}
					value={slug}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setSlug(e.target.value)
					}
				/>

				<Button onClick={create}>{t('common.create')}</Button>
			</div>

			<div
				style={{
					display: 'flex',
					gap: 10,
					background: '#fff',
					padding: 16,
					borderRadius: 10,
				}}>
				<Input
					placeholder={t('tenant.search_placeholder')}
					value={search}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setSearch(e.target.value)
					}
				/>

				<select
					value={status}
					onChange={(e) => setStatus(e.target.value as typeof status)}
					style={{
						padding: 8,
						borderRadius: 6,
						border: '1px solid #ddd',
					}}>
					<option value='ALL'>{t('tenant.status.all')}</option>
					<option value='ACTIVE'>{t('tenant.status.active')}</option>
					<option value='SUSPENDED'>{t('tenant.status.suspended')}</option>
					<option value='DELETED'>{t('tenant.status.deleted')}</option>
				</select>
			</div>

			<div style={{ background: '#fff', borderRadius: 10 }}>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
						padding: 12,
						fontWeight: 600,
						background: '#f1f5f9',
					}}>
					<div>{t('common.name')}</div>
					<div>{t('tenant.slug')}</div>
					<div>{t('common.status')}</div>
					<div>{t('common.created_at')}</div>
					<div>{t('common.actions')}</div>
				</div>

				{loading ?
					<div style={{ padding: 20 }}>{t('common.loading')}</div>
				: filtered.length === 0 ?
					<div style={{ padding: 20, color: '#64748b' }}>
						{t('tenant.no_data')}
					</div>
				:	filtered.map((tenant) => (
						<div
							key={tenant.id}
							style={{
								display: 'grid',
								gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
								padding: 12,
								borderTop: '1px solid #eee',
								alignItems: 'center',
							}}>
							<div>
								<strong>{tenant.name}</strong>
							</div>

							<div>{tenant.slug}</div>

							<div>
								<span
									style={{
										padding: '4px 8px',
										borderRadius: 6,
										fontSize: 12,
										background:
											tenant.status === 'ACTIVE' ? '#dcfce7'
											: tenant.status === 'SUSPENDED' ? '#fef3c7'
											: '#fee2e2',
									}}>
									{t(`tenant.status.${tenant.status.toLowerCase()}`)}
								</span>
							</div>

							<div>
								{tenant.createdAt ?
									new Date(tenant.createdAt).toLocaleDateString(i18n.language)
								:	t('common.na')}
							</div>

							<div style={{ display: 'flex', gap: 6 }}>
								<Button
									onClick={() => console.log('edit', tenant.id)}
									style={{ padding: '4px 8px' }}>
									{t('common.edit')}
								</Button>

								<Button
									onClick={() => remove(tenant.id)}
									style={{
										padding: '4px 8px',
										background: 'red',
									}}>
									{t('common.delete')}
								</Button>
							</div>
						</div>
					))
				}
			</div>
		</div>
	);
}

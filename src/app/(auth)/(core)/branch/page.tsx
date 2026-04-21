/** @format */

'use client';

import { useEffect, useState } from 'react';
import { OrgService } from '@/services/org.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
export default function BranchPage() {
	const [branches, setBranches] = useState<any[]>([]);
	const [companies, setCompanies] = useState<any[]>([]);
	const { t } = useTranslation();

	const [name, setName] = useState('');
	const [companyId, setCompanyId] = useState('');

	//////////////////////////////////////////////////////
	// LOAD
	//////////////////////////////////////////////////////
	const load = async () => {
		const [b, c] = await Promise.all([
			OrgService.getBranches(),
			OrgService.getCompanies(),
		]);

		setBranches(b.data || []);
		setCompanies(c.data || []);
	};

	useEffect(() => {
		load();
	}, []);

	//////////////////////////////////////////////////////
	// CREATE
	//////////////////////////////////////////////////////
	const create = async () => {
		if (!name || !companyId) return;

		await OrgService.createBranch({
			name,
			companyId,
		});

		setName('');
		load();
	};

	//////////////////////////////////////////////////////
	// UI
	//////////////////////////////////////////////////////
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
			<h1 style={{ fontSize: 24, fontWeight: 700 }}>{t('branch.title')}</h1>

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
					placeholder={t('branch.name_placeholder')}
					value={name}
					onChange={(e: any) => setName(e.target.value)}
				/>

				<select
					value={companyId}
					onChange={(e) => setCompanyId(e.target.value)}
					style={{
						padding: 8,
						borderRadius: 6,
						border: '1px solid #ddd',
					}}>
					<option value=''>{t('company.select')}</option>
					{companies.map((c) => (
						<option
							key={c.id}
							value={c.id}>
							{c.name}
						</option>
					))}
				</select>

				<Button onClick={create}>{t('common.create')}</Button>
			</div>

			{/* LIST */}
			<div style={{ background: '#fff', borderRadius: 10 }}>
				{branches.map((b) => (
					<div
						key={b.id}
						style={{
							padding: 12,
							borderBottom: '1px solid #eee',
							display: 'flex',
							justifyContent: 'space-between',
						}}>
						<div>
							<strong>{b.name}</strong>
							<div style={{ fontSize: 12, color: '#64748b' }}>
								{t('company.label')}: {b.company?.name}
							</div>
						</div>

						<Button
							onClick={() => OrgService.deleteBranch(b.id).then(load)}
							style={{ background: 'red' }}>
							{t('common.delete')}
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}

/** @format */

'use client';

import { useEffect, useState } from 'react';
import { BillingService } from '@/services/billing.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
export default function PlansPage() {
	const [plans, setPlans] = useState<any[]>([]);
	const { t } = useTranslation();

	const [form, setForm] = useState({
		name: '',
		price: '',
		interval: 'monthly',
	});

	//////////////////////////////////////////////////////
	// LOAD
	//////////////////////////////////////////////////////
	const load = async () => {
		const res = await BillingService.getPlans();
		setPlans(res.data || []);
	};

	useEffect(() => {
		load();
	}, []);

	//////////////////////////////////////////////////////
	// CREATE PLAN
	//////////////////////////////////////////////////////
	const create = async () => {
		await BillingService.createPlan({
			...form,
			price: Number(form.price),
			features: {},
		});

		setForm({ name: '', price: '', interval: 'monthly' });
		load();
	};

	//////////////////////////////////////////////////////
	// UI
	//////////////////////////////////////////////////////
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
			<h1 style={{ fontSize: 24, fontWeight: 700 }}>{t('plan.title')}</h1>

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
					placeholder={t('plan.name')}
					value={form.name}
					onChange={(e: any) => setForm({ ...form, name: e.target.value })}
				/>

				<Input
					placeholder={t('plan.price')}
					value={form.price}
					onChange={(e: any) => setForm({ ...form, price: e.target.value })}
				/>

				<select
					value={form.interval}
					onChange={(e) => setForm({ ...form, interval: e.target.value })}>
					<option value='monthly'>{t('plan.interval.monthly')}</option>
					<option value='yearly'>{t('plan.interval.yearly')}</option>
				</select>

				<Button onClick={create}>{t('common.create')}</Button>
			</div>

			{/* LIST */}
			<div style={{ background: '#fff', borderRadius: 10 }}>
				{plans.map((p) => (
					<div
						key={p.id}
						style={{
							padding: 12,
							borderBottom: '1px solid #eee',
							display: 'flex',
							justifyContent: 'space-between',
						}}>
						<div>
							<strong>{p.name}</strong>
							<div style={{ fontSize: 12, color: '#64748b' }}>
								${p.price} / {t(`plan.interval.${p.interval}`)}
							</div>
						</div>

						<Button
							onClick={() => BillingService.deletePlan(p.id).then(load)}
							style={{ background: 'red' }}>
							{t('common.delete')}
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}

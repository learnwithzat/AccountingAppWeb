/** @format */

'use client';

import { useEffect, useState } from 'react';
import { BillingService } from '@/services/billing.service';
import { useTranslation } from 'react-i18next';
export default function SubscriptionPage() {
	const [subs, setSubs] = useState<any[]>([]);
	const [plans, setPlans] = useState<any[]>([]);
	const { t } = useTranslation();
	const [tenantId, setTenantId] = useState('');
	const [planId, setPlanId] = useState('');

	//////////////////////////////////////////////////////
	// LOAD
	//////////////////////////////////////////////////////
	const load = async () => {
		const [s, p] = await Promise.all([
			BillingService.getSubscriptions(),
			BillingService.getPlans(),
		]);

		setSubs(s.data || []);
		setPlans(p.data || []);
	};

	useEffect(() => {
		load();
	}, []);

	//////////////////////////////////////////////////////
	// ASSIGN PLAN
	//////////////////////////////////////////////////////
	const assign = async () => {
		await BillingService.assignPlan({
			tenantId,
			planId,
		});

		setTenantId('');
		setPlanId('');
		load();
	};

	//////////////////////////////////////////////////////
	// UI
	//////////////////////////////////////////////////////
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
			<h1 style={{ fontSize: 24, fontWeight: 700 }}>
				{t('subscription.title')}
			</h1>

			{/* ASSIGN PLAN */}
			<div
				style={{
					background: '#fff',
					padding: 16,
					borderRadius: 10,
					display: 'flex',
					gap: 10,
				}}>
				<input
					placeholder={t('tenant.id_placeholder')}
					value={tenantId}
					onChange={(e) => setTenantId(e.target.value)}
				/>

				<select
					value={planId}
					onChange={(e) => setPlanId(e.target.value)}>
					<option value=''>{t('plan.select')}</option>
					{plans.map((p) => (
						<option
							key={p.id}
							value={p.id}>
							{p.name}
						</option>
					))}
				</select>

				<button onClick={assign}>{t('subscription.assign')}</button>
			</div>

			{/* LIST */}
			<div style={{ background: '#fff', borderRadius: 10 }}>
				{subs.map((s) => (
					<div
						key={s.id}
						style={{
							padding: 12,
							borderBottom: '1px solid #eee',
							display: 'flex',
							justifyContent: 'space-between',
						}}>
						<div>
							<strong>{s.tenant?.name}</strong>
							<div style={{ fontSize: 12 }}>
								{t('subscription.plan')}: {s.plan?.name}
							</div>
						</div>

						<span
							style={{
								padding: '4px 8px',
								borderRadius: 6,
								fontSize: 12,
								background: s.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
							}}>
							{t(`subscription.status.${s.status.toLowerCase()}`)}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

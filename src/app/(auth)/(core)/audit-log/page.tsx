/** @format */

'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { AuditLogService } from '@/services/audit-log.service';
import { useTranslation } from 'react-i18next';
export default function AuditPage() {
	const [logs, setLogs] = useState<any[]>([]);
	const [search, setSearch] = useState('');
	const { t } = useTranslation();

	//////////////////////////////////////////////////////
	// LOAD LOGS
	//////////////////////////////////////////////////////
	const load = async () => {
		const res = await AuditLogService.getAll();
		setLogs(res.data || []);
	};

	useEffect(() => {
		load();
	}, []);

	//////////////////////////////////////////////////////
	// FILTER CLIENT SIDE
	//////////////////////////////////////////////////////
	const filtered = logs.filter(
		(l) =>
			l.action?.toLowerCase().includes(search.toLowerCase()) ||
			l.entity?.toLowerCase().includes(search.toLowerCase()),
	);

	//////////////////////////////////////////////////////
	// UI
	//////////////////////////////////////////////////////
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
			{/* HEADER */}
			<div>
				<h1 style={{ fontSize: 24, fontWeight: 700 }}>{t('audit.title')}</h1>
				<p style={{ color: '#64748b' }}>{t('audit.description')}</p>
			</div>

			{/* SEARCH */}
			<div
				style={{
					background: '#fff',
					padding: 16,
					borderRadius: 10,
				}}>
				<Input
					placeholder={t('audit.search_placeholder')}
					value={search}
					onChange={(e: any) => setSearch(e.target.value)}
				/>
			</div>

			{/* LOG LIST */}
			<div style={{ background: '#fff', borderRadius: 10 }}>
				{filtered.map((log) => (
					<div
						key={log.id}
						style={{
							padding: 12,
							borderBottom: '1px solid #eee',
							display: 'flex',
							flexDirection: 'column',
							gap: 4,
						}}>
						{/* ACTION */}
						<div style={{ fontWeight: 600 }}>{log.action}</div>

						{/* META */}
						<div style={{ fontSize: 12, color: '#64748b' }}>
							{t('audit.entity')}: {log.entity} | {t('auth.user')}: {log.userId}
						</div>

						{/* EXTRA */}
						<div style={{ fontSize: 12 }}>
							{t('audit.ip')}: {log.ip} |{' '}
							{new Date(log.createdAt).toLocaleString()}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

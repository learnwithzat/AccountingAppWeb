/** @format */

'use client';

import { useEffect, useState } from 'react';
import { MembershipService } from '@/services/membership.service';

type Membership = {
	id: string;
	userId: string;
	tenantId: string;
	role?: {
		name: string;
	};
	user?: {
		name: string;
		email: string;
	};
	tenant?: {
		name: string;
	};
};

export default function Page() {
	const [data, setData] = useState<Membership[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	//////////////////////////////////////////////////////
	// LOAD (SAFE)
	//////////////////////////////////////////////////////
	useEffect(() => {
		let mounted = true;

		const load = async () => {
			try {
				setLoading(true);
				setError(null);

				const res = await MembershipService.getAll();

				if (!mounted) return;

				setData(res?.data || []);
			} catch (err) {
				console.error(err);
				if (mounted) setError('Failed to load memberships');
			} finally {
				if (mounted) setLoading(false);
			}
		};

		load();

		return () => {
			mounted = false;
		};
	}, []);

	//////////////////////////////////////////////////////
	// UI
	//////////////////////////////////////////////////////
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
			<h1 style={{ fontSize: 24, fontWeight: 700 }}>Memberships</h1>

			{loading && <div>Loading...</div>}

			{error && <div style={{ color: 'red' }}>{error}</div>}

			{!loading && !error && data.length === 0 && (
				<div style={{ color: '#64748b' }}>No memberships found</div>
			)}

			{!loading && !error && data.length > 0 && (
				<div
					style={{
						background: '#fff',
						borderRadius: 10,
					}}>
					{data.map((x) => (
						<div
							key={x.id}
							style={{
								padding: 12,
								borderTop: '1px solid #eee',
							}}>
							<div>
								<strong>{x.user?.name || x.userId}</strong>
							</div>

							<div style={{ fontSize: 13, color: '#64748b' }}>
								{x.user?.email}
							</div>

							<div style={{ marginTop: 6 }}>
								Tenant: <strong>{x.tenant?.name || x.tenantId}</strong>
							</div>

							<div style={{ fontSize: 12 }}>Role: {x.role?.name || 'N/A'}</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

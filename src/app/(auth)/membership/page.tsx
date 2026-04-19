/** @format */

'use client';

import { useEffect, useState } from 'react';
import { MembershipService } from '@/services/membership.service';
import { Button } from '@/components/ui/button';

export default function Page() {
	const [data, setData] = useState<any[]>([]);

	const load = async () => {
		const res = await MembershipService.getAll();
		setData(res.data);
	};

	useEffect(() => {
		load();
	}, []);

	return (
		<div>
			<h1>Memberships</h1>

			<ul>
				{data.map((x) => (
					<li key={x.id}>
						User: {x.userId} | Tenant: {x.tenantId}
					</li>
				))}
			</ul>
		</div>
	);
}

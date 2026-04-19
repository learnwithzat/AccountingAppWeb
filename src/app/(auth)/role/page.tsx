/** @format */

'use client';

import { useEffect, useState } from 'react';
import { RoleService } from '@/services/role.service';

export default function RolePage() {
	const [roles, setRoles] = useState<any[]>([]);
	const [permissions, setPermissions] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);

	//////////////////////////////////////////////////////
	// LOAD
	//////////////////////////////////////////////////////
	const load = async () => {
		setLoading(true);

		try {
			const [r, p] = await Promise.all([
				RoleService.getAll(),
				RoleService.getPermissions(),
			]);

			setRoles(r.data || []);
			setPermissions(p.data || []);
		} catch (err) {
			console.error(err);
		}

		setLoading(false);
	};

	useEffect(() => {
		load();
	}, []);

	//////////////////////////////////////////////////////
	// CHECK
	//////////////////////////////////////////////////////
	const hasPermission = (role: any, permissionId: string) => {
		return role.permissions?.some(
			(rp: any) => rp.permissionId === permissionId
		);
	};

	//////////////////////////////////////////////////////
	// FIXED: SMART TOGGLE (BATCH STYLE)
	//////////////////////////////////////////////////////
	const toggle = async (role: any, permissionId: string) => {
		const current = role.permissions?.map((p: any) => p.permissionId) || [];

		const updated =
			current.includes(permissionId) ?
				current.filter((id: string) => id !== permissionId)
			:	[...current, permissionId];

		await RoleService.assignPermissions(role.id, updated);

		load();
	};

	//////////////////////////////////////////////////////
	// UI
	//////////////////////////////////////////////////////
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
			<div>
				<h1 style={{ fontSize: 24, fontWeight: 700 }}>
					Role & Permission Matrix
				</h1>
				<p style={{ color: '#64748b' }}>AWS IAM-style access control system</p>
			</div>

			{/* MATRIX */}
			<div
				style={{
					overflowX: 'auto',
					background: '#fff',
					borderRadius: 10,
				}}>
				{/* HEADER */}
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: `200px repeat(${roles.length}, 160px)`,
						padding: 12,
						fontWeight: 600,
						background: '#f1f5f9',
					}}>
					<div>Permission</div>
					{roles.map((role) => (
						<div key={role.id}>{role.name}</div>
					))}
				</div>

				{/* ROWS */}
				{loading ?
					<div style={{ padding: 20 }}>Loading...</div>
				:	permissions.map((perm) => (
						<div
							key={perm.id}
							style={{
								display: 'grid',
								gridTemplateColumns: `200px repeat(${roles.length}, 160px)`,
								padding: 12,
								borderTop: '1px solid #eee',
								alignItems: 'center',
							}}>
							{/* PERMISSION */}
							<div>
								<strong>{perm.label}</strong>
								<div style={{ fontSize: 12, color: '#64748b' }}>{perm.key}</div>
							</div>

							{/* ROLE CHECKBOXES */}
							{roles.map((role) => (
								<div
									key={role.id}
									style={{ textAlign: 'center' }}>
									<input
										type='checkbox'
										checked={hasPermission(role, perm.id)}
										onChange={() => toggle(role, perm.id)}
										style={{ width: 18, height: 18, cursor: 'pointer' }}
									/>
								</div>
							))}
						</div>
					))
				}
			</div>
		</div>
	);
}

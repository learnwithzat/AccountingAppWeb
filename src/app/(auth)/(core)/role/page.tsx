/** @format */

'use client';

import { useEffect, useState } from 'react';
import { RoleService } from '@/services/role.service';

type Permission = {
	id: string;
	key: string;
	label: string;
};

type RolePermission = {
	permissionId: string;
};

type Role = {
	id: string;
	name: string;
	permissions?: RolePermission[];
};

export default function RolePage() {
	const [roles, setRoles] = useState<Role[]>([]);
	const [permissions, setPermissions] = useState<Permission[]>([]);
	const [loading, setLoading] = useState(false);

	//////////////////////////////////////////////////////
	// LOAD (SAFE)
	//////////////////////////////////////////////////////
	useEffect(() => {
		let mounted = true;

		const load = async () => {
			try {
				setLoading(true);

				const [r, p] = await Promise.all([
					RoleService.getAll(),
					RoleService.getPermissions(),
				]);

				if (!mounted) return;

				setRoles(r?.data || []);
				setPermissions(p?.data || []);
			} catch (err) {
				console.error(err);
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
	// CHECK
	//////////////////////////////////////////////////////
	const hasPermission = (role: Role, permissionId: string) => {
		return role.permissions?.some(
			(rp) => rp.permissionId === permissionId,
		);
	};

	//////////////////////////////////////////////////////
	// OPTIMISTIC TOGGLE (FAST UX)
	//////////////////////////////////////////////////////
	const toggle = async (role: Role, permissionId: string) => {
		const current =
			role.permissions?.map((p) => p.permissionId) || [];

		const updated =
			current.includes(permissionId)
				? current.filter((id) => id !== permissionId)
				: [...current, permissionId];

		// ✅ optimistic UI update
		setRoles((prev) =>
			prev.map((r) =>
				r.id === role.id
					? {
							...r,
							permissions: updated.map((id) => ({
								permissionId: id,
							})),
					  }
					: r,
			),
		);

		try {
			await RoleService.assignPermissions(role.id, updated);
		} catch (err) {
			console.error(err);

			// ❌ rollback on failure
			setRoles((prev) =>
				prev.map((r) =>
					r.id === role.id
						? role // restore original
						: r,
				),
			);

			alert('Failed to update permissions');
		}
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
				<p style={{ color: '#64748b' }}>
					AWS IAM-style access control system
				</p>
			</div>

			<div
				style={{
					overflowX: 'auto',
					background: '#fff',
					borderRadius: 10,
				}}>
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

				{loading ? (
					<div style={{ padding: 20 }}>Loading...</div>
				) : (
					permissions.map((perm) => (
						<div
							key={perm.id}
							style={{
								display: 'grid',
								gridTemplateColumns: `200px repeat(${roles.length}, 160px)`,
								padding: 12,
								borderTop: '1px solid #eee',
								alignItems: 'center',
							}}>
							<div>
								<strong>{perm.label}</strong>
								<div style={{ fontSize: 12, color: '#64748b' }}>
									{perm.key}
								</div>
							</div>

							{roles.map((role) => (
								<div
									key={role.id}
									style={{ textAlign: 'center' }}>
									<input
										type='checkbox'
										checked={hasPermission(role, perm.id)}
										onChange={() => toggle(role, perm.id)}
										style={{
											width: 18,
											height: 18,
											cursor: 'pointer',
										}}
									/>
								</div>
							))}
						</div>
					))
				)}
			</div>
		</div>
	);
}
/** @format */

import { api } from '@/lib/api';

export const RoleService = {
	//////////////////////////////////////////////////////
	// ROLES (TENANT SCOPED)
	//////////////////////////////////////////////////////
	getAll: (tenantId?: string) =>
		api.get('/role', {
			headers: tenantId ? { 'x-tenant-id': tenantId } : undefined,
		}),

	getOne: (id: string, tenantId?: string) =>
		api.get(`/role/${id}`, {
			headers: tenantId ? { 'x-tenant-id': tenantId } : undefined,
		}),

	create: (data: any, tenantId?: string) =>
		api.post('/role', data, {
			headers: tenantId ? { 'x-tenant-id': tenantId } : undefined,
		}),

	update: (id: string, data: any, tenantId?: string) =>
		api.patch(`/role/${id}`, data, {
			headers: tenantId ? { 'x-tenant-id': tenantId } : undefined,
		}),

	remove: (id: string, tenantId?: string) =>
		api.delete(`/role/${id}`, {
			headers: tenantId ? { 'x-tenant-id': tenantId } : undefined,
		}),

	//////////////////////////////////////////////////////
	// PERMISSIONS ASSIGNMENT (TENANT SAFE)
	//////////////////////////////////////////////////////
	assignPermissions: (id: string, permissionIds: string[], tenantId?: string) =>
		api.post(
			`/role/${id}/permissions`,
			{ permissionIds },
			{
				headers: tenantId ? { 'x-tenant-id': tenantId } : undefined,
			},
		),

	//////////////////////////////////////////////////////
	// SYSTEM PERMISSIONS (GLOBAL IAM)
	//////////////////////////////////////////////////////
	getPermissions: () => api.get('/permission'),
};

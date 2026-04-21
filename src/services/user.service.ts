/** @format */

import { api } from '@/lib/api';

export const UserService = {
	//////////////////////////////////////////////////////
	// GET USERS (TENANT SCOPED)
	//////////////////////////////////////////////////////
	getAll: (tenantId?: string | null) =>
		api.get('/users', {
			headers: tenantId ? { 'x-tenant-id': tenantId } : undefined,
		}),

	//////////////////////////////////////////////////////
	// GET SINGLE USER
	//////////////////////////////////////////////////////
	getOne: (id: string, tenantId?: string) =>
		api.get(`/users/${id}`, {
			headers: tenantId ? { 'x-tenant-id': tenantId } : undefined,
		}),

	//////////////////////////////////////////////////////
	// CREATE USER (IN CURRENT TENANT)
	//////////////////////////////////////////////////////
	create: (data: any, tenantId?: string) =>
		api.post('/users', data, {
			headers: tenantId ? { 'x-tenant-id': tenantId } : undefined,
		}),

	//////////////////////////////////////////////////////
	// UPDATE USER
	//////////////////////////////////////////////////////
	update: (id: string, data: any, tenantId?: string) =>
		api.patch(`/users/${id}`, data, {
			headers: tenantId ? { 'x-tenant-id': tenantId } : undefined,
		}),

	//////////////////////////////////////////////////////
	// DELETE USER
	//////////////////////////////////////////////////////
	remove: (id: string, tenantId?: string) =>
		api.delete(`/users/${id}`, {
			headers: tenantId ? { 'x-tenant-id': tenantId } : undefined,
		}),

	//////////////////////////////////////////////////////
	// ROLE ASSIGNMENT (TENANT-SAFE)
	//////////////////////////////////////////////////////
	assignRole: (data: { userId: string; roleId: string; tenantId?: string }) =>
		api.post('/users/assign-role', data, {
			headers: data.tenantId ? { 'x-tenant-id': data.tenantId } : undefined,
		}),

	//////////////////////////////////////////////////////
	// USER STATUS CONTROL (OPTIONAL SaaS FEATURE)
	//////////////////////////////////////////////////////
	toggleStatus: (id: string, tenantId?: string) =>
		api.patch(
			`/users/${id}/toggle-status`,
			{},
			{
				headers: tenantId ? { 'x-tenant-id': tenantId } : undefined,
			},
		),
};

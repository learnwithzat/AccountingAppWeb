/** @format */

import { api } from '@/lib/api';

export const OrgService = {
	//////////////////////////////////////////////////////
	// COMPANY
	//////////////////////////////////////////////////////
	getCompanies() {
		return api.get('/companies');
	},

	createCompany(data: { name: string }) {
		return api.post('/companies', data);
	},

	updateCompany(id: string, data: any) {
		return api.patch(`/companies/${id}`, data);
	},

	deleteCompany(id: string) {
		return api.delete(`/companies/${id}`);
	},

	//////////////////////////////////////////////////////
	// BRANCH
	//////////////////////////////////////////////////////
	getBranches(companyId?: string) {
		return api.get('/branches', {
			params: { companyId },
		});
	},

	createBranch(data: { name: string; companyId: string }) {
		return api.post('/branches', data);
	},

	updateBranch(id: string, data: any) {
		return api.patch(`/branches/${id}`, data);
	},

	deleteBranch(id: string) {
		return api.delete(`/branches/${id}`);
	},
};

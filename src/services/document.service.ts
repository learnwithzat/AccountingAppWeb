/** @format */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class DocumentService {
	private getAuthHeaders() {
		const token = localStorage.getItem('token'); // or Zustand/auth store
		const tenantId = localStorage.getItem('tenantId');

		return {
			Authorization: `Bearer ${token}`,
			'x-tenant-id': tenantId || '',
		};
	}

	async getAll() {
		const res = await axios.get(`${API_URL}/documents`, {
			headers: this.getAuthHeaders(),
		});

		return res.data;
	}

	async create(data: any) {
		const res = await axios.post(`${API_URL}/documents`, data, {
			headers: this.getAuthHeaders(),
		});

		return res.data;
	}

	async update(id: string, data: any) {
		const res = await axios.patch(`${API_URL}/documents/${id}`, data, {
			headers: this.getAuthHeaders(),
		});

		return res.data;
	}

	async delete(id: string) {
		const res = await axios.delete(`${API_URL}/documents/${id}`, {
			headers: this.getAuthHeaders(),
		});

		return res.data;
	}
}

export const documentService = new DocumentService();

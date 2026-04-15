/** @format */

import axios from 'axios';

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
	// 1. Attach JWT Token
	const token =
		typeof window !== 'undefined' ? localStorage.getItem('token') : null;
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	// 2. Attach Tenant Slug from subdomain
	if (typeof window !== 'undefined') {
		const hostname = window.location.hostname;
		// For local dev: tenant1.localhost -> tenant1
		// For prod: tenant1.zatgo.com -> tenant1
		const parts = hostname.split('.');
		if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost') {
			config.headers['X-Tenant-Id'] = parts[0];
		} else {
			// Fallback or handle root domain case
			config.headers['X-Tenant-Id'] = localStorage.getItem('tenant_slug');
		}
	}

	return config;
});

export default api;

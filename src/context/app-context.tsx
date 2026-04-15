/** @format */

'use client';

import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from 'react';
import api from '@/lib/api-client';

interface User {
	id: string;
	username: string; // Changed from email to username
	role: string;
	tenantId: string;
}

interface AppContextType {
	user: User | null;
	tenantSlug: string | null;
	isLoading: boolean;
	login: (token: string) => Promise<void>;
	logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [tenantSlug, setTenantSlug] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Detect Tenant from Subdomain
	useEffect(() => {
		const hostname = window.location.hostname;
		const parts = hostname.split('.');
		if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost') {
			setTenantSlug(parts[0]);
		}
	}, []);

	// Initial Auth Check
	useEffect(() => {
		const checkAuth = async () => {
			const token = localStorage.getItem('token');
			if (!token) {
				setIsLoading(false);
				return;
			}

			try {
				// Assuming your backend has a /users/me or similar profile endpoint
				const response = await api.get('/users/me');
				setUser(response.data);
			} catch (error) {
				console.error('Failed to restore session:', error);
				localStorage.removeItem('token');
			} finally {
				setIsLoading(false);
			}
		};

		checkAuth();
	}, []);

	const login = async (token: string) => {
		localStorage.setItem('token', token);
		const response = await api.get('/users/me');
		setUser(response.data);
	};

	const logout = () => {
		localStorage.removeItem('token');
		setUser(null);
		window.location.href = '/login';
	};

	return (
		<AppContext.Provider value={{ user, tenantSlug, isLoading, login, logout }}>
			{children}
		</AppContext.Provider>
	);
}

export function useApp() {
	const context = useContext(AppContext);
	if (context === undefined) {
		throw new Error('useApp must be used within an AppProvider');
	}
	return context;
}

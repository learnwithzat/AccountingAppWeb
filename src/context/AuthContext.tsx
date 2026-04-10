/** @format */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type AuthUser = {
	id: string;
	username: string;
	companyId: string;
	companyName: string;
	role: string;
};

type AuthContextType = {
	user: AuthUser | null;
	companyId: string | null;
	loading: boolean;
	logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
	user: null,
	companyId: null,
	loading: true,
	logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [loading, setLoading] = useState(true);

	const parseToken = (token: string): AuthUser | null => {
		try {
			const payload = JSON.parse(atob(token.split('.')[1]));

			return {
				id: payload.sub,
				username: payload.username,
				companyId: payload.companyId,
				companyName: payload.companyName,
				role: payload.role,
			};
		} catch {
			return null;
		}
	};

	useEffect(() => {
		const token = localStorage.getItem('token');

		if (token) {
			const u = parseToken(token);
			setUser(u);
		}

		setLoading(false);
	}, []);

	const logout = () => {
		localStorage.removeItem('token');
		window.location.href = '/login';
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				companyId: user?.companyId || null,
				loading,
				logout,
			}}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);

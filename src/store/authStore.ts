/** @format */

import { create } from 'zustand';

export type AuthUser = {
	id: string;
	username: string;
	companyId: string;
	companyName: string;
	role: string;
};

interface AuthState {
	user: AuthUser | null;
	loading: boolean;
	setUser: (user: AuthUser | null) => void;
	setLoading: (loading: boolean) => void;
	initialize: () => void;
	logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	loading: true,
	setUser: (user) => set({ user }),
	setLoading: (loading) => set({ loading }),
	initialize: () => {
		if (typeof window === 'undefined') return;

		const token = localStorage.getItem('token');
		if (!token) {
			set({ loading: false });
			return;
		}

		try {
			const payload = JSON.parse(atob(token.split('.')[1]));
			set({
				user: {
					id: payload.sub,
					username: payload.username,
					companyId: payload.companyId,
					companyName: payload.companyName,
					role: payload.role,
				},
				loading: false,
			});
		} catch (error) {
			console.error('Auth initialization failed:', error);
			set({ loading: false });
		}
	},
	logout: () => {
		localStorage.removeItem('token');
		set({ user: null });
		window.location.href = '/login';
	},
}));

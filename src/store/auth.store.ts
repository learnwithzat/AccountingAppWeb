/** @format */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
	token: string | null;
	tenantId: string | null;

	setToken: (t: string | null) => void;
	setTenantId: (id: string | null) => void;

	logout: () => void;
};

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			token: null,
			tenantId: null,

			setToken: (t) => set({ token: t }),
			setTenantId: (id) => set({ tenantId: id }),

			logout: () =>
				set({
					token: null,
					tenantId: null,
				}),
		}),
		{
			name: 'auth-storage', // localStorage key
		}
	)
);

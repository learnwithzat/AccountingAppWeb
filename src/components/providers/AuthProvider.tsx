/** @format */
'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AuthService } from '@/services/auth.service';

type Membership = {
	tenant: { id: string };
	role: {
		permissions?: { permission: { key: string } }[];
	};
};

type AuthContextType = {
	user: any;
	tenant: any;
	role: any;
	memberships: Membership[];
	permissions: string[];
	activeTenantId?: string;
	loading: boolean;
	isAuthenticated: boolean;
	switchTenant: (tenantId: string) => Promise<void>;
	logout: () => void;
	refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<any>(null);
	const [tenant, setTenant] = useState<any>(null);
	const [role, setRole] = useState<any>(null);
	const [memberships, setMemberships] = useState<Membership[]>([]);
	const [permissions, setPermissions] = useState<string[]>([]);
	const [activeTenantId, setActiveTenantId] = useState<string>();
	const [loading, setLoading] = useState(true);

	const mountedRef = useRef(true);

	//////////////////////////////////////////////////////
	// HELPERS
	//////////////////////////////////////////////////////
	const extractPermissions = (role: any) =>
		role?.permissions?.map((p: any) => p.permission.key) || [];

	const resetState = () => {
		setUser(null);
		setTenant(null);
		setRole(null);
		setMemberships([]);
		setPermissions([]);
		setActiveTenantId(undefined);
	};

	//////////////////////////////////////////////////////
	// LOGOUT
	//////////////////////////////////////////////////////
	const logout = () => {
		AuthService.logout();
		resetState();
	};

	//////////////////////////////////////////////////////
	// APPLY MEMBERSHIP
	//////////////////////////////////////////////////////
	const applyMembership = (membership: Membership) => {
		const tenantData = membership.tenant;
		const roleData = membership.role;

		setTenant(tenantData);
		setRole(roleData);
		setActiveTenantId(tenantData.id);
		setPermissions(extractPermissions(roleData));

		AuthService.setTenant(tenantData.id);
	};

	//////////////////////////////////////////////////////
	// SWITCH TENANT
	//////////////////////////////////////////////////////
	const switchTenant = async (tenantId: string) => {
		const membership = memberships.find((m) => m?.tenant?.id === tenantId);

		if (!membership) {
			console.warn('Tenant not found:', tenantId);
			return;
		}

		applyMembership(membership);
	};

	//////////////////////////////////////////////////////
	// INIT AUTH (Single Source of Truth)
	//////////////////////////////////////////////////////
	const initAuth = async () => {
		try {
			setLoading(true);

			const token = AuthService.getToken();
			if (!token) return logout();

			const userData = await AuthService.me();
			if (!mountedRef.current) return;

			if (!userData) return logout();

			const allMemberships: Membership[] = userData.memberships || [];
			if (!allMemberships.length) return logout();

			setUser(userData);
			setMemberships(allMemberships);

			const savedTenant = AuthService.getTenant?.();

			const membership =
				allMemberships.find((m) => m?.tenant?.id === savedTenant) ||
				allMemberships[0];

			if (!membership) return logout();

			applyMembership(membership);
		} catch (err) {
			console.error('AUTH ERROR:', err);
			logout();
		} finally {
			if (mountedRef.current) setLoading(false);
		}
	};

	//////////////////////////////////////////////////////
	// REFRESH
	//////////////////////////////////////////////////////
	const refreshAuth = async () => {
		await initAuth();
	};

	//////////////////////////////////////////////////////
	// INIT (ONLY ONCE)
	//////////////////////////////////////////////////////
	useEffect(() => {
		mountedRef.current = true;
		initAuth();

		return () => {
			mountedRef.current = false;
		};
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				tenant,
				role,
				memberships,
				permissions,
				activeTenantId,
				loading,
				isAuthenticated: !!user,
				switchTenant,
				logout,
				refreshAuth,
			}}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be inside AuthProvider');
	return ctx;
}

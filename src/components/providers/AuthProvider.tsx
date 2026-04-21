/** @format */

'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AuthService } from '@/services/auth.service';

type AuthContextType = {
	user: any;
	tenant: any;
	role: any;
	memberships: any[];
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
	const [memberships, setMemberships] = useState<any[]>([]);
	const [permissions, setPermissions] = useState<string[]>([]);
	const [activeTenantId, setActiveTenantId] = useState<string | undefined>(
		undefined,
	);
	const [loading, setLoading] = useState(true);

	const mountedRef = useRef(true);

	//////////////////////////////////////////////////////
	// LOGOUT
	//////////////////////////////////////////////////////
	const logout = () => {
		AuthService.logout();

		setUser(null);
		setTenant(null);
		setRole(null);
		setMemberships([]);
		setPermissions([]);
		setActiveTenantId(undefined);
	};

	//////////////////////////////////////////////////////
	// SWITCH TENANT
	//////////////////////////////////////////////////////
	const switchTenant = async (tenantId: string) => {
		if (!user) return;

		const membership = memberships.find((m: any) => m?.tenant?.id === tenantId);

		if (!membership) {
			console.warn('Tenant not found:', tenantId);
			return;
		}

		const tenantData = membership.tenant;
		const roleData = membership.role;

		setTenant(tenantData);
		setRole(roleData);
		setActiveTenantId(tenantId);

		const perms =
			roleData?.permissions?.map((p: any) => p.permission.key) || [];

		setPermissions(perms);

		AuthService.setTenant(tenantId);
	};

	//////////////////////////////////////////////////////
	// INIT AUTH
	//////////////////////////////////////////////////////
	const initAuth = async () => {
		try {
			setLoading(true);

			const token = AuthService.getToken();

			if (!token) {
				logout();
				return;
			}

			const userData = await AuthService.me();
			if (!mountedRef.current) return;

			if (!userData) {
				logout();
				return;
			}

			const allMemberships = userData.memberships || [];
			setMemberships(allMemberships);

			const savedTenant = AuthService.getTenant?.();

			const membership =
				allMemberships.find(
					(m: { tenant?: { id?: string } }) => m?.tenant?.id === savedTenant,
				) ?? allMemberships[0];

			if (!membership) {
				logout();
				return;
			}

			const tenantData = membership.tenant;
			const roleData = membership.role;

			setUser(userData);
			setTenant(tenantData);
			setRole(roleData);
			setActiveTenantId(tenantData.id);

			const perms =
				roleData?.permissions?.map((p: any) => p.permission.key) || [];

			setPermissions(perms);

			AuthService.setTenant(tenantData.id);
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
	// INIT
	//////////////////////////////////////////////////////
	useEffect(() => {
		if (!activeTenantId && activeTenantId !== undefined) return;

		let mounted = true;

		const run = async () => {
			try {
				setLoading(true);

				const token = AuthService.getToken();
				if (!token) {
					if (mounted) logout();
					return;
				}

				const userData = await AuthService.me();
				if (!mounted) return;

				if (!userData) {
					if (mounted) logout();
					return;
				}

				const allMemberships = userData.memberships || [];
				setMemberships(allMemberships);

				const savedTenant = AuthService.getTenant?.();

				let membership =
					allMemberships.find((m: any) => m?.tenant?.id === savedTenant) ||
					allMemberships[0];

				if (!membership) {
					if (mounted) logout();
					return;
				}

				const tenantData = membership.tenant;
				const roleData = membership.role;

				setUser(userData);
				setTenant(tenantData);
				setRole(roleData);
				setActiveTenantId(tenantData.id);

				const perms =
					roleData?.permissions?.map((p: any) => p.permission.key) || [];

				setPermissions(perms);

				AuthService.setTenant(tenantData.id);
			} catch (err) {
				console.error('AUTH ERROR:', err);
				if (mounted) logout();
			} finally {
				if (mounted) setLoading(false);
			}
		};

		run();

		return () => {
			mounted = false;
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

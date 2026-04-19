/** @format */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '@/services/auth.service';
import { TenantService } from '@/services/tenant.service';

type AuthContextType = {
	user: any;
	tenant: any;
	role: any;
	permissions: string[];
	loading: boolean;
	isAuthenticated: boolean;
	logout: () => void;
	refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<any>(null);
	const [tenant, setTenant] = useState<any>(null);
	const [role, setRole] = useState<any>(null);
	const [permissions, setPermissions] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);

	//////////////////////////////////////////////////////
	// LOGOUT
	//////////////////////////////////////////////////////
	const logout = () => {
		AuthService.logout();
		setUser(null);
		setTenant(null);
		setRole(null);
		setPermissions([]);
	};

	//////////////////////////////////////////////////////
	// REFRESH AUTH (USED AFTER LOGIN / TENANT SWITCH)
	//////////////////////////////////////////////////////
	const refreshAuth = async () => {
		await initAuth();
	};

	//////////////////////////////////////////////////////
	// INIT AUTH CORE LOGIC
	//////////////////////////////////////////////////////
	const initAuth = async () => {
		try {
			setLoading(true);

			const token = AuthService.getToken();

			if (!token) {
				logout();
				return;
			}

			//////////////////////////////////////////////////////
			// 1. LOAD USER
			//////////////////////////////////////////////////////
			const userData = await AuthService.me();

			if (!userData) {
				logout();
				return;
			}

			//////////////////////////////////////////////////////
			// 2. ACTIVE MEMBERSHIP
			//////////////////////////////////////////////////////
			const membership =
				userData.memberships?.find((m: any) => m.isActive) ||
				userData.memberships?.[0];

			if (!membership) {
				logout();
				return;
			}

			const tenantData = membership.tenant;
			const roleData = membership.role;

			AuthService.setTenant(tenantData.id);

			//////////////////////////////////////////////////////
			// 3. LOAD PERMISSIONS (FROM ROLE)
			//////////////////////////////////////////////////////
			const perms =
				roleData?.permissions?.map((p: any) => p.permission.key) || [];

			//////////////////////////////////////////////////////
			// 4. SET STATE
			//////////////////////////////////////////////////////
			setUser(userData);
			setTenant(tenantData);
			setRole(roleData);
			setPermissions(perms);
		} catch (err) {
			console.error('AUTH ERROR:', err);
			logout();
		} finally {
			setLoading(false);
		}
	};

	//////////////////////////////////////////////////////
	// INIT ON MOUNT
	//////////////////////////////////////////////////////
	useEffect(() => {
		let mounted = true;

		(async () => {
			if (mounted) {
				await initAuth();
			}
		})();

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
				permissions,
				loading,
				isAuthenticated: !!user,
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

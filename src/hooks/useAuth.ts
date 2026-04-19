/** @format */

import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

export const useAuth = () => {
	const { token, setToken } = useAuthStore();

	const login = async (email: string, password: string) => {
		const t = await AuthService.login(email, password);
		setToken(t);
	};

	const logout = () => {
		AuthService.logout();
		setToken(null);
	};

	return {
		token,
		login,
		logout,
		isLoggedIn: !!token,
	};
};

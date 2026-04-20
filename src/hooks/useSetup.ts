/** @format */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';

export const useSetup = () => {
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSetup = async (data: any) => {
		setError('');

		const { tenantName, slug, name, email, username, password } = data;

		if (!tenantName || !slug || !name || !email || !username || !password) {
			setError('All fields are required');
			return false;
		}

		try {
			setLoading(true);

			const res = await AuthService.setup(data);

			// ✅ unified storage
			localStorage.setItem('token', res.access_token);
			localStorage.setItem('tenantId', res.tenant.id);

			router.replace('/dashboard'); // ✅ unified redirect

			return true;
		} catch (err: any) {
			setError(err?.response?.data?.message || 'Something went wrong');
			return false;
		} finally {
			setLoading(false);
		}
	};

	return { handleSetup, loading, error };
};

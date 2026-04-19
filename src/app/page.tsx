/** @format */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';

export default function RootPage() {
	const router = useRouter();

	useEffect(() => {
		const token = AuthService.getToken();

		if (!token) {
			router.replace('/login');
			return;
		}

		router.replace('/dashboard');
	}, []);

	return <div style={{ padding: 40 }}>Loading...</div>;
}

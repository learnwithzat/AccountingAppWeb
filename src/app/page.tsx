/** @format */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/providers/AuthProvider';

/**
 * Root redirect page — waits for the auth context to resolve before
 * navigating, so we never flash a redirect based on a stale/missing token.
 */
export default function RootPage() {
	const router = useRouter();
	const { loading, isAuthenticated } = useAuth();

	useEffect(() => {
		if (loading) return;
		router.replace(isAuthenticated ? '/dashboard' : '/login');
	}, [loading, isAuthenticated, router]);

	// Render nothing visible — the redirect happens immediately after hydration.
	return null;
}
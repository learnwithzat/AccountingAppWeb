/** @format */

'use client';

import { useEffect, useState } from 'react';

export function useTenant() {
	const [slug, setSlug] = useState<string | null>(null);

	useEffect(() => {
		const hostname = window.location.hostname;
		const parts = hostname.split('.');
		if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost') {
			setSlug(parts[0]);
		}
	}, []);

	return { slug, isRoot: !slug };
}

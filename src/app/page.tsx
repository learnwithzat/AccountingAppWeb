/** @format */

import { redirect } from 'next/navigation';

export default function Home() {
	const isLoggedIn = false; // replace with real auth check

	if (isLoggedIn) {
		redirect('/dashboard');
	} else {
		redirect('/login');
	}

	return null;
}

/** @format */

export const saveToken = (token: string) => {
	localStorage.setItem('token', token);
};

export const getToken = () => {
	if (typeof window === 'undefined') return null;
	return localStorage.getItem('token');
};

export const logout = () => {
	localStorage.removeItem('token');
	window.location.href = '/login';
};

/* ✅ ADD THIS */
export const getUserFromToken = () => {
	const token = getToken();
	if (!token) return null;

	try {
		const payload = token.split('.')[1];
		const decoded = JSON.parse(atob(payload));
		return decoded;
	} catch (e) {
		console.error('Invalid token', e);
		return null;
	}
};

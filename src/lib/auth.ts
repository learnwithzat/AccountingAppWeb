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

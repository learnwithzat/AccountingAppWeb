/** @format */

import { create } from 'zustand';

export type AuthUser = {
	id: string;
	username: string;
	companyId: string;
	companyName: string;
	role: string;
};

interface AuthState {
	user: AuthUser | null;
	loading: boolean;
	lastActivityTime: number; // Timestamp of the last user activity
	inactivityTimeoutId: NodeJS.Timeout | null; // ID of the inactivity timer
}

interface AuthActions {
	setUser: (user: AuthUser | null) => void;
	setLoading: (loading: boolean) => void;
	initialize: () => void;
	logout: () => void;
	resetInactivityTimer: () => void;
	_setupActivityListeners: () => void; // Internal helper to set up event listeners
	_removeActivityListeners: () => void; // Internal helper to remove event listeners
}

type AuthStore = AuthState & AuthActions;

// Configurable timeout via NEXT_PUBLIC_INACTIVITY_TIMEOUT (in minutes)
// Defaults to 5 minutes if the environment variable is missing or invalid
const envTimeout = process.env.NEXT_PUBLIC_INACTIVITY_TIMEOUT;
const parsedMinutes = envTimeout ? parseInt(envTimeout, 10) : 5;
const INACTIVITY_TIMEOUT =
	(isNaN(parsedMinutes) ? 5 : parsedMinutes) * 60 * 1000;

// Store references to event handlers to allow proper removal
let activityHandlers: { event: string; handler: () => void }[] = [];

export const useAuthStore = create<AuthStore>((set, get) => ({
	user: null,
	loading: true,
	lastActivityTime: Date.now(),
	inactivityTimeoutId: null,

	setUser: (user) => set({ user }),
	setLoading: (loading) => set({ loading }),

	resetInactivityTimer: () => {
		const { inactivityTimeoutId, logout } = get();
		if (inactivityTimeoutId) {
			clearTimeout(inactivityTimeoutId);
		}

		const newTimeoutId = setTimeout(() => {
			console.log('Session timed out due to inactivity.');
			logout();
		}, INACTIVITY_TIMEOUT);

		set({
			lastActivityTime: Date.now(),
			inactivityTimeoutId: newTimeoutId,
		});
	},

	_setupActivityListeners: () => {
		const { resetInactivityTimer } = get();

		// Ensure listeners are only added once, or removed before adding new ones
		if (activityHandlers.length > 0) {
			get()._removeActivityListeners();
		}

		const events = ['mousemove', 'keydown', 'click', 'scroll'];
		activityHandlers = events.map((event) => {
			const handler = () => resetInactivityTimer();
			window.addEventListener(event, handler);
			return { event, handler };
		});
		console.log('Activity listeners set up.');
	},

	_removeActivityListeners: () => {
		activityHandlers.forEach(({ event, handler }) => {
			window.removeEventListener(event, handler);
		});
		activityHandlers = [];
		console.log('Activity listeners removed.');
	},

	initialize: () => {
		if (typeof window === 'undefined') return;

		const currentPath = window.location.pathname;
		const isAuthPage = currentPath === '/login' || currentPath === '/register';

		const token = localStorage.getItem('token');
		if (!token) {
			set({ loading: false });
			if (!isAuthPage) {
				window.location.href = '/login';
			}
			return;
		}

		try {
			const payload = JSON.parse(atob(token.split('.')[1]));
			set({
				user: {
					id: payload.sub,
					username: payload.username,
					companyId: payload.companyId,
					companyName: payload.companyName,
					role: payload.role,
				},
				loading: false,
			});
			// Setup and start inactivity timer after successful authentication
			get()._setupActivityListeners();
			get().resetInactivityTimer();
		} catch (error) {
			console.error('Auth initialization failed:', error);
			set({ loading: false });
			// If token is invalid or parsing fails, ensure user is logged out
			get().logout();
		}
	},
	logout: () => {
		const { inactivityTimeoutId, _removeActivityListeners } = get();

		// Clear storage and state
		localStorage.removeItem('token');
		if (inactivityTimeoutId) clearTimeout(inactivityTimeoutId); // Clear any active timer
		_removeActivityListeners(); // Remove all activity listeners

		set({
			user: null,
			inactivityTimeoutId: null,
			lastActivityTime: Date.now(),
		}); // Reset state

		// Only redirect if we are not already on the login page
		if (
			typeof window !== 'undefined' &&
			window.location.pathname !== '/login'
		) {
			console.log('Redirecting to login...');
			window.location.href = '/login';
		}
	},
}));

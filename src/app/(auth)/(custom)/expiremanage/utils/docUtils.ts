/** @format */

import { DocStatus } from '../types';

export const TYPE_LABELS = {
	employee: 'Employee',
	vehicle: 'Vehicle',
	vendor: 'Vendor',
	insurance: 'Insurance',
	license: 'License',
};

export const TYPE_ICONS = {
	employee: '👤',
	vehicle: '🚛',
	vendor: '🏢',
	insurance: '🛡️',
	license: '📝',
};

export function getDaysDiff(date: string) {
	const today = new Date();
	const expiry = new Date(date);

	today.setHours(0, 0, 0, 0);
	expiry.setHours(0, 0, 0, 0);

	return Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
}

export function getStatus(diff: number, range: number): DocStatus {
	if (diff < 0) return 'expired';
	if (diff <= range) return 'soon';
	return 'active';
}

export function formatDate(date: string) {
	return new Date(date).toLocaleDateString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});
}

export function formatCountdown(diff: number) {
	if (diff < 0) return `${Math.abs(diff)}d overdue`;
	if (diff === 0) return 'Today';
	if (diff < 30) return `${diff}d left`;
	return `${Math.floor(diff / 30)}mo left`;
}

/** @format */

import { api } from '@/lib/api';

export const AuditLogService = {
	getAll: () => api.get('/audit-log'),
};

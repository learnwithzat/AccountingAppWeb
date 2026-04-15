/** @format */

import { z } from 'zod';

export const authSchema = z.object({
	username: z.string().min(3, 'Username must be at least 3 characters'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
	name: z.string().min(2, 'Name is required'),
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
	companyName: z.string().min(2, 'Company name is required'),
	country: z.string().optional(),
	currency: z.string().optional(),
});

export type AuthInput = z.infer<typeof authSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

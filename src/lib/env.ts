/** @format */

// Works in Node context (SSR / server usage)

export const env = {
	API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
	APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'SaaS App',
};

/** @format */

// store/useCustomerStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import API from '@/lib/api';

export type CustomerStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type CustomerType =
	| 'individual'
	| 'business'
	| 'non_profit'
	| 'government';

export interface Customer {
	id: string;
	companyId: string;
	name: string;
	company?: string;
	email: string;
	phone?: string;
	alternativePhone?: string;
	type: CustomerType;
	status: CustomerStatus;
	taxId?: string;
	website?: string;

	// Addresses
	billingAddress?: string;
	billingCity?: string;
	billingState?: string;
	billingPostalCode?: string;
	billingCountry?: string;

	shippingAddress?: string;
	shippingCity?: string;
	shippingState?: string;
	shippingPostalCode?: string;
	shippingCountry?: string;

	// Additional Info
	notes?: string;
	tags?: string[];

	// Statistics
	lifetimeSpent: number;
	totalOrders: number;
	lastOrderDate?: string;

	// Metadata
	createdAt: string;
	updatedAt: string;
}

export interface CustomerFilters {
	search?: string;
	status?: CustomerStatus | 'all';
	type?: CustomerType | 'all';
	location?: string;
	minSpent?: number;
	maxSpent?: number;
}

interface CustomerState {
	customers: Customer[];
	currentCustomer: Customer | null;
	loading: boolean;
	error: string | null;
	fetchCustomers: (companyId: string) => Promise<void>;
	fetchCustomerById: (companyId: string, customerId: string) => Promise<void>;
	createCustomer: (
		companyId: string,
		customer: Partial<Customer>
	) => Promise<Customer>;
	updateCustomer: (
		companyId: string,
		customerId: string,
		customer: Partial<Customer>
	) => Promise<void>;
	updateCustomerStatus: (
		companyId: string,
		customerId: string,
		status: CustomerStatus
	) => Promise<void>;
	bulkDeleteCustomers: (
		companyId: string,
		customerIds: string[]
	) => Promise<void>;
	deleteCustomer: (companyId: string, customerId: string) => Promise<void>;
	clearError: () => void;
}

export const useCustomerStore = create<CustomerState>()(
	devtools(
		(set, get) => ({
			customers: [],
			currentCustomer: null,
			loading: false,
			error: null,

			fetchCustomers: async (companyId: string) => {
				set({ loading: true, error: null });
				try {
					const response = await API.get(`/companies/${companyId}/customers`);
					set({ customers: response.data, loading: false });
				} catch (error: any) {
					set({
						error: error.response?.data?.message || error.message,
						loading: false,
					});
				}
			},

			fetchCustomerById: async (companyId: string, customerId: string) => {
				set({ loading: true, error: null });
				try {
					const response = await API.get(
						`/companies/${companyId}/customers/${customerId}`
					);
					set({ currentCustomer: response.data, loading: false });
				} catch (error: any) {
					set({
						error: error.response?.data?.message || error.message,
						loading: false,
					});
				}
			},

			createCustomer: async (
				companyId: string,
				customer: Partial<Customer>
			) => {
				set({ loading: true, error: null });
				try {
					const response = await API.post(
						`/companies/${companyId}/customers`,
						customer
					);
					const newCustomer = response.data;
					set((state) => ({
						customers: [newCustomer, ...state.customers],
						loading: false,
					}));
					return newCustomer;
				} catch (error: any) {
					set({
						error: error.response?.data?.message || error.message,
						loading: false,
					});
					throw error;
				}
			},

			updateCustomer: async (
				companyId: string,
				customerId: string,
				customer: Partial<Customer>
			) => {
				set({ loading: true, error: null });
				try {
					const response = await API.put(
						`/companies/${companyId}/customers/${customerId}`,
						customer
					);
					const updatedCustomer = response.data;
					set((state) => ({
						customers: state.customers.map((c) =>
							c.id === customerId ? updatedCustomer : c
						),
						currentCustomer: updatedCustomer,
						loading: false,
					}));
				} catch (error: any) {
					set({
						error: error.response?.data?.message || error.message,
						loading: false,
					});
					throw error;
				}
			},

			updateCustomerStatus: async (
				companyId: string,
				customerId: string,
				status: CustomerStatus
			) => {
				set({ loading: true, error: null });
				try {
					const response = await API.patch(
						`/companies/${companyId}/customers/${customerId}/status`,
						{ status }
					);
					const updatedCustomer = response.data;
					set((state) => ({
						customers: state.customers.map((c) =>
							c.id === customerId ? updatedCustomer : c
						),
						currentCustomer:
							state.currentCustomer?.id === customerId ?
								updatedCustomer
							:	state.currentCustomer,
						loading: false,
					}));
				} catch (error: any) {
					set({
						error: error.response?.data?.message || error.message,
						loading: false,
					});
					throw error;
				}
			},

			bulkDeleteCustomers: async (companyId: string, customerIds: string[]) => {
				set({ loading: true, error: null });
				try {
					await API.post(`/companies/${companyId}/customers/bulk-delete`, {
						ids: customerIds,
					});
					set((state) => ({
						customers: state.customers.filter(
							(c) => !customerIds.includes(c.id)
						),
						loading: false,
					}));
				} catch (error: any) {
					set({
						error: error.response?.data?.message || error.message,
						loading: false,
					});
					throw error;
				}
			},

			deleteCustomer: async (companyId: string, customerId: string) => {
				set({ loading: true, error: null });
				try {
					await API.delete(`/companies/${companyId}/customers/${customerId}`);
					set((state) => ({
						customers: state.customers.filter((c) => c.id !== customerId),
						loading: false,
					}));
				} catch (error: any) {
					set({
						error: error.response?.data?.message || error.message,
						loading: false,
					});
					throw error;
				}
			},

			clearError: () => set({ error: null }),
		}),
		{ name: 'CustomerStore' }
	)
);

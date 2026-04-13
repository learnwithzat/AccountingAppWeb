/** @format */

// store/useOrderStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import API from '@/lib/api';

export type OrderStatus =
	| 'draft'
	| 'pending'
	| 'confirmed'
	| 'processing'
	| 'shipped'
	| 'delivered'
	| 'cancelled';

export interface LineItem {
	id: string;
	productId?: string;
	description: string;
	quantity: number;
	unitPrice: number;
	discountPct: number;
	total: number;
}

export interface SalesOrder {
	id: string;
	orderNumber: string;
	companyId: string;
	customerId?: string;
	customerName: string;
	customerEmail: string;
	customerPhone?: string;
	customerAddress?: string;
	orderDate: string;
	expectedDeliveryDate?: string;
	poNumber?: string;
	status: OrderStatus;
	items: LineItem[];
	subtotal: number;
	discount: number;
	taxRate: number;
	taxAmount: number;
	total: number;
	currency: string;
	notes?: string;
	terms?: string;
	createdAt: string;
	updatedAt: string;
}

interface OrderState {
	orders: SalesOrder[];
	currentOrder: SalesOrder | null;
	loading: boolean;
	error: string | null;
	fetchOrders: (companyId: string) => Promise<void>;
	fetchOrderById: (companyId: string, orderId: string) => Promise<void>;
	createOrder: (
		companyId: string,
		order: Partial<SalesOrder>
	) => Promise<SalesOrder>;
	updateOrder: (
		companyId: string,
		orderId: string,
		order: Partial<SalesOrder>
	) => Promise<void>;
	updateOrderStatus: (
		companyId: string,
		orderId: string,
		status: OrderStatus
	) => Promise<void>;
	deleteOrder: (companyId: string, orderId: string) => Promise<void>;
	clearError: () => void;
}

export const useOrderStore = create<OrderState>()(
	devtools(
		(set, get) => ({
			orders: [],
			currentOrder: null,
			loading: false,
			error: null,

			fetchOrders: async (companyId: string) => {
				set({ loading: true, error: null });
				try {
					const response = await API.get(`/companies/${companyId}/orders`);
					set({ orders: response.data, loading: false });
				} catch (error: any) {
					set({
						error: error.response?.data?.message || error.message,
						loading: false,
					});
				}
			},

			fetchOrderById: async (companyId: string, orderId: string) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/orders/${orderId}`
					);
					if (!response.ok) throw new Error('Failed to fetch order');
					const data = await response.json();
					set({ currentOrder: data, loading: false });
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
				}
			},

			createOrder: async (companyId: string, order: Partial<SalesOrder>) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(`/api/companies/${companyId}/orders`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(order),
					});
					if (!response.ok) throw new Error('Failed to create order');
					const newOrder = await response.json();
					set((state) => ({
						orders: [newOrder, ...state.orders],
						loading: false,
					}));
					return newOrder;
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
					throw error;
				}
			},

			updateOrder: async (
				companyId: string,
				orderId: string,
				order: Partial<SalesOrder>
			) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/orders/${orderId}`,
						{
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(order),
						}
					);
					if (!response.ok) throw new Error('Failed to update order');
					const updatedOrder = await response.json();
					set((state) => ({
						orders: state.orders.map((o) =>
							o.id === orderId ? updatedOrder : o
						),
						currentOrder: updatedOrder,
						loading: false,
					}));
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
					throw error;
				}
			},

			updateOrderStatus: async (
				companyId: string,
				orderId: string,
				status: OrderStatus
			) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/orders/${orderId}/status`,
						{
							method: 'PATCH',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ status }),
						}
					);
					if (!response.ok) throw new Error('Failed to update order status');
					const updatedOrder = await response.json();
					set((state) => ({
						orders: state.orders.map((o) =>
							o.id === orderId ? updatedOrder : o
						),
						currentOrder:
							state.currentOrder?.id === orderId ?
								updatedOrder
							:	state.currentOrder,
						loading: false,
					}));
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
					throw error;
				}
			},

			deleteOrder: async (companyId: string, orderId: string) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/orders/${orderId}`,
						{
							method: 'DELETE',
						}
					);
					if (!response.ok) throw new Error('Failed to delete order');
					set((state) => ({
						orders: state.orders.filter((o) => o.id !== orderId),
						loading: false,
					}));
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
					throw error;
				}
			},

			clearError: () => set({ error: null }),
		}),
		{ name: 'OrderStore' }
	)
);

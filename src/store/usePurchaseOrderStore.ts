/** @format */

// store/usePurchaseOrderStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type PurchaseOrderStatus =
	| 'draft'
	| 'pending'
	| 'approved'
	| 'ordered'
	| 'received'
	| 'partial'
	| 'completed'
	| 'cancelled';

export interface PurchaseOrderItem {
	id: string;
	productId?: string;
	sku?: string;
	description: string;
	quantity: number;
	receivedQuantity: number;
	unitPrice: number;
	discountPct: number;
	total: number;
}

export interface PurchaseOrder {
	id: string;
	poNumber: string;
	companyId: string;
	vendorId: string;
	vendorName: string;
	vendorEmail: string;
	vendorPhone?: string;
	vendorAddress?: string;
	orderDate: string;
	expectedDeliveryDate: string;
	actualDeliveryDate?: string;
	status: PurchaseOrderStatus;
	items: PurchaseOrderItem[];
	subtotal: number;
	discount: number;
	taxRate: number;
	taxAmount: number;
	shippingAmount: number;
	totalAmount: number;
	currency: string;
	notes?: string;
	terms?: string;
	referenceNumber?: string;
	approvedBy?: string;
	approvedAt?: string;
	attachments?: string[];
	createdAt: string;
	updatedAt: string;
}

interface PurchaseOrderState {
	orders: PurchaseOrder[];
	currentOrder: PurchaseOrder | null;
	loading: boolean;
	error: string | null;
	fetchPurchaseOrders: (companyId: string) => Promise<void>;
	fetchPurchaseOrderById: (companyId: string, orderId: string) => Promise<void>;
	createPurchaseOrder: (
		companyId: string,
		order: Partial<PurchaseOrder>
	) => Promise<PurchaseOrder>;
	updatePurchaseOrder: (
		companyId: string,
		orderId: string,
		order: Partial<PurchaseOrder>
	) => Promise<void>;
	updateOrderStatus: (
		companyId: string,
		orderId: string,
		status: PurchaseOrderStatus
	) => Promise<void>;
	receiveOrder: (
		companyId: string,
		orderId: string,
		receivedItems: any[]
	) => Promise<void>;
	deletePurchaseOrder: (companyId: string, orderId: string) => Promise<void>;
	clearError: () => void;
}

export const usePurchaseOrderStore = create<PurchaseOrderState>()(
	devtools(
		(set, get) => ({
			orders: [],
			currentOrder: null,
			loading: false,
			error: null,

			fetchPurchaseOrders: async (companyId: string) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/purchase-orders`
					);
					if (!response.ok) throw new Error('Failed to fetch purchase orders');
					const data = await response.json();
					set({ orders: data, loading: false });
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
				}
			},

			fetchPurchaseOrderById: async (companyId: string, orderId: string) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/purchase-orders/${orderId}`
					);
					if (!response.ok) throw new Error('Failed to fetch purchase order');
					const data = await response.json();
					set({ currentOrder: data, loading: false });
				} catch (error) {
					set({ error: (error as Error).message, loading: false });
				}
			},

			createPurchaseOrder: async (
				companyId: string,
				order: Partial<PurchaseOrder>
			) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/purchase-orders`,
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(order),
						}
					);
					if (!response.ok) throw new Error('Failed to create purchase order');
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

			updatePurchaseOrder: async (
				companyId: string,
				orderId: string,
				order: Partial<PurchaseOrder>
			) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/purchase-orders/${orderId}`,
						{
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(order),
						}
					);
					if (!response.ok) throw new Error('Failed to update purchase order');
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
				status: PurchaseOrderStatus
			) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/purchase-orders/${orderId}/status`,
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

			receiveOrder: async (
				companyId: string,
				orderId: string,
				receivedItems: any[]
			) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/purchase-orders/${orderId}/receive`,
						{
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ items: receivedItems }),
						}
					);
					if (!response.ok) throw new Error('Failed to receive order');
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

			deletePurchaseOrder: async (companyId: string, orderId: string) => {
				set({ loading: true, error: null });
				try {
					const response = await fetch(
						`/api/companies/${companyId}/purchase-orders/${orderId}`,
						{
							method: 'DELETE',
						}
					);
					if (!response.ok) throw new Error('Failed to delete purchase order');
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
		{ name: 'PurchaseOrderStore' }
	)
);

/** @format */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import axios from 'axios';

// ==================== Types ====================

export interface Product {
	id: string;
	name: string;
	slug: string;
	description: string;
	shortDescription?: string;
	price: number;
	compareAtPrice?: number | null;
	costPerItem?: number | null;
	sku: string;
	barcode?: string;
	quantity: number;
	trackQuantity?: boolean;
	allowBackorders?: boolean;
	lowStockThreshold: number;
	categoryId: string;
	category?: Category;
	tags: string[];
	images: string[];
	status: 'draft' | 'active' | 'archived';
	featured: boolean;
	weight?: number | null;
	dimensions?: {
		length?: number;
		width?: number;
		height?: number;
	};
	seoTitle?: string;
	seoDescription?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Category {
	id: string;
	name: string;
	slug: string;
	description?: string;
	parentCategoryId?: string;
	parentCategory?: Category;
	imageUrl?: string;
	status: 'active' | 'inactive';
	displayOrder: number;
	seoTitle?: string;
	seoDescription?: string;
	createdAt: string;
	updatedAt: string;
	subcategories?: Category[];
}

export interface FilterOptions {
	q?: string;
	category?: string;
	sort?: string;
	page?: number;
	limit?: number;
	minPrice?: number;
	maxPrice?: number;
	inStock?: boolean;
	minRating?: number;
	status?: 'draft' | 'active' | 'archived';
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	totalPages: number;
	limit: number;
}

// ==================== API Service ====================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = {
	// Products
	getProducts: async (
		filters?: FilterOptions
	): Promise<PaginatedResponse<Product>> => {
		const response = await axios.get(`${API_BASE_URL}/products`, {
			params: filters,
		});
		return response.data;
	},
	getProduct: async (id: string): Promise<Product> => {
		const response = await axios.get(`${API_BASE_URL}/products/${id}`);
		return response.data;
	},
	createProduct: async (
		product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
	): Promise<Product> => {
		const response = await axios.post(`${API_BASE_URL}/products`, product);
		return response.data;
	},
	updateProduct: async (
		id: string,
		product: Partial<Product>
	): Promise<Product> => {
		const response = await axios.patch(
			`${API_BASE_URL}/products/${id}`,
			product
		);
		return response.data;
	},
	deleteProduct: async (id: string): Promise<void> => {
		await axios.delete(`${API_BASE_URL}/products/${id}`);
	},

	// Categories
	getCategories: async (): Promise<Category[]> => {
		const response = await axios.get(`${API_BASE_URL}/categories`);
		return response.data;
	},
	getCategory: async (id: string): Promise<Category> => {
		const response = await axios.get(`${API_BASE_URL}/categories/${id}`);
		return response.data;
	},
	createCategory: async (
		category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>
	): Promise<Category> => {
		const response = await axios.post(`${API_BASE_URL}/categories`, category);
		return response.data;
	},
	updateCategory: async (
		id: string,
		category: Partial<Category>
	): Promise<Category> => {
		const response = await axios.patch(
			`${API_BASE_URL}/categories/${id}`,
			category
		);
		return response.data;
	},
	deleteCategory: async (id: string): Promise<void> => {
		await axios.delete(`${API_BASE_URL}/categories/${id}`);
	},
};

// ==================== Store State ====================

interface ProductsState {
	// Products State
	products: Product[];
	selectedProduct: Product | null;
	productsLoading: boolean;
	productsError: string | null;
	productsPagination: {
		page: number;
		totalPages: number;
		total: number;
		limit: number;
	};

	// Categories State
	categories: Category[];
	selectedCategory: Category | null;
	categoriesLoading: boolean;
	categoriesError: string | null;

	// Filters
	filters: FilterOptions;

	// UI State
	isCreateModalOpen: boolean;
	isEditModalOpen: boolean;
	isDeleteModalOpen: boolean;
	selectedProductId: string | null;
	selectedCategoryId: string | null;

	// Bulk Operations
	selectedProducts: string[];
	isBulkDeleteModalOpen: boolean;
	isBulkStatusModalOpen: boolean;
}

// ==================== Store Actions ====================

interface ProductsActions {
	// Product Actions
	fetchProducts: (filters?: FilterOptions) => Promise<void>;
	fetchProductById: (id: string) => Promise<void>;
	createProduct: (
		product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
	) => Promise<void>;
	updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
	deleteProduct: (id: string) => Promise<void>;
	setSelectedProduct: (product: Product | null) => void;
	clearProducts: () => void;

	// Bulk Product Actions
	toggleProductSelection: (productId: string) => void;
	toggleAllProducts: () => void;
	clearSelectedProducts: () => void;
	bulkDeleteProducts: () => Promise<void>;
	bulkUpdateStatus: (status: 'draft' | 'active' | 'archived') => Promise<void>;

	// Category Actions
	fetchCategories: () => Promise<void>;
	fetchCategoryById: (id: string) => Promise<void>;
	createCategory: (
		category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>
	) => Promise<void>;
	updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
	deleteCategory: (id: string) => Promise<void>;
	setSelectedCategory: (category: Category | null) => void;
	clearCategories: () => void;

	// Filter Actions
	setFilters: (filters: Partial<FilterOptions>) => void;
	resetFilters: () => void;

	// UI Actions
	setCreateModalOpen: (open: boolean) => void;
	setEditModalOpen: (open: boolean) => void;
	setDeleteModalOpen: (open: boolean) => void;
	setSelectedProductId: (id: string | null) => void;
	setSelectedCategoryId: (id: string | null) => void;
	setBulkDeleteModalOpen: (open: boolean) => void;
	setBulkStatusModalOpen: (open: boolean) => void;
}

type ProductsStore = ProductsState & ProductsActions;

// ==================== Initial State ====================

const initialFilters: FilterOptions = {
	q: '',
	category: 'all',
	sort: 'newest',
	page: 1,
	limit: 12,
	minPrice: undefined,
	maxPrice: undefined,
	inStock: undefined,
	minRating: undefined,
	status: 'active',
};

const initialState: ProductsState = {
	products: [],
	selectedProduct: null,
	productsLoading: false,
	productsError: null,
	productsPagination: {
		page: 1,
		totalPages: 1,
		total: 0,
		limit: 12,
	},
	categories: [],
	selectedCategory: null,
	categoriesLoading: false,
	categoriesError: null,
	filters: initialFilters,
	isCreateModalOpen: false,
	isEditModalOpen: false,
	isDeleteModalOpen: false,
	selectedProductId: null,
	selectedCategoryId: null,
	selectedProducts: [],
	isBulkDeleteModalOpen: false,
	isBulkStatusModalOpen: false,
};

// ==================== Create Store ====================

export const useProductsStore = create<ProductsStore>()(
	persist(
		immer((set, get) => ({
			...initialState,

			// ==================== Product Actions ====================

			fetchProducts: async (filters?: FilterOptions) => {
				set((state) => {
					state.productsLoading = true;
					state.productsError = null;
					if (filters) {
						state.filters = { ...state.filters, ...filters };
					}
				});

				try {
					const currentFilters = get().filters;
					const response = await api.getProducts(filters || currentFilters);

					set((state) => {
						state.products = response.data;
						state.productsPagination = {
							page: response.page,
							totalPages: response.totalPages,
							total: response.total,
							limit: response.limit,
						};
						state.productsLoading = false;
					});
				} catch (error: any) {
					set((state) => {
						state.productsError =
							error.response?.data?.message ||
							error.message ||
							'Failed to fetch products';
						state.productsLoading = false;
					});
				}
			},

			fetchProductById: async (id: string) => {
				set((state) => {
					state.productsLoading = true;
					state.productsError = null;
				});

				try {
					const product = await api.getProduct(id);
					set((state) => {
						state.selectedProduct = product;
						state.productsLoading = false;
					});
				} catch (error: any) {
					set((state) => {
						state.productsError =
							error.response?.data?.message ||
							error.message ||
							'Failed to fetch product';
						state.productsLoading = false;
					});
				}
			},

			createProduct: async (productData) => {
				set((state) => {
					state.productsLoading = true;
					state.productsError = null;
				});

				try {
					const newProduct = await api.createProduct(productData);
					set((state) => {
						state.products.unshift(newProduct);
						state.productsPagination.total += 1;
						state.productsLoading = false;
						state.isCreateModalOpen = false;
					});

					// Refresh to ensure pagination is accurate
					await get().fetchProducts();
				} catch (error: any) {
					set((state) => {
						state.productsError =
							error.response?.data?.message ||
							error.message ||
							'Failed to create product';
						state.productsLoading = false;
					});
					throw error;
				}
			},

			updateProduct: async (id: string, productData) => {
				set((state) => {
					state.productsLoading = true;
					state.productsError = null;
				});

				try {
					const updatedProduct = await api.updateProduct(id, productData);
					set((state) => {
						const index = state.products.findIndex((p) => p.id === id);
						if (index !== -1) {
							state.products[index] = updatedProduct;
						}
						if (state.selectedProduct?.id === id) {
							state.selectedProduct = updatedProduct;
						}
						state.productsLoading = false;
						state.isEditModalOpen = false;
					});
				} catch (error: any) {
					set((state) => {
						state.productsError =
							error.response?.data?.message ||
							error.message ||
							'Failed to update product';
						state.productsLoading = false;
					});
					throw error;
				}
			},

			deleteProduct: async (id: string) => {
				set((state) => {
					state.productsLoading = true;
					state.productsError = null;
				});

				try {
					await api.deleteProduct(id);
					set((state) => {
						state.products = state.products.filter((p) => p.id !== id);
						state.productsPagination.total -= 1;
						if (state.selectedProduct?.id === id) {
							state.selectedProduct = null;
						}
						state.selectedProducts = state.selectedProducts.filter(
							(pid) => pid !== id
						);
						state.productsLoading = false;
						state.isDeleteModalOpen = false;
						state.selectedProductId = null;
					});
				} catch (error: any) {
					set((state) => {
						state.productsError =
							error.response?.data?.message ||
							error.message ||
							'Failed to delete product';
						state.productsLoading = false;
					});
					throw error;
				}
			},

			setSelectedProduct: (product) => {
				set((state) => {
					state.selectedProduct = product;
				});
			},

			clearProducts: () => {
				set((state) => {
					state.products = [];
					state.selectedProduct = null;
					state.productsPagination = initialState.productsPagination;
					state.selectedProducts = [];
				});
			},

			// ==================== Bulk Product Actions ====================

			toggleProductSelection: (productId: string) => {
				set((state) => {
					const index = state.selectedProducts.indexOf(productId);
					if (index === -1) {
						state.selectedProducts.push(productId);
					} else {
						state.selectedProducts.splice(index, 1);
					}
				});
			},

			toggleAllProducts: () => {
				set((state) => {
					if (state.selectedProducts.length === state.products.length) {
						state.selectedProducts = [];
					} else {
						state.selectedProducts = state.products.map((p) => p.id);
					}
				});
			},

			clearSelectedProducts: () => {
				set((state) => {
					state.selectedProducts = [];
				});
			},

			bulkDeleteProducts: async () => {
				const { selectedProducts } = get();
				if (selectedProducts.length === 0) return;

				set((state) => {
					state.productsLoading = true;
					state.productsError = null;
				});

				try {
					await Promise.all(
						selectedProducts.map((id) => api.deleteProduct(id))
					);
					set((state) => {
						state.products = state.products.filter(
							(p) => !selectedProducts.includes(p.id)
						);
						state.productsPagination.total -= selectedProducts.length;
						state.selectedProducts = [];
						state.productsLoading = false;
						state.isBulkDeleteModalOpen = false;
					});

					await get().fetchProducts();
				} catch (error: any) {
					set((state) => {
						state.productsError =
							error.response?.data?.message ||
							error.message ||
							'Failed to delete products';
						state.productsLoading = false;
					});
					throw error;
				}
			},

			bulkUpdateStatus: async (status) => {
				const { selectedProducts } = get();
				if (selectedProducts.length === 0) return;

				set((state) => {
					state.productsLoading = true;
					state.productsError = null;
				});

				try {
					await Promise.all(
						selectedProducts.map((id) => api.updateProduct(id, { status }))
					);
					set((state) => {
						state.products = state.products.map((p) =>
							selectedProducts.includes(p.id) ? { ...p, status } : p
						);
						state.selectedProducts = [];
						state.productsLoading = false;
						state.isBulkStatusModalOpen = false;
					});
				} catch (error: any) {
					set((state) => {
						state.productsError =
							error.response?.data?.message ||
							error.message ||
							'Failed to update products';
						state.productsLoading = false;
					});
					throw error;
				}
			},

			// ==================== Category Actions ====================

			fetchCategories: async () => {
				set((state) => {
					state.categoriesLoading = true;
					state.categoriesError = null;
				});

				try {
					const categories = await api.getCategories();
					set((state) => {
						state.categories = categories;
						state.categoriesLoading = false;
					});
				} catch (error: any) {
					set((state) => {
						state.categoriesError =
							error.response?.data?.message ||
							error.message ||
							'Failed to fetch categories';
						state.categoriesLoading = false;
					});
				}
			},

			fetchCategoryById: async (id: string) => {
				set((state) => {
					state.categoriesLoading = true;
					state.categoriesError = null;
				});

				try {
					const category = await api.getCategory(id);
					set((state) => {
						state.selectedCategory = category;
						state.categoriesLoading = false;
					});
				} catch (error: any) {
					set((state) => {
						state.categoriesError =
							error.response?.data?.message ||
							error.message ||
							'Failed to fetch category';
						state.categoriesLoading = false;
					});
				}
			},

			createCategory: async (categoryData) => {
				set((state) => {
					state.categoriesLoading = true;
					state.categoriesError = null;
				});

				try {
					const newCategory = await api.createCategory(categoryData);
					set((state) => {
						state.categories.push(newCategory);
						state.categoriesLoading = false;
						state.isCreateModalOpen = false;
					});
				} catch (error: any) {
					set((state) => {
						state.categoriesError =
							error.response?.data?.message ||
							error.message ||
							'Failed to create category';
						state.categoriesLoading = false;
					});
					throw error;
				}
			},

			updateCategory: async (id: string, categoryData) => {
				set((state) => {
					state.categoriesLoading = true;
					state.categoriesError = null;
				});

				try {
					const updatedCategory = await api.updateCategory(id, categoryData);
					set((state) => {
						const index = state.categories.findIndex((c) => c.id === id);
						if (index !== -1) {
							state.categories[index] = updatedCategory;
						}
						if (state.selectedCategory?.id === id) {
							state.selectedCategory = updatedCategory;
						}
						state.categoriesLoading = false;
						state.isEditModalOpen = false;
					});
				} catch (error: any) {
					set((state) => {
						state.categoriesError =
							error.response?.data?.message ||
							error.message ||
							'Failed to update category';
						state.categoriesLoading = false;
					});
					throw error;
				}
			},

			deleteCategory: async (id: string) => {
				set((state) => {
					state.categoriesLoading = true;
					state.categoriesError = null;
				});

				try {
					await api.deleteCategory(id);
					set((state) => {
						state.categories = state.categories.filter((c) => c.id !== id);
						if (state.selectedCategory?.id === id) {
							state.selectedCategory = null;
						}
						state.categoriesLoading = false;
						state.isDeleteModalOpen = false;
						state.selectedCategoryId = null;
					});
				} catch (error: any) {
					set((state) => {
						state.categoriesError =
							error.response?.data?.message ||
							error.message ||
							'Failed to delete category';
						state.categoriesLoading = false;
					});
					throw error;
				}
			},

			setSelectedCategory: (category) => {
				set((state) => {
					state.selectedCategory = category;
				});
			},

			clearCategories: () => {
				set((state) => {
					state.categories = [];
					state.selectedCategory = null;
				});
			},

			// ==================== Filter Actions ====================

			setFilters: (filters) => {
				set((state) => {
					state.filters = { ...state.filters, ...filters, page: 1 };
				});
				get().fetchProducts();
			},

			resetFilters: () => {
				set((state) => {
					state.filters = initialFilters;
				});
				get().fetchProducts();
			},

			// ==================== UI Actions ====================

			setCreateModalOpen: (open) => {
				set((state) => {
					state.isCreateModalOpen = open;
					if (!open) {
						state.selectedProductId = null;
						state.selectedCategoryId = null;
					}
				});
			},

			setEditModalOpen: (open) => {
				set((state) => {
					state.isEditModalOpen = open;
				});
			},

			setDeleteModalOpen: (open) => {
				set((state) => {
					state.isDeleteModalOpen = open;
				});
			},

			setSelectedProductId: (id) => {
				set((state) => {
					state.selectedProductId = id;
				});
			},

			setSelectedCategoryId: (id) => {
				set((state) => {
					state.selectedCategoryId = id;
				});
			},

			setBulkDeleteModalOpen: (open) => {
				set((state) => {
					state.isBulkDeleteModalOpen = open;
				});
			},

			setBulkStatusModalOpen: (open) => {
				set((state) => {
					state.isBulkStatusModalOpen = open;
				});
			},
		})),
		{
			name: 'products-store',
			partialize: (state) => ({
				filters: state.filters,
				selectedProducts: state.selectedProducts,
			}),
		}
	)
);

// ==================== Selectors ====================

export const useFilteredProducts = () => {
	return useProductsStore((state) => {
		let filtered = [...state.products];

		if (state.filters.minPrice) {
			filtered = filtered.filter((p) => p.price >= state.filters.minPrice!);
		}
		if (state.filters.maxPrice) {
			filtered = filtered.filter((p) => p.price <= state.filters.maxPrice!);
		}
		if (state.filters.inStock) {
			filtered = filtered.filter((p) => p.quantity > 0);
		}
		if (state.filters.status) {
			filtered = filtered.filter((p) => p.status === state.filters.status);
		}

		return filtered;
	});
};

export const useCategoriesTree = () => {
	return useProductsStore((state) => {
		const categories = state.categories;
		const categoryMap = new Map<
			string,
			Category & { subcategories: Category[] }
		>();
		const roots: (Category & { subcategories: Category[] })[] = [];

		// First pass: create map
		categories.forEach((category) => {
			categoryMap.set(category.id, { ...category, subcategories: [] });
		});

		// Second pass: build tree
		categories.forEach((category) => {
			const node = categoryMap.get(category.id);
			if (
				node &&
				category.parentCategoryId &&
				categoryMap.has(category.parentCategoryId)
			) {
				const parent = categoryMap.get(category.parentCategoryId);
				if (parent) {
					parent.subcategories.push(node);
				}
			} else if (node) {
				roots.push(node);
			}
		});

		// Sort by display order
		const sortByOrder = (
			items: (Category & { subcategories: Category[] })[]
		) => {
			items.sort((a, b) => a.displayOrder - b.displayOrder);
			items.forEach((item) => {
				sortByOrder(
					item.subcategories as (Category & { subcategories: Category[] })[]
				);
			});
		};

		sortByOrder(roots);
		return roots;
	});
};

export const useProductsStats = () => {
	return useProductsStore((state) => {
		const products = state.products;
		return {
			totalProducts: state.productsPagination.total,
			activeProducts: products.filter((p) => p.status === 'active').length,
			draftProducts: products.filter((p) => p.status === 'draft').length,
			archivedProducts: products.filter((p) => p.status === 'archived').length,
			outOfStockProducts: products.filter(
				(p) => p.trackQuantity && p.quantity === 0
			).length,
			lowStockProducts: products.filter(
				(p) =>
					p.trackQuantity && p.quantity <= p.lowStockThreshold && p.quantity > 0
			).length,
			totalValue: products.reduce((sum, p) => sum + p.price * p.quantity, 0),
			averagePrice:
				products.length > 0 ?
					products.reduce((sum, p) => sum + p.price, 0) / products.length
				:	0,
			selectedCount: state.selectedProducts.length,
		};
	});
};

export const useCategoryOptions = () => {
	const tree = useCategoriesTree();
	const buildOptions = (
		categories: (Category & { subcategories: Category[] })[],
		level = 0
	): { value: string; label: string }[] => {
		let options: { value: string; label: string }[] = [];
		categories.forEach((category) => {
			options.push({
				value: category.id,
				label: '—'.repeat(level) + (level > 0 ? ' ' : '') + category.name,
			});
			if (category.subcategories && category.subcategories.length > 0) {
				options = [
					...options,
					...buildOptions(
						category.subcategories as (Category & {
							subcategories: Category[];
						})[],
						level + 1
					),
				];
			}
		});
		return options;
	};

	return buildOptions(tree);
};

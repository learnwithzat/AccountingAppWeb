/** @format */

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProductsStore, useProductsStats } from '@/store/useProductsStore';

interface Product {
	id: string;
	name: string;
	description: string;
	shortDescription?: string;
	price: number;
	compareAtPrice?: number | null;
	quantity: number;
	trackQuantity?: boolean;
	status: 'draft' | 'active' | 'archived';
	featured: boolean;
	images: string[];
	tags: string[];
}

export default function ProductsPage() {
	const {
		products,
		productsLoading,
		productsPagination,
		filters,
		fetchProducts,
		setFilters,
		resetFilters,
	} = useProductsStore();

	const stats = useProductsStats();
	const [priceRange, setPriceRange] = useState<[number, number]>([
		filters.minPrice || 0,
		filters.maxPrice || 1000,
	]);

	useEffect(() => {
		fetchProducts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		setPriceRange([filters.minPrice || 0, filters.maxPrice || 1000]);
	}, [filters.minPrice, filters.maxPrice]);

	const handlePageChange = (page: number) => {
		setFilters({ page });
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const handleSearch = (query: string) => {
		setFilters({ q: query, page: 1 });
	};

	const handlePriceChange = (
		value: number | readonly number[],
		_eventDetails: any
	) => {
		if (Array.isArray(value) && value.length >= 2) {
			setPriceRange([value[0], value[1]]);
		}
	};

	const handlePriceApply = () => {
		setFilters({
			minPrice: priceRange[0] || undefined,
			maxPrice: priceRange[1] || undefined,
			page: 1,
		});
	};

	const handleClearPrice = () => {
		setPriceRange([0, 1000]);
		setFilters({ minPrice: undefined, maxPrice: undefined, page: 1 });
	};

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='container mx-auto px-4 py-8'>
				{/* Header with Stats */}
				<div className='mb-8 flex justify-between items-start'>
					<div>
						<h1 className='text-3xl font-bold text-gray-900'>Products</h1>
						<p className='text-gray-600 mt-2'>Manage your product inventory</p>
					</div>
					<Link href='/products/create'>
						<Button>
							<Plus className='h-4 w-4 mr-2' />
							Add Product
						</Button>
					</Link>
				</div>

				{/* Stats Cards */}
				<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8'>
					<StatCard
						label='Total Products'
						value={stats.totalProducts}
					/>
					<StatCard
						label='Active'
						value={stats.activeProducts}
					/>
					<StatCard
						label='Draft'
						value={stats.draftProducts}
					/>
					<StatCard
						label='Archived'
						value={stats.archivedProducts}
					/>
					<StatCard
						label='Out of Stock'
						value={stats.outOfStockProducts}
					/>
					<StatCard
						label='Low Stock'
						value={stats.lowStockProducts}
					/>
				</div>

				{/* Search and Filters */}
				<div className='mb-8 space-y-4'>
					{/* Search Bar */}
					<div className='relative'>
						<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
						<Input
							placeholder='Search products...'
							value={filters.q || ''}
							onChange={(e) => handleSearch(e.target.value)}
							className='pl-10 pr-10'
						/>
						{filters.q && (
							<button
								onClick={() => handleSearch('')}
								className='absolute right-3 top-1/2 transform -translate-y-1/2'>
								<X className='h-4 w-4 text-gray-400 hover:text-gray-600' />
							</button>
						)}
					</div>

					{/* Filter Bar */}
					<div className='flex justify-between items-center gap-4 flex-wrap'>
						<div className='flex gap-2 flex-wrap flex-1'>
							{/* Category Filter */}
							<CategoryFilter
								currentCategory={filters.category || 'all'}
								onCategoryChange={(category) =>
									setFilters({ category, page: 1 })
								}
							/>

							{/* Sort Filter */}
							<SortFilter
								currentSort={filters.sort || 'newest'}
								onSortChange={(sort) => setFilters({ sort, page: 1 })}
							/>

							{/* Price Filter */}
							<DropdownMenu>
								<DropdownMenuTrigger>
									<Button
										variant='outline'
										className='gap-2'>
										Price
										<ChevronDown className='h-4 w-4' />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className='w-80 p-4'>
									<div className='space-y-4'>
										<div className='space-y-2'>
											<label className='text-sm font-medium'>Price Range</label>
											<Slider
												min={0}
												max={1000}
												step={10}
												value={priceRange}
												onValueChange={handlePriceChange}
												className='my-4'
											/>
											<div className='flex justify-between text-sm'>
												<span>${priceRange[0]}</span>
												<span>${priceRange[1]}</span>
											</div>
										</div>
										<div className='flex gap-2'>
											<Button
												onClick={handlePriceApply}
												size='sm'>
												Apply
											</Button>
											<Button
												onClick={handleClearPrice}
												variant='outline'
												size='sm'>
												Clear
											</Button>
										</div>
									</div>
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Stock Filter */}
							<Button
								variant={filters.inStock ? 'default' : 'outline'}
								onClick={() =>
									setFilters({ inStock: !filters.inStock, page: 1 })
								}>
								In Stock Only
							</Button>

							{/* Active Filters Display */}
							{(filters.minPrice !== undefined ||
								filters.maxPrice !== undefined ||
								filters.category !== 'all' ||
								filters.inStock) && (
								<Button
									variant='ghost'
									onClick={resetFilters}
									size='sm'>
									Clear All Filters
								</Button>
							)}
						</div>
					</div>
				</div>

				{/* Results Info */}
				<div className='mb-4 text-sm text-gray-600'>
					Showing {products.length} of {productsPagination.total} products
					{filters.q && (
						<span className='ml-2'>searching for &quot;{filters.q}&quot;</span>
					)}
					{filters.category && filters.category !== 'all' && (
						<span className='ml-2'>
							in category &quot;{filters.category}&quot;
						</span>
					)}
					{(filters.minPrice !== undefined ||
						filters.maxPrice !== undefined) && (
						<span className='ml-2'>
							between ${filters.minPrice || 0} - ${filters.maxPrice || 1000}
						</span>
					)}
				</div>

				{/* Product Grid */}
				{productsLoading ?
					<ProductGridSkeleton />
				: products.length > 0 ?
					<>
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
							{products.map((product) => (
								<ProductCard
									key={product.id}
									product={product}
								/>
							))}
						</div>

						{/* Pagination */}
						{productsPagination.totalPages > 1 && (
							<div className='mt-8 flex justify-center'>
								<Pagination
									currentPage={productsPagination.page}
									totalPages={productsPagination.totalPages}
									onPageChange={handlePageChange}
								/>
							</div>
						)}
					</>
				:	<EmptyState />}
			</div>
		</div>
	);
}

// ==================== Helper Components ====================

function StatCard({ label, value }: { label: string; value: number }) {
	return (
		<div className='bg-white rounded-lg p-4 shadow-sm border border-gray-100'>
			<p className='text-sm text-gray-600'>{label}</p>
			<p className='text-2xl font-bold text-gray-900'>{value}</p>
		</div>
	);
}

function CategoryFilter({
	currentCategory,
	onCategoryChange,
}: {
	currentCategory: string;
	onCategoryChange: (category: string) => void;
}) {
	const { categories } = useProductsStore();

	const handleValueChange = (value: string | null, _eventDetails: any) => {
		onCategoryChange(value || 'all');
	};

	return (
		<Select
			value={currentCategory}
			onValueChange={handleValueChange}>
			<SelectTrigger className='w-[180px]'>
				<SelectValue placeholder='All Categories' />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value='all'>All Categories</SelectItem>
				{categories.map((category) => (
					<SelectItem
						key={category.id}
						value={category.id}>
						{category.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function SortFilter({
	currentSort,
	onSortChange,
}: {
	currentSort: string;
	onSortChange: (sort: string) => void;
}) {
	const sortOptions = [
		{ value: 'newest', label: 'Newest First' },
		{ value: 'oldest', label: 'Oldest First' },
		{ value: 'price-asc', label: 'Price: Low to High' },
		{ value: 'price-desc', label: 'Price: High to Low' },
		{ value: 'name-asc', label: 'Name: A to Z' },
		{ value: 'name-desc', label: 'Name: Z to A' },
	];

	const handleValueChange = (value: string | null, _eventDetails: any) => {
		onSortChange(value || 'newest');
	};

	return (
		<Select
			value={currentSort}
			onValueChange={handleValueChange}>
			<SelectTrigger className='w-[180px]'>
				<SelectValue placeholder='Sort by' />
			</SelectTrigger>
			<SelectContent>
				{sortOptions.map((option) => (
					<SelectItem
						key={option.value}
						value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function ProductCard({ product }: { product: Product }) {
	const [imageError, setImageError] = useState(false);

	return (
		<Link href={`/products/${product.id}`}>
			<div className='bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer'>
				<div className='relative h-48 bg-gray-100'>
					{product.images && product.images[0] && !imageError ?
						<Image
							src={product.images[0]}
							alt={product.name}
							fill
							className='object-cover'
							onError={() => setImageError(true)}
						/>
					:	<div className='flex items-center justify-center h-full'>
							<span className='text-4xl'>📦</span>
						</div>
					}
					{product.status === 'draft' && (
						<Badge className='absolute top-2 right-2 bg-yellow-500'>
							Draft
						</Badge>
					)}
					{product.status === 'archived' && (
						<Badge className='absolute top-2 right-2 bg-gray-500'>
							Archived
						</Badge>
					)}
					{product.featured && (
						<Badge className='absolute top-2 left-2 bg-purple-500'>
							Featured
						</Badge>
					)}
				</div>
				<div className='p-4'>
					<h3 className='font-semibold text-gray-900 mb-1 line-clamp-1'>
						{product.name}
					</h3>
					<p className='text-sm text-gray-600 mb-2 line-clamp-2'>
						{product.shortDescription || product.description.substring(0, 100)}
					</p>
					<div className='flex justify-between items-center'>
						<div>
							<span className='text-lg font-bold text-gray-900'>
								${product.price.toFixed(2)}
							</span>
							{product.compareAtPrice && (
								<span className='text-sm text-gray-400 line-through ml-2'>
									${product.compareAtPrice.toFixed(2)}
								</span>
							)}
						</div>
						<div className='text-sm'>
							{product.trackQuantity ?
								product.quantity > 0 ?
									<span className='text-green-600'>
										{product.quantity} in stock
									</span>
								:	<span className='text-red-600'>Out of stock</span>
							:	<span className='text-gray-500'>Unlimited</span>}
						</div>
					</div>
					{product.tags && product.tags.length > 0 && (
						<div className='flex gap-1 mt-2 flex-wrap'>
							{product.tags.slice(0, 3).map((tag: string) => (
								<Badge
									key={tag}
									variant='secondary'
									className='text-xs'>
									{tag}
								</Badge>
							))}
						</div>
					)}
				</div>
			</div>
		</Link>
	);
}

function ProductGridSkeleton() {
	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
			{[...Array(8)].map((_, i) => (
				<div
					key={i}
					className='bg-white rounded-lg p-4'>
					<Skeleton className='h-48 w-full mb-4' />
					<Skeleton className='h-4 w-3/4 mb-2' />
					<Skeleton className='h-4 w-full mb-2' />
					<Skeleton className='h-4 w-1/2' />
				</div>
			))}
		</div>
	);
}

function EmptyState() {
	return (
		<div className='text-center py-12 bg-white rounded-lg border border-gray-100'>
			<div className='text-6xl mb-4'>📦</div>
			<h3 className='text-xl font-semibold text-gray-900 mb-2'>
				No products found
			</h3>
			<p className='text-gray-600'>
				Get started by creating your first product
			</p>
			<Link href='/products/create'>
				<Button className='mt-4'>
					<Plus className='h-4 w-4 mr-2' />
					Create Product
				</Button>
			</Link>
		</div>
	);
}

function Pagination({
	currentPage,
	totalPages,
	onPageChange,
}: {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}) {
	const pages = [];
	const maxVisible = 5;
	let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
	const endPage = Math.min(totalPages, startPage + maxVisible - 1);

	if (endPage - startPage + 1 < maxVisible) {
		startPage = Math.max(1, endPage - maxVisible + 1);
	}

	for (let i = startPage; i <= endPage; i++) {
		pages.push(i);
	}

	return (
		<div className='flex gap-2 flex-wrap justify-center'>
			<button
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className='px-4 py-2 border rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors'>
				Previous
			</button>

			{startPage > 1 && (
				<>
					<button
						onClick={() => onPageChange(1)}
						className='px-4 py-2 border rounded-md bg-white hover:bg-gray-50 transition-colors'>
						1
					</button>
					{startPage > 2 && (
						<span className='px-2 py-2 text-gray-500'>...</span>
					)}
				</>
			)}

			{pages.map((page) => (
				<button
					key={page}
					onClick={() => onPageChange(page)}
					className={`px-4 py-2 border rounded-md transition-colors ${
						page === currentPage ?
							'bg-blue-600 text-white hover:bg-blue-700 border-blue-600'
						:	'bg-white hover:bg-gray-50'
					}`}>
					{page}
				</button>
			))}

			{endPage < totalPages && (
				<>
					{endPage < totalPages - 1 && (
						<span className='px-2 py-2 text-gray-500'>...</span>
					)}
					<button
						onClick={() => onPageChange(totalPages)}
						className='px-4 py-2 border rounded-md bg-white hover:bg-gray-50 transition-colors'>
						{totalPages}
					</button>
				</>
			)}

			<button
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				className='px-4 py-2 border rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors'>
				Next
			</button>
		</div>
	);
}

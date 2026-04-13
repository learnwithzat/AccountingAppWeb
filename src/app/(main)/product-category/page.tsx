/** @format */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductsStore } from '@/store/useProductsStore';

interface Product {
	id: string;
	name: string;
	description: string;
	shortDescription?: string;
	price: number;
	compareAtPrice?: number | null;
	quantity: number;
	trackQuantity?: boolean;
	status: string;
	featured: boolean;
	images: string[];
	tags?: string[];
}

export default function ProductCategoryPage() {
	return (
		<Suspense
			fallback={
				<div className='container mx-auto px-4 py-8'>
					<ProductGridSkeleton />
				</div>
			}>
			<ProductCategoryContent />
		</Suspense>
	);
}

function ProductCategoryContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const category = searchParams.get('category') || 'all';
	const sort = searchParams.get('sort') || 'newest';
	const page = Number(searchParams.get('page')) || 1;
	const minPrice =
		searchParams.get('minPrice') ?
			Number(searchParams.get('minPrice'))
		:	undefined;
	const maxPrice =
		searchParams.get('maxPrice') ?
			Number(searchParams.get('maxPrice'))
		:	undefined;

	const {
		products,
		productsLoading,
		productsPagination,
		filters,
		fetchProducts,
		setFilters,
		categories,
		fetchCategories,
	} = useProductsStore();

	const [priceRange, setPriceRange] = useState<[number, number]>([
		minPrice || 0,
		maxPrice || 1000,
	]);
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	useEffect(() => {
		// Sync URL params with store filters
		setFilters({
			category: category === 'all' ? undefined : category,
			sort,
			page,
			minPrice,
			maxPrice,
		});
	}, [category, sort, page, minPrice, maxPrice, setFilters]);

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts, filters]);

	const handlePageChange = (newPage: number) => {
		const params = new URLSearchParams(searchParams);
		params.set('page', newPage.toString());
		router.push(`/product-category?${params.toString()}`);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const handleCategoryChange = (newCategory: string) => {
		const params = new URLSearchParams(searchParams);
		if (newCategory === 'all') {
			params.delete('category');
		} else {
			params.set('category', newCategory);
		}
		params.delete('page');
		router.push(`/product-category?${params.toString()}`);
	};

	const handleSortChange = (value: string | null) => {
		if (typeof value !== 'string' || value === null) return;

		const params = new URLSearchParams(searchParams);
		params.set('sort', value);
		params.delete('page');
		router.push(`/product-category?${params.toString()}`);
	};

	const handlePriceApply = () => {
		const params = new URLSearchParams(searchParams);
		if (priceRange[0] > 0) {
			params.set('minPrice', priceRange[0].toString());
		} else {
			params.delete('minPrice');
		}
		if (priceRange[1] < 1000) {
			params.set('maxPrice', priceRange[1].toString());
		} else {
			params.delete('maxPrice');
		}
		params.delete('page');
		router.push(`/product-category?${params.toString()}`);
	};

	const handleClearPrice = () => {
		setPriceRange([0, 1000]);
		const params = new URLSearchParams(searchParams);
		params.delete('minPrice');
		params.delete('maxPrice');
		params.delete('page');
		router.push(`/product-category?${params.toString()}`);
	};

	const clearAllFilters = () => {
		router.push('/product-category');
	};

	return (
		<div className='container mx-auto px-4 py-8'>
			{/* Mobile Filter Button */}
			<div className='lg:hidden mb-4'>
				<Button
					variant='outline'
					onClick={() => setIsFilterOpen(!isFilterOpen)}
					className='w-full'>
					Filters
					<ChevronDown
						className={`ml-2 h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
					/>
				</Button>
			</div>

			<div className='flex flex-col lg:flex-row gap-8'>
				{/* Sidebar with filters */}
				<aside
					className={`lg:w-1/4 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
					<div className='sticky top-8 space-y-6'>
						<div className='flex justify-between items-center'>
							<h3 className='font-semibold text-lg'>Filters</h3>
							{(category !== 'all' || minPrice || maxPrice) && (
								<Button
									variant='ghost'
									size='sm'
									onClick={clearAllFilters}>
									Clear All
								</Button>
							)}
						</div>

						{/* Category Filter */}
						<div className='space-y-3'>
							<h4 className='font-medium'>Categories</h4>
							<div className='space-y-2'>
								<label className='flex items-center space-x-2 cursor-pointer'>
									<input
										type='radio'
										name='category'
										checked={category === 'all'}
										onChange={() => handleCategoryChange('all')}
										className='h-4 w-4'
									/>
									<span className='text-sm'>All Products</span>
								</label>
								{categories.map((cat) => (
									<label
										key={cat.id}
										className='flex items-center space-x-2 cursor-pointer'>
										<input
											type='radio'
											name='category'
											checked={category === cat.id}
											onChange={() => handleCategoryChange(cat.id)}
											className='h-4 w-4'
										/>
										<span className='text-sm'>{cat.name}</span>
									</label>
								))}
							</div>
						</div>

						{/* Price Filter */}
						<div className='space-y-3'>
							<h4 className='font-medium'>Price Range</h4>
							<div className='space-y-4'>
								<Slider
									min={0}
									max={1000}
									step={10}
									value={priceRange}
									onValueChange={(value) =>
										setPriceRange(value as [number, number])
									}
									className='my-4'
								/>
								<div className='flex justify-between text-sm'>
									<span>${priceRange[0]}</span>
									<span>${priceRange[1]}</span>
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
						</div>

						{/* Active Filters */}
						{(category !== 'all' || minPrice || maxPrice) && (
							<div className='space-y-2'>
								<h4 className='font-medium'>Active Filters</h4>
								<div className='flex flex-wrap gap-2'>
									{category !== 'all' && (
										<Badge
											label={
												categories.find((c) => c.id === category)?.name ||
												category
											}
											onRemove={() => handleCategoryChange('all')}
										/>
									)}
									{(minPrice || maxPrice) && (
										<Badge
											label={`$${minPrice || 0} - $${maxPrice || 1000}`}
											onRemove={handleClearPrice}
										/>
									)}
								</div>
							</div>
						)}
					</div>
				</aside>

				{/* Main content */}
				<main className='lg:w-3/4'>
					<div className='mb-6 flex justify-between items-center flex-wrap gap-4'>
						<div>
							<h1 className='text-3xl font-bold capitalize'>
								{category === 'all' ?
									'All Products'
								:	`${categories.find((c) => c.id === category)?.name || category} Products`
								}
							</h1>
							<p className='text-gray-600 mt-2'>
								Showing {products.length} of {productsPagination.total} products
							</p>
						</div>

						{/* Sort Dropdown */}
						<Select
							value={sort}
							onValueChange={handleSortChange}>
							<SelectTrigger className='w-[180px]'>
								<SelectValue placeholder='Sort by' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='newest'>Newest First</SelectItem>
								<SelectItem value='oldest'>Oldest First</SelectItem>
								<SelectItem value='price-asc'>Price: Low to High</SelectItem>
								<SelectItem value='price-desc'>Price: High to Low</SelectItem>
								<SelectItem value='name-asc'>Name: A to Z</SelectItem>
								<SelectItem value='name-desc'>Name: Z to A</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Product Grid */}
					{productsLoading ?
						<ProductGridSkeleton />
					: products.length > 0 ?
						<>
							<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
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
				</main>
			</div>
		</div>
	);
}

// ==================== Helper Components ====================

function Badge({ label, onRemove }: { label: string; onRemove: () => void }) {
	return (
		<div className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm'>
			<span>{label}</span>
			<button
				onClick={onRemove}
				className='hover:text-blue-900'>
				<X className='h-3 w-3' />
			</button>
		</div>
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
						<span className='absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded'>
							Draft
						</span>
					)}
					{product.featured && (
						<span className='absolute top-2 left-2 px-2 py-1 bg-purple-500 text-white text-xs rounded'>
							Featured
						</span>
					)}
				</div>
				<div className='p-4'>
					<h3 className='font-semibold text-gray-900 mb-1 line-clamp-1'>
						{product.name}
					</h3>
					<p className='text-sm text-gray-600 mb-2 line-clamp-2'>
						{product.shortDescription || product.description?.substring(0, 100)}
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
									<span className='text-green-600'>In Stock</span>
								:	<span className='text-red-600'>Out of Stock</span>
							:	<span className='text-gray-500'>Available</span>}
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}

function ProductGridSkeleton() {
	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
			{[...Array(6)].map((_, i) => (
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
			<div className='text-6xl mb-4'>🔍</div>
			<h3 className='text-xl font-semibold text-gray-900 mb-2'>
				No products found
			</h3>
			<p className='text-gray-600'>
				Try adjusting your filters or browse other categories
			</p>
			<Button
				variant='outline'
				className='mt-4'
				onClick={() => (window.location.href = '/product-category')}>
				Clear All Filters
			</Button>
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

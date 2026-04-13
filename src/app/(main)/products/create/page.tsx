/** @format */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUpload } from '@/components/ui/image-upload';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { useProductsStore } from '@/store/useProductsStore';

const generateSlug = (name: string) =>
	name
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');

// Form validation schema
const productFormSchema = z.object({
	name: z
		.string()
		.min(3, 'Product name must be at least 3 characters')
		.max(100, 'Product name must not exceed 100 characters'),
	slug: z
		.string()
		.min(3, 'Slug must be at least 3 characters')
		.max(100, 'Slug must not exceed 100 characters')
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
	description: z
		.string()
		.min(20, 'Description must be at least 20 characters')
		.max(5000, 'Description must not exceed 5000 characters'),
	shortDescription: z
		.string()
		.max(200, 'Short description must not exceed 200 characters'),
	price: z.number().positive('Price must be greater than 0'),
	compareAtPrice: z.number().positive().nullable(),
	costPerItem: z.number().positive().nullable(),
	sku: z
		.string()
		.min(1, 'SKU is required')
		.max(50, 'SKU must not exceed 50 characters'),
	barcode: z.string(),
	quantity: z.number().int().min(0, 'Quantity cannot be negative'),
	trackQuantity: z.boolean(),
	allowBackorders: z.boolean(),
	featured: z.boolean(),
	lowStockThreshold: z.number().int().min(0),
	categoryId: z.string().min(1, 'Please select a category'),
	tags: z.array(z.string()),
	images: z.array(z.string()),
	status: z.enum(['draft', 'active', 'archived']),
	weight: z.number().positive().nullable(),
	dimensions: z.object({
		length: z.number(),
		width: z.number(),
		height: z.number(),
	}),
	seoTitle: z.string().max(60, 'SEO title must not exceed 60 characters'),
	seoDescription: z
		.string()
		.max(160, 'SEO description must not exceed 160 characters'),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function CreateProductPage() {
	const router = useRouter();
	const { createProduct, categories, fetchCategories, productsLoading } =
		useProductsStore();

	const [isLoading, setIsLoading] = useState(false);
	const [activeTab, setActiveTab] = useState('basic');

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	const form = useForm<ProductFormValues>({
		resolver: zodResolver(productFormSchema),
		defaultValues: {
			name: '',
			slug: '',
			description: '',
			shortDescription: '',
			price: 0,
			compareAtPrice: null,
			costPerItem: null,
			sku: '',
			barcode: '',
			quantity: 0,
			trackQuantity: true,
			allowBackorders: false,
			lowStockThreshold: 5,
			categoryId: '',
			tags: [],
			images: [],
			status: 'draft',
			featured: false,
			weight: null,
			dimensions: { length: 0, width: 0, height: 0 },
			seoTitle: '',
			seoDescription: '',
		},
	});

	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
		setValue,
		getValues,
		watch,
	} = form;

	const {
		fields: tagFields,
		append: addTag,
		remove: removeTag,
	} = useFieldArray({
		control: control as any,
		name: 'tags' as any,
	});

	// Watch all values to ensure UI components (Switches, Selects, etc.) are reactive
	const {
		trackQuantity,
		featured,
		status,
		images,
		categoryId,
		allowBackorders,
	} = watch();

	const onSubmit = async (data: ProductFormValues) => {
		setIsLoading(true);
		try {
			await createProduct(data);
			toast.success('Product created successfully!');
			router.push('/products');
			router.refresh();
		} catch (error) {
			console.error('Error creating product:', error);
			toast.error('Failed to create product. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='container mx-auto px-4 py-8 max-w-6xl'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold'>Create New Product</h1>
				<p className='text-gray-600 mt-2'>
					Add a new product to your inventory
				</p>
			</div>

			<form
				onSubmit={handleSubmit(onSubmit)}
				className='space-y-8'>
				<Tabs
					value={activeTab}
					onValueChange={(val) => setActiveTab(val || 'basic')}
					className='space-y-6'>
					<TabsList className='grid w-full grid-cols-5 lg:w-auto'>
						<TabsTrigger value='basic'>Basic Info</TabsTrigger>
						<TabsTrigger value='pricing'>Pricing</TabsTrigger>
						<TabsTrigger value='inventory'>Inventory</TabsTrigger>
						<TabsTrigger value='media'>Media</TabsTrigger>
						<TabsTrigger value='seo'>SEO</TabsTrigger>
					</TabsList>

					{/* Basic Information Tab */}
					<TabsContent
						value='basic'
						className='space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle>Basic Information</CardTitle>
								<CardDescription>
									Essential information about your product
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-6'>
								{/* Product Name */}
								<div className='space-y-2'>
									<label className='text-sm font-medium'>Product Name *</label>
									<Input
										placeholder='e.g., Wireless Headphones'
										{...register('name', {
											onChange: (e) => {
												if (!getValues('slug')) {
													setValue('slug', generateSlug(e.target.value));
												}
											},
										})}
									/>
									{errors.name && (
										<p className='text-sm text-red-500'>
											{errors.name.message}
										</p>
									)}
								</div>

								{/* Slug */}
								<div className='space-y-2'>
									<label className='text-sm font-medium'>Slug *</label>
									<Input
										placeholder='e.g., wireless-headphones'
										{...register('slug')}
									/>
									<p className='text-sm text-gray-500'>
										URL-friendly version of the product name
									</p>
									{errors.slug && (
										<p className='text-sm text-red-500'>
											{errors.slug.message}
										</p>
									)}
								</div>

								{/* Short Description */}
								<div className='space-y-2'>
									<label className='text-sm font-medium'>
										Short Description
									</label>
									<Textarea
										placeholder='Brief description for product cards'
										className='resize-none'
										rows={2}
										{...register('shortDescription')}
									/>
									{errors.shortDescription && (
										<p className='text-sm text-red-500'>
											{errors.shortDescription.message}
										</p>
									)}
								</div>

								{/* Full Description */}
								<div className='space-y-2'>
									<label className='text-sm font-medium'>
										Full Description *
									</label>
									<Textarea
										placeholder='Detailed product description'
										className='resize-none'
										rows={8}
										{...register('description')}
									/>
									{errors.description && (
										<p className='text-sm text-red-500'>
											{errors.description.message}
										</p>
									)}
								</div>

								{/* Category */}
								<div className='space-y-2'>
									<label className='text-sm font-medium'>Category *</label>
									<Select
										onValueChange={(value) =>
											setValue('categoryId', value || '')
										}
										value={categoryId ?? ''}>
										<SelectTrigger>
											<SelectValue placeholder='Select a category' />
										</SelectTrigger>
										<SelectContent>
											{categories.map((category) => (
												<SelectItem
													key={category.id}
													value={category.id}>
													{category.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{errors.categoryId && (
										<p className='text-sm text-red-500'>
											{errors.categoryId.message}
										</p>
									)}
								</div>

								{/* Tags section */}
								<div>
									<label className='text-sm font-medium'>Tags</label>
									<div className='space-y-2 mt-2'>
										{tagFields.map((field, index) => (
											<div
												key={field.id}
												className='flex gap-2'>
												<Input
													placeholder='e.g., new, sale, featured'
													{...register(`tags.${index}` as any)}
												/>
												<Button
													type='button'
													variant='outline'
													size='icon'
													onClick={() => removeTag(index)}>
													<Trash2 className='h-4 w-4' />
												</Button>
											</div>
										))}
										<Button
											type='button'
											variant='outline'
											size='sm'
											onClick={() => addTag('')}>
											<Plus className='h-4 w-4 mr-2' />
											Add Tag
										</Button>
									</div>
								</div>

								{/* Featured Product */}
								<div className='flex items-center justify-between rounded-lg border p-4'>
									<div className='space-y-0.5'>
										<label className='text-sm font-medium'>
											Featured Product
										</label>
										<p className='text-sm text-gray-500'>
											Show this product on the homepage
										</p>
									</div>
									<Switch
										checked={featured}
										onCheckedChange={(checked) => setValue('featured', checked)}
									/>
								</div>

								{/* Status */}
								<div className='space-y-2'>
									<label className='text-sm font-medium'>Status</label>
									<Select
										onValueChange={(value) =>
											setValue('status', (value as any) || 'draft')
										}
										value={status ?? ''}>
										<SelectTrigger>
											<SelectValue placeholder='Select status' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='draft'>Draft</SelectItem>
											<SelectItem value='active'>Active</SelectItem>
											<SelectItem value='archived'>Archived</SelectItem>
										</SelectContent>
									</Select>
									<p className='text-sm text-gray-500'>
										Draft products are not visible to customers
									</p>
									{errors.status && (
										<p className='text-sm text-red-500'>
											{errors.status.message}
										</p>
									)}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Pricing Tab */}
					<TabsContent
						value='pricing'
						className='space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle>Pricing</CardTitle>
								<CardDescription>
									Set the price and cost information
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-6'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									{/* Price */}
									<div className='space-y-2'>
										<label className='text-sm font-medium'>Price *</label>
										<Input
											type='number'
											step='0.01'
											placeholder='0.00'
											{...register('price', { valueAsNumber: true })}
										/>
										{errors.price && (
											<p className='text-sm text-red-500'>
												{errors.price.message}
											</p>
										)}
									</div>

									{/* Compare at Price */}
									<div className='space-y-2'>
										<label className='text-sm font-medium'>
											Compare at Price
										</label>
										<Input
											type='number'
											step='0.01'
											placeholder='Original price for sale display'
											{...register('compareAtPrice', { valueAsNumber: true })}
										/>
										<p className='text-sm text-gray-500'>
											Original price to show discount
										</p>
										{errors.compareAtPrice && (
											<p className='text-sm text-red-500'>
												{errors.compareAtPrice.message}
											</p>
										)}
									</div>

									{/* Cost per Item */}
									<div className='space-y-2'>
										<label className='text-sm font-medium'>Cost per Item</label>
										<Input
											type='number'
											step='0.01'
											placeholder='Your cost'
											{...register('costPerItem', { valueAsNumber: true })}
										/>
										<p className='text-sm text-gray-500'>
											Used for profit calculations
										</p>
										{errors.costPerItem && (
											<p className='text-sm text-red-500'>
												{errors.costPerItem.message}
											</p>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Inventory Tab */}
					<TabsContent
						value='inventory'
						className='space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle>Inventory</CardTitle>
								<CardDescription>Manage stock and tracking</CardDescription>
							</CardHeader>
							<CardContent className='space-y-6'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
									{/* SKU */}
									<div className='space-y-2'>
										<label className='text-sm font-medium'>SKU *</label>
										<Input
											placeholder='Unique identifier'
											{...register('sku')}
										/>
										{errors.sku && (
											<p className='text-sm text-red-500'>
												{errors.sku.message}
											</p>
										)}
									</div>

									{/* Barcode */}
									<div className='space-y-2'>
										<label className='text-sm font-medium'>Barcode</label>
										<Input
											placeholder='UPC, EAN, or ISBN'
											{...register('barcode')}
										/>
										{errors.barcode && (
											<p className='text-sm text-red-500'>
												{errors.barcode.message}
											</p>
										)}
									</div>
								</div>

								{/* Track Quantity */}
								<div className='flex items-center justify-between rounded-lg border p-4'>
									<div className='space-y-0.5'>
										<label className='text-sm font-medium'>
											Track Quantity
										</label>
										<p className='text-sm text-gray-500'>
											Enable inventory tracking for this product
										</p>
									</div>
									<Switch
										checked={trackQuantity}
										onCheckedChange={(checked) =>
											setValue('trackQuantity', checked)
										}
									/>
								</div>

								{trackQuantity && (
									<>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
											{/* Quantity */}
											<div className='space-y-2'>
												<label className='text-sm font-medium'>Quantity</label>
												<Input
													type='number'
													placeholder='0'
													{...register('quantity', { valueAsNumber: true })}
												/>
												{errors.quantity && (
													<p className='text-sm text-red-500'>
														{errors.quantity.message}
													</p>
												)}
											</div>

											{/* Low Stock Threshold */}
											<div className='space-y-2'>
												<label className='text-sm font-medium'>
													Low Stock Threshold
												</label>
												<Input
													type='number'
													placeholder='5'
													{...register('lowStockThreshold', {
														valueAsNumber: true,
													})}
												/>
												<p className='text-sm text-gray-500'>
													Alert when stock drops below this number
												</p>
												{errors.lowStockThreshold && (
													<p className='text-sm text-red-500'>
														{errors.lowStockThreshold.message}
													</p>
												)}
											</div>
										</div>

										{/* Allow Backorders */}
										<div className='flex items-center justify-between rounded-lg border p-4'>
											<div className='space-y-0.5'>
												<label className='text-sm font-medium'>
													Allow Backorders
												</label>
												<p className='text-sm text-gray-500'>
													Allow customers to purchase when out of stock
												</p>
											</div>
											<Switch
												checked={allowBackorders}
												onCheckedChange={(checked) =>
													setValue('allowBackorders', checked)
												}
											/>
										</div>
									</>
								)}
							</CardContent>
						</Card>

						{/* Shipping */}
						<Card>
							<CardHeader>
								<CardTitle>Shipping</CardTitle>
								<CardDescription>Product dimensions and weight</CardDescription>
							</CardHeader>
							<CardContent className='space-y-6'>
								{/* Weight */}
								<div className='space-y-2'>
									<label className='text-sm font-medium'>Weight (kg)</label>
									<Input
										type='number'
										step='0.01'
										placeholder='0.00'
										{...register('weight', { valueAsNumber: true })}
									/>
									{errors.weight && (
										<p className='text-sm text-red-500'>
											{errors.weight.message}
										</p>
									)}
								</div>

								{/* Dimensions */}
								<div className='grid grid-cols-3 gap-4'>
									<div className='space-y-2'>
										<label className='text-sm font-medium'>Length (cm)</label>
										<Input
											type='number'
											step='0.1'
											{...register('dimensions.length', {
												valueAsNumber: true,
											})}
										/>
									</div>

									<div className='space-y-2'>
										<label className='text-sm font-medium'>Width (cm)</label>
										<Input
											type='number'
											step='0.1'
											{...register('dimensions.width', { valueAsNumber: true })}
										/>
									</div>

									<div className='space-y-2'>
										<label className='text-sm font-medium'>Height (cm)</label>
										<Input
											type='number'
											step='0.1'
											{...register('dimensions.height', {
												valueAsNumber: true,
											})}
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Media Tab */}
					<TabsContent
						value='media'
						className='space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle>Product Images</CardTitle>
								<CardDescription>
									Upload images for your product
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ImageUpload
									multiple
									value={images ?? []}
									onChange={(newImages) => setValue('images', newImages)}
									onRemove={(url) =>
										setValue(
											'images',
											(images ?? []).filter((img) => img !== url)
										)
									}
								/>
								{errors.images && (
									<p className='text-sm text-red-500 mt-2'>
										{errors.images.message}
									</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					{/* SEO Tab */}
					<TabsContent
						value='seo'
						className='space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle>SEO Settings</CardTitle>
								<CardDescription>
									Optimize your product for search engines
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-6'>
								{/* SEO Title */}
								<div className='space-y-2'>
									<label className='text-sm font-medium'>SEO Title</label>
									<Input
										placeholder='Leave empty to use product name'
										{...register('seoTitle')}
									/>
									<p className='text-sm text-gray-500'>
										Recommended length: 50-60 characters
									</p>
									{errors.seoTitle && (
										<p className='text-sm text-red-500'>
											{errors.seoTitle.message}
										</p>
									)}
								</div>

								{/* SEO Description */}
								<div className='space-y-2'>
									<label className='text-sm font-medium'>SEO Description</label>
									<Textarea
										placeholder='Leave empty to use product description'
										className='resize-none'
										rows={3}
										{...register('seoDescription')}
									/>
									<p className='text-sm text-gray-500'>
										Recommended length: 150-160 characters
									</p>
									{errors.seoDescription && (
										<p className='text-sm text-red-500'>
											{errors.seoDescription.message}
										</p>
									)}
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				{/* Form Actions */}
				<div className='flex gap-4 pt-4'>
					<Button
						type='button'
						variant='outline'
						onClick={() => router.back()}
						disabled={isLoading || productsLoading}>
						Cancel
					</Button>
					<Button
						type='submit'
						disabled={isLoading || productsLoading}>
						{isLoading ? 'Creating...' : 'Create Product'}
					</Button>
				</div>
			</form>
		</div>
	);
}

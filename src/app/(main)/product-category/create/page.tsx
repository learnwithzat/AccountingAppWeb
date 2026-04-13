/** @format */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

// UI
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
import { ImageUpload } from '@/components/ui/image-upload';

// Store
import { useProductsStore } from '@/store/useProductsStore';

/* ----------------------------- HELPERS ----------------------------- */

const generateSlug = (name: string) =>
	name
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '');

const buildCategoryOptions = (
	list: any[],
	level = 0
): { value: string; label: string }[] =>
	list.flatMap((cat) => [
		{
			value: cat.id,
			label: `${'—'.repeat(level)}${level ? ' ' : ''}${cat.name}`,
		},
		...(cat.subcategories ?
			buildCategoryOptions(cat.subcategories, level + 1)
		:	[]),
	]);

/* ----------------------------- SCHEMA ----------------------------- */

const schema = z.object({
	name: z.string().min(2).max(50),
	slug: z
		.string()
		.min(2)
		.max(50)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
	description: z.string().max(500).optional(),
	parentCategoryId: z.string().optional(),
	imageUrl: z.string().url().optional().or(z.literal('')),
	status: z.enum(['active', 'inactive']),
	displayOrder: z.number().int().min(0),
	seoTitle: z.string().max(60).optional(),
	seoDescription: z.string().max(160).optional(),
});

type FormValues = z.infer<typeof schema>;

/* ----------------------------- COMPONENT ----------------------------- */

export default function CreateProductCategoryPage() {
	const router = useRouter();
	const { createCategory, categories, fetchCategories, categoriesLoading } =
		useProductsStore();

	const [isLoading, setIsLoading] = useState(false);

	/* ----------------------------- FORM ----------------------------- */

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: '',
			slug: '',
			description: '',
			parentCategoryId: '',
			imageUrl: '',
			status: 'active',
			displayOrder: 0,
			seoTitle: '',
			seoDescription: '',
		},
	});

	const name = watch('name');
	const slug = watch('slug');

	/* ----------------------------- EFFECTS ----------------------------- */

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	// Auto-generate slug
	useEffect(() => {
		if (!slug || slug === generateSlug(name)) {
			setValue('slug', generateSlug(name));
		}
	}, [name]);

	/* ----------------------------- MEMO ----------------------------- */

	const categoryOptions = useMemo(
		() => buildCategoryOptions(categories),
		[categories]
	);

	/* ----------------------------- SUBMIT ----------------------------- */

	const onSubmit = async (data: FormValues) => {
		try {
			setIsLoading(true);
			await createCategory(data);
			toast.success('Category created successfully');
			router.push('/product-category');
			router.refresh();
		} catch (err) {
			console.error(err);
			toast.error('Failed to create category');
		} finally {
			setIsLoading(false);
		}
	};

	/* ----------------------------- UI ----------------------------- */

	return (
		<div className='container mx-auto max-w-4xl px-4 py-8'>
			{/* Header */}
			<div className='mb-8'>
				<h1 className='text-3xl font-bold'>Create Product Category</h1>
				<p className='text-muted-foreground mt-2'>
					Organize your products with categories
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Category Information</CardTitle>
					<CardDescription>Fill details to create category</CardDescription>
				</CardHeader>

				<CardContent>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className='space-y-6'>
						{/* NAME */}
						<div>
							<label className='text-sm font-medium'>Name *</label>
							<Input
								{...register('name')}
								placeholder='Electronics'
							/>
							{errors.name && (
								<p className='text-red-500 text-sm'>{errors.name.message}</p>
							)}
						</div>

						{/* SLUG */}
						<div>
							<label className='text-sm font-medium'>Slug *</label>
							<Input
								{...register('slug')}
								placeholder='electronics'
							/>
							{errors.slug && (
								<p className='text-red-500 text-sm'>{errors.slug.message}</p>
							)}
						</div>

						{/* PARENT */}
						<div>
							<label className='text-sm font-medium'>Parent Category</label>
							<Select
								onValueChange={(v) =>
									setValue('parentCategoryId', v as string)
								}>
								<SelectTrigger>
									<SelectValue placeholder='None' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value=''>None</SelectItem>
									{categoryOptions.map((opt) => (
										<SelectItem
											key={opt.value}
											value={opt.value}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* DESCRIPTION */}
						<div>
							<label className='text-sm font-medium'>Description</label>
							<Textarea
								{...register('description')}
								rows={4}
							/>
						</div>

						{/* IMAGE */}
						<div>
							<label className='text-sm font-medium'>Image</label>
							<ImageUpload
								multiple={false}
								value={watch('imageUrl') ? [watch('imageUrl') as string] : []}
								onChange={(img) => setValue('imageUrl', img[0] || '')}
								onRemove={() => setValue('imageUrl', '')}
							/>
						</div>

						{/* STATUS + ORDER */}
						<div className='grid md:grid-cols-2 gap-4'>
							<div>
								<label>Status *</label>
								<Select
									defaultValue='active'
									onValueChange={(v) =>
										setValue('status', v as 'active' | 'inactive')
									}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='active'>Active</SelectItem>
										<SelectItem value='inactive'>Inactive</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<label>Display Order</label>
								<Input
									type='number'
									{...register('displayOrder', { valueAsNumber: true })}
								/>
							</div>
						</div>

						{/* SEO */}
						<div className='space-y-4'>
							<h3 className='font-semibold'>SEO</h3>

							<Input
								{...register('seoTitle')}
								placeholder='SEO Title'
							/>

							<Textarea
								{...register('seoDescription')}
								rows={3}
								placeholder='SEO Description'
							/>
						</div>

						{/* ACTIONS */}
						<div className='flex gap-3'>
							<Button
								type='button'
								variant='outline'
								onClick={() => router.back()}>
								Cancel
							</Button>

							<Button
								type='submit'
								disabled={isLoading || categoriesLoading}>
								{isLoading ? 'Creating...' : 'Create'}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

/** @format */

'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

interface ImageUploadProps {
	value: string[];
	onChange: (images: string[]) => void;
	onRemove?: (image: string) => void;
	multiple?: boolean;
	maxImages?: number;
	accept?: Record<string, string[]>;
	maxSize?: number; // in bytes
}

export function ImageUpload({
	value = [],
	onChange,
	onRemove,
	multiple = true,
	maxImages = 10,
	accept = {
		'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
	},
	maxSize = 5 * 1024 * 1024, // 5MB
}: ImageUploadProps) {
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
		{}
	);

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			if (!multiple && acceptedFiles.length + value.length > 1) {
				toast.error('You can only upload one image');
				return;
			}

			if (value.length + acceptedFiles.length > maxImages) {
				toast.error(`You can only upload up to ${maxImages} images`);
				return;
			}

			const uploadPromises = acceptedFiles.map(async (file) => {
				if (file.size > maxSize) {
					toast.error(`${file.name} is too large.`);
					return null;
				}

				const formData = new FormData();
				formData.append('file', file);

				try {
					const mockProgress = setInterval(() => {
						setUploadProgress((prev) => ({
							...prev,
							[file.name]: Math.min((prev[file.name] || 0) + 10, 90),
						}));
					}, 200);

					// Upload to your API endpoint
					const response = await fetch('/api/upload', {
						method: 'POST',
						body: formData,
					});

					clearInterval(mockProgress);
					if (!response.ok) throw new Error('Upload failed');
					const data = await response.json();
					setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
					return data.url; // Assuming API returns { url: string }
				} catch (error) {
					console.error('Upload error:', error);
					toast.error(`Failed to upload ${file.name}`);
					return null;
				} finally {
					setTimeout(() => {
						setUploadProgress((prev) => {
							const newProgress = { ...prev };
							delete newProgress[file.name];
							return newProgress;
						});
					}, 1000);
				}
			});

			setUploading(true);
			const uploadedUrls = (await Promise.all(uploadPromises)).filter(
				(url): url is string => url !== null
			);

			if (uploadedUrls.length > 0) {
				onChange(multiple ? [...value, ...uploadedUrls] : uploadedUrls);
				toast.success(`Successfully uploaded ${uploadedUrls.length} image(s)`);
			}
			setUploading(false);
		},
		[value, onChange, multiple, maxImages, maxSize]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept,
		maxSize,
		multiple,
		disabled: uploading,
	});

	const handleRemove = (image: string, index: number) => {
		if (onRemove) {
			onRemove(image);
		}
		const newImages = [...value];
		newImages.splice(index, 1);
		onChange(newImages);
		toast.success('Image removed');
	};

	const handleReorder = (dragIndex: number, hoverIndex: number) => {
		const newImages = [...value];
		const dragImage = newImages[dragIndex];
		newImages.splice(dragIndex, 1);
		newImages.splice(hoverIndex, 0, dragImage);
		onChange(newImages);
	};

	return (
		<div className='space-y-4'>
			{/* Dropzone */}
			<div
				{...getRootProps()}
				className={`
					border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
					transition-colors duration-200
					${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
					${uploading ? 'opacity-50 cursor-not-allowed' : ''}
				`}>
				<input {...getInputProps()} />
				<Upload className='mx-auto h-12 w-12 text-gray-400 mb-4' />
				<p className='text-sm text-gray-600'>
					{isDragActive ?
						'Drop the images here...'
					:	'Drag & drop images here, or click to select'}
				</p>
				<p className='text-xs text-gray-500 mt-2'>
					Supported formats: PNG, JPG, JPEG, GIF, WEBP (Max{' '}
					{maxSize / 1024 / 1024}MB)
				</p>
				{multiple && (
					<p className='text-xs text-gray-500'>Max {maxImages} images</p>
				)}
			</div>

			{/* Upload Progress */}
			{uploading && Object.keys(uploadProgress).length > 0 && (
				<div className='space-y-2'>
					{Object.entries(uploadProgress).map(([fileName, progress]) => (
						<div
							key={fileName}
							className='space-y-1'>
							<div className='flex justify-between text-sm'>
								<span className='truncate'>{fileName}</span>
								<span>{progress}%</span>
							</div>
							<Progress value={progress} />
						</div>
					))}
				</div>
			)}

			{/* Image Grid */}
			{value.length > 0 && (
				<div className='space-y-3'>
					<label className='text-sm font-medium'>
						Uploaded Images ({value.length}/{maxImages})
					</label>
					<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
						{value.map((image, index) => (
							<ImageCard
								key={`${image}-${index}`}
								image={image}
								index={index}
								onRemove={() => handleRemove(image, index)}
								onReorder={handleReorder}
								totalImages={value.length}
							/>
						))}
					</div>
				</div>
			)}

			{/* No Images Message */}
			{!uploading && value.length === 0 && (
				<div className='text-center py-8 bg-gray-50 rounded-lg'>
					<ImageIcon className='mx-auto h-12 w-12 text-gray-400' />
					<p className='text-sm text-gray-500 mt-2'>No images uploaded yet</p>
				</div>
			)}
		</div>
	);
}

// Image Card Component with Drag and Drop
function ImageCard({
	image,
	index,
	onRemove,
	onReorder,
	totalImages,
}: {
	image: string;
	index: number;
	onRemove: () => void;
	onReorder: (dragIndex: number, hoverIndex: number) => void;
	totalImages: number;
}) {
	const [isDragging, setIsDragging] = useState(false);
	const [dragIndex, setDragIndex] = useState<number | null>(null);

	const handleDragStart = (e: React.DragEvent, idx: number) => {
		setDragIndex(idx);
		e.dataTransfer.effectAllowed = 'move';
		setIsDragging(true);
	};

	const handleDragOver = (e: React.DragEvent, idx: number) => {
		e.preventDefault();
		if (dragIndex !== null && dragIndex !== idx) {
			onReorder(dragIndex, idx);
			setDragIndex(idx);
		}
	};

	const handleDragEnd = () => {
		setDragIndex(null);
		setIsDragging(false);
	};

	return (
		<div
			draggable={totalImages > 1}
			onDragStart={(e) => handleDragStart(e, index)}
			onDragOver={(e) => handleDragOver(e, index)}
			onDragEnd={handleDragEnd}
			className={`
				relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border-2
				transition-all duration-200
				${isDragging && dragIndex === index ? 'opacity-50' : 'opacity-100'}
				${totalImages > 1 ? 'cursor-move' : 'cursor-default'}
			`}>
			<Image
				src={image}
				alt={`Product image ${index + 1}`}
				fill
				className='object-cover'
				sizes='(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'
			/>

			{/* Overlay */}
			<div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200'>
				{/* Remove Button */}
				<button
					type='button'
					onClick={onRemove}
					className='absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600'>
					<X className='h-4 w-4' />
				</button>

				{/* Index Badge */}
				<div className='absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded'>
					{index + 1}
				</div>

				{/* Drag Handle */}
				{totalImages > 1 && (
					<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity'>
						<div className='bg-black bg-opacity-70 text-white p-2 rounded-full'>
							<svg
								className='w-4 h-4'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M4 8h16M4 16h16'
								/>
							</svg>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

// Optional: Simple Image Upload without drag and drop
export function SimpleImageUpload({
	value,
	onChange,
	multiple = true,
	maxImages = 5,
}: {
	value: string[];
	onChange: (images: string[]) => void;
	multiple?: boolean;
	maxImages?: number;
}) {
	const [uploading, setUploading] = useState(false);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);

		if (!multiple && files.length + value.length > 1) {
			toast.error('You can only upload one image');
			return;
		}

		if (value.length + files.length > maxImages) {
			toast.error(`You can only upload up to ${maxImages} images`);
			return;
		}

		setUploading(true);

		const uploadPromises = files.map(async (file) => {
			const formData = new FormData();
			formData.append('file', file);

			try {
				const response = await fetch('/api/upload', {
					method: 'POST',
					body: formData,
				});

				if (!response.ok) throw new Error('Upload failed');
				const data = await response.json();
				return data.url;
			} catch (error) {
				console.error('Upload error:', error);
				toast.error(`Failed to upload ${file.name}`);
				return null;
			}
		});

		const uploadedUrls = (await Promise.all(uploadPromises)).filter(
			(url): url is string => url !== null
		);

		if (uploadedUrls.length > 0) {
			onChange(multiple ? [...value, ...uploadedUrls] : uploadedUrls);
			toast.success(`Successfully uploaded ${uploadedUrls.length} image(s)`);
		}

		setUploading(false);
	};

	const handleRemove = (index: number) => {
		const newImages = [...value];
		newImages.splice(index, 1);
		onChange(newImages);
	};

	return (
		<div className='space-y-4'>
			<div className='flex items-center gap-4'>
				<Button
					type='button'
					variant='outline'
					onClick={() => document.getElementById('image-upload-input')?.click()}
					disabled={uploading}>
					{uploading ?
						<>
							<Loader2 className='h-4 w-4 mr-2 animate-spin' />
							Uploading...
						</>
					:	<>
							<Upload className='h-4 w-4 mr-2' />
							Select Images
						</>
					}
				</Button>
				<input
					id='image-upload-input'
					type='file'
					accept='image/*'
					multiple={multiple}
					onChange={handleFileSelect}
					className='hidden'
					disabled={uploading}
				/>
				<p className='text-sm text-gray-500'>
					{value.length}/{maxImages} images
				</p>
			</div>

			{value.length > 0 && (
				<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
					{value.map((image, index) => (
						<div
							key={index}
							className='relative group aspect-square rounded-lg overflow-hidden bg-gray-100'>
							<Image
								src={image}
								alt={`Product image ${index + 1}`}
								fill
								className='object-cover'
							/>
							<button
								type='button'
								onClick={() => handleRemove(index)}
								className='absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity'>
								<X className='h-4 w-4' />
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

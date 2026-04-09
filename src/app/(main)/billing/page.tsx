/** @format */
'use client';

import { useState } from 'react';
import API from '@/lib/api';
import { Zap, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const FEATURES = [
	'Unlimited company members',
	'Advanced analytics & reports',
	'Priority support',
	'Custom integrations',
];

export default function BillingPage() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleUpgrade = async () => {
		try {
			setLoading(true);
			setError(null);
			const res = await API.post('/billing/checkout');
			window.location.href = res.data.url;
		} catch (err: any) {
			setError(
				err?.response?.data?.message ??
					'Unable to start checkout. Please try again.'
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex min-h-screen items-center justify-center bg-background p-6'>
			<div className='w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm'>
				{/* Icon */}
				<div className='mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary'>
					<Zap className='h-5 w-5' />
				</div>

				{/* Heading */}
				<h1 className='mb-2 text-center text-xl font-semibold tracking-tight text-foreground'>
					Upgrade to Pro
				</h1>
				<p className='mb-7 text-center text-sm text-muted-foreground'>
					Your trial has expired. Upgrade now to continue with full access.
				</p>

				{/* Features */}
				<ul className='mb-7 space-y-2.5'>
					{FEATURES.map((f) => (
						<li
							key={f}
							className='flex items-center gap-2.5 text-sm text-foreground/80'>
							<span className='h-1.5 w-1.5 shrink-0 rounded-full bg-primary' />
							{f}
						</li>
					))}
				</ul>

				{/* CTA */}
				<button
					onClick={handleUpgrade}
					disabled={loading}
					className='flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60'>
					{loading ?
						<>
							<Loader2 className='h-4 w-4 animate-spin' /> Processing…
						</>
					:	<>
							<span>Upgrade now</span>
							<ArrowRight className='h-4 w-4' />
						</>
					}
				</button>

				{/* Error */}
				{error && (
					<div className='mt-4 flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive'>
						<AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
						{error}
					</div>
				)}
			</div>
		</div>
	);
}

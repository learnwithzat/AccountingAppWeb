/** @format */

'use client';

import { useEffect, useMemo, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type DocType = 'employee' | 'vehicle' | 'vendor' | 'insurance' | 'license';
type DocStatus = 'expired' | 'soon' | 'active';
type SortKey = 'expiry' | 'name' | 'owner';
type SortDir = 'asc' | 'desc';

type DocumentItem = {
	id: string;
	name: string;
	type: DocType;
	owner: string;
	expiryDate: string; // ISO yyyy-mm-dd
	notes?: string;
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_DOCS: DocumentItem[] = [
	{
		id: '1',
		name: 'Iqama',
		type: 'employee',
		owner: 'Ahmed Al-Rashidi',
		expiryDate: '2026-04-25',
	},
	{
		id: '2',
		name: 'Passport',
		type: 'employee',
		owner: 'John Williams',
		expiryDate: '2026-08-01',
	},
	{
		id: '3',
		name: 'Vehicle License',
		type: 'vehicle',
		owner: 'Truck #12',
		expiryDate: '2025-12-01',
	},
	{
		id: '4',
		name: 'Vendor Contract',
		type: 'vendor',
		owner: 'ABC Construction Co.',
		expiryDate: '2024-10-10',
	},
	{
		id: '5',
		name: 'Work Permit',
		type: 'employee',
		owner: 'Carlos Mendoza',
		expiryDate: '2026-05-10',
	},
	{
		id: '6',
		name: 'Insurance Certificate',
		type: 'insurance',
		owner: 'Fleet Policy 2024',
		expiryDate: '2026-03-01',
	},
	{
		id: '7',
		name: 'Operator License',
		type: 'license',
		owner: 'Crane Unit #3',
		expiryDate: '2025-11-15',
	},
	{
		id: '8',
		name: 'Iqama',
		type: 'employee',
		owner: 'Omar Khaled',
		expiryDate: '2026-06-30',
	},
	{
		id: '9',
		name: 'Trade License',
		type: 'vendor',
		owner: 'XYZ Suppliers Ltd.',
		expiryDate: '2026-02-14',
	},
	{
		id: '10',
		name: 'Passport',
		type: 'employee',
		owner: 'Fatima Hassan',
		expiryDate: '2027-01-20',
	},
];

// ─── Constants ────────────────────────────────────────────────────────────────

const RANGE_OPTIONS = [
	{ label: '7 days', value: 7 },
	{ label: '30 days', value: 30 },
	{ label: '90 days', value: 90 },
	{ label: '1 year', value: 365 },
];

const TYPE_LABELS: Record<DocType, string> = {
	employee: 'Employee',
	vehicle: 'Vehicle',
	vendor: 'Vendor',
	insurance: 'Insurance',
	license: 'License',
};

const TYPE_ICONS: Record<DocType, string> = {
	employee: '👤',
	vehicle: '🚛',
	vendor: '🏢',
	insurance: '🛡️',
	license: '📝',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysDiff(expiryDate: string): number {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const expiry = new Date(expiryDate);
	expiry.setHours(0, 0, 0, 0);
	return Math.ceil((expiry.getTime() - today.getTime()) / 86_400_000);
}

function getStatus(diff: number, range: number): DocStatus {
	if (diff < 0) return 'expired';
	if (diff <= range) return 'soon';
	return 'active';
}

function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});
}

function formatCountdown(diff: number): string {
	if (diff < 0) return `${Math.abs(diff)}d overdue`;
	if (diff === 0) return 'Expires today';
	if (diff < 30) return `${diff}d left`;
	const months = Math.floor(diff / 30);
	return `~${months}mo left`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DocStatus }) {
	const map: Record<DocStatus, { label: string; className: string }> = {
		expired: { label: 'Expired', className: 'badge-expired' },
		soon: { label: 'Expiring soon', className: 'badge-soon' },
		active: { label: 'Active', className: 'badge-active' },
	};
	const { label, className } = map[status];
	return <span className={`em-badge ${className}`}>{label}</span>;
}

function StatCard({
	label,
	value,
	sub,
	accent,
}: {
	label: string;
	value: number;
	sub: string;
	accent: 'danger' | 'warning' | 'success' | 'neutral';
}) {
	return (
		<div className={`em-stat-card em-stat-${accent}`}>
			<div className='em-stat-label'>{label}</div>
			<div className='em-stat-value'>{value}</div>
			<div className='em-stat-sub'>{sub}</div>
		</div>
	);
}

function DocCard({ doc, range }: { doc: DocumentItem; range: number }) {
	const diff = getDaysDiff(doc.expiryDate);
	const status = getStatus(diff, range);

	const countdownClass =
		status === 'expired' ? 'countdown-expired'
		: status === 'soon' ? 'countdown-soon'
		: 'countdown-ok';

	return (
		<div className='em-doc-card'>
			<div className={`em-doc-icon em-icon-${doc.type}`}>
				{TYPE_ICONS[doc.type]}
			</div>

			<div className='em-doc-body'>
				<div className='em-doc-name'>
					{doc.name}
					<span className='em-type-chip'>{TYPE_LABELS[doc.type]}</span>
				</div>
				<div className='em-doc-owner'>{doc.owner}</div>
			</div>

			<div className='em-doc-expiry'>
				<div className='em-expiry-date'>{formatDate(doc.expiryDate)}</div>
				<div className={`em-countdown ${countdownClass}`}>
					{formatCountdown(diff)}
				</div>
			</div>

			<StatusBadge status={status} />
		</div>
	);
}

function EmptyState({ message }: { message: string }) {
	return (
		<div className='em-empty'>
			<div className='em-empty-icon'>📭</div>
			<div>{message}</div>
		</div>
	);
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ExpireManagePage() {
	const [docs, setDocs] = useState<DocumentItem[]>([]);
	const [search, setSearch] = useState('');
	const [range, setRange] = useState(30);
	const [typeFilter, setTypeFilter] = useState<DocType | 'all'>('all');
	const [tab, setTab] = useState<DocStatus>('expired');
	const [sortKey, setSortKey] = useState<SortKey>('expiry');
	const [sortDir, setSortDir] = useState<SortDir>('asc');

	// TODO: replace with real API call
	useEffect(() => {
		setDocs(MOCK_DOCS);
	}, []);

	// ── Filtered + categorized ────────────────────────────────────────────────

	const filtered = useMemo(() => {
		const q = search.toLowerCase();
		return docs.filter((d) => {
			const matchSearch =
				!q ||
				d.name.toLowerCase().includes(q) ||
				d.owner.toLowerCase().includes(q);
			const matchType = typeFilter === 'all' || d.type === typeFilter;
			return matchSearch && matchType;
		});
	}, [docs, search, typeFilter]);

	const categorized = useMemo(() => {
		const map: Record<DocStatus, DocumentItem[]> = {
			expired: [],
			soon: [],
			active: [],
		};
		filtered.forEach((d) => {
			const diff = getDaysDiff(d.expiryDate);
			const status = getStatus(diff, range);
			map[status].push(d);
		});
		return map;
	}, [filtered, range]);

	const visibleDocs = useMemo(() => {
		const list = [...(categorized[tab] ?? [])];
		list.sort((a, b) => {
			let cmp = 0;
			if (sortKey === 'expiry')
				cmp = getDaysDiff(a.expiryDate) - getDaysDiff(b.expiryDate);
			if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
			if (sortKey === 'owner') cmp = a.owner.localeCompare(b.owner);
			return sortDir === 'asc' ? cmp : -cmp;
		});
		return list;
	}, [categorized, tab, sortKey, sortDir]);

	// ── Sort toggle ───────────────────────────────────────────────────────────

	function handleSort(key: SortKey) {
		if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
		else {
			setSortKey(key);
			setSortDir('asc');
		}
	}

	function sortArrow(key: SortKey) {
		if (sortKey !== key) return ' ↕';
		return sortDir === 'asc' ? ' ↑' : ' ↓';
	}

	// ── Stats ─────────────────────────────────────────────────────────────────

	const total = filtered.length;
	const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<div className='em-root'>
			{/* ── Page header ── */}
			<div className='em-header'>
				<div>
					<h1 className='em-title'>Expire manager</h1>
					<p className='em-subtitle'>
						Track document validity across employees, vehicles &amp; vendors
					</p>
				</div>

				{/* Range selector */}
				<div className='em-range-group'>
					{RANGE_OPTIONS.map((opt) => (
						<button
							key={opt.value}
							className={`em-range-btn ${range === opt.value ? 'active' : ''}`}
							onClick={() => setRange(opt.value)}>
							{opt.label}
						</button>
					))}
				</div>
			</div>

			{/* ── Stat cards ── */}
			<div className='em-stats-grid'>
				<StatCard
					label='Expired'
					value={categorized.expired.length}
					sub={`${pct(categorized.expired.length)}% of total`}
					accent='danger'
				/>
				<StatCard
					label='Expiring soon'
					value={categorized.soon.length}
					sub={`within ${range} days`}
					accent='warning'
				/>
				<StatCard
					label='Active'
					value={categorized.active.length}
					sub={`${pct(categorized.active.length)}% of total`}
					accent='success'
				/>
				<StatCard
					label='Total documents'
					value={total}
					sub={`${Object.keys(TYPE_LABELS).length} categories`}
					accent='neutral'
				/>
			</div>

			{/* ── Controls ── */}
			<div className='em-controls'>
				{/* Search */}
				<div className='em-search-wrap'>
					<svg
						className='em-search-icon'
						viewBox='0 0 16 16'
						fill='none'
						stroke='currentColor'
						strokeWidth='1.5'>
						<circle
							cx='6.5'
							cy='6.5'
							r='4.5'
						/>
						<path d='M10.5 10.5l3 3' />
					</svg>
					<input
						className='em-search'
						type='text'
						placeholder='Search name or owner…'
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					{search && (
						<button
							className='em-search-clear'
							onClick={() => setSearch('')}>
							✕
						</button>
					)}
				</div>

				{/* Type filter pills */}
				<div className='em-type-filters'>
					{(['all', ...Object.keys(TYPE_LABELS)] as Array<DocType | 'all'>).map(
						(t) => (
							<button
								key={t}
								className={`em-filter-pill ${typeFilter === t ? 'active' : ''}`}
								onClick={() => setTypeFilter(t)}>
								{t === 'all' ? 'All types' : TYPE_LABELS[t as DocType]}
							</button>
						)
					)}
				</div>
			</div>

			{/* ── Tabs ── */}
			<div className='em-tabs'>
				{(['expired', 'soon', 'active'] as DocStatus[]).map((s) => {
					const counts: Record<DocStatus, number> = {
						expired: categorized.expired.length,
						soon: categorized.soon.length,
						active: categorized.active.length,
					};
					const labels: Record<DocStatus, string> = {
						expired: 'Expired',
						soon: 'Expiring soon',
						active: 'Active',
					};
					return (
						<button
							key={s}
							className={`em-tab ${tab === s ? 'active' : ''} em-tab-${s}`}
							onClick={() => setTab(s)}>
							{labels[s]}
							<span
								className={`em-tab-count ${tab === s ? `em-tab-count-${s}` : ''}`}>
								{counts[s]}
							</span>
						</button>
					);
				})}
			</div>

			{/* ── Sort bar ── */}
			{visibleDocs.length > 1 && (
				<div className='em-sort-bar'>
					<span className='em-sort-label'>Sort by</span>
					{(['expiry', 'name', 'owner'] as SortKey[]).map((k) => (
						<button
							key={k}
							className={`em-sort-btn ${sortKey === k ? 'active' : ''}`}
							onClick={() => handleSort(k)}>
							{k.charAt(0).toUpperCase() + k.slice(1)}
							{sortArrow(k)}
						</button>
					))}
				</div>
			)}

			{/* ── Document list ── */}
			<div className='em-doc-list'>
				{visibleDocs.length === 0 ?
					<EmptyState message='No documents match your filters in this category.' />
				:	visibleDocs.map((d) => (
						<DocCard
							key={d.id}
							doc={d}
							range={range}
						/>
					))
				}
			</div>

			{/* ── Styles ── */}
			<style>{`
				.em-root {
					font-family: 'Sora', system-ui, sans-serif;
					padding: 1.5rem;
					color: var(--color-text-primary, #111);
					max-width: 900px;
				}

				/* Header */
				.em-header {
					display: flex;
					align-items: flex-start;
					justify-content: space-between;
					flex-wrap: wrap;
					gap: 12px;
					margin-bottom: 1.25rem;
				}
				.em-title {
					font-size: 20px;
					font-weight: 600;
					letter-spacing: -0.02em;
					margin: 0;
				}
				.em-subtitle {
					font-size: 13px;
					color: var(--color-text-secondary);
					margin: 3px 0 0;
				}

				/* Range */
				.em-range-group { display: flex; gap: 6px; flex-wrap: wrap; }
				.em-range-btn {
					font-size: 12px;
					font-family: 'DM Mono', monospace;
					padding: 6px 12px;
					border: 0.5px solid var(--color-border-tertiary);
					border-radius: 8px;
					background: transparent;
					color: var(--color-text-secondary);
					cursor: pointer;
					transition: all 0.15s;
				}
				.em-range-btn:hover { border-color: var(--color-border-primary); color: var(--color-text-primary); }
				.em-range-btn.active {
					background: var(--color-text-primary);
					color: var(--color-background-primary);
					border-color: transparent;
				}

				/* Stats */
				.em-stats-grid {
					display: grid;
					grid-template-columns: repeat(4, minmax(0, 1fr));
					gap: 10px;
					margin-bottom: 1.25rem;
				}
				.em-stat-card {
					background: var(--color-background-secondary);
					border-radius: 8px;
					padding: 14px 16px;
					position: relative;
					overflow: hidden;
				}
				.em-stat-card::before {
					content: '';
					position: absolute;
					top: 0; left: 0; right: 0;
					height: 3px;
				}
				.em-stat-danger::before  { background: #E24B4A; }
				.em-stat-warning::before { background: #EF9F27; }
				.em-stat-success::before { background: #639922; }
				.em-stat-neutral::before { background: var(--color-border-secondary); }

				.em-stat-label {
					font-size: 11px;
					letter-spacing: 0.06em;
					text-transform: uppercase;
					font-weight: 500;
					color: var(--color-text-tertiary);
				}
				.em-stat-value {
					font-size: 28px;
					font-weight: 600;
					font-family: 'DM Mono', monospace;
					letter-spacing: -0.02em;
					margin: 4px 0 2px;
				}
				.em-stat-danger  .em-stat-value { color: #A32D2D; }
				.em-stat-warning .em-stat-value { color: #854F0B; }
				.em-stat-success .em-stat-value { color: #3B6D11; }
				.em-stat-sub { font-size: 11px; color: var(--color-text-tertiary); }

				/* Controls */
				.em-controls {
					display: flex;
					gap: 10px;
					flex-wrap: wrap;
					align-items: center;
					margin-bottom: 1rem;
				}
				.em-search-wrap {
					position: relative;
					flex: 1;
					min-width: 200px;
				}
				.em-search-icon {
					position: absolute;
					left: 10px; top: 50%;
					transform: translateY(-50%);
					width: 14px; height: 14px;
					color: var(--color-text-tertiary);
					pointer-events: none;
				}
				.em-search {
					width: 100%;
					padding: 8px 32px 8px 32px;
					font-size: 13px;
					font-family: inherit;
					background: var(--color-background-secondary);
					border: 0.5px solid var(--color-border-tertiary);
					border-radius: 8px;
					color: var(--color-text-primary);
					outline: none;
					transition: border-color 0.15s;
				}
				.em-search:focus { border-color: var(--color-border-primary); }
				.em-search-clear {
					position: absolute;
					right: 8px; top: 50%;
					transform: translateY(-50%);
					background: none;
					border: none;
					font-size: 11px;
					color: var(--color-text-tertiary);
					cursor: pointer;
					padding: 2px 4px;
				}

				/* Type filter pills */
				.em-type-filters { display: flex; gap: 6px; flex-wrap: wrap; }
				.em-filter-pill {
					font-size: 12px;
					font-family: inherit;
					padding: 6px 12px;
					border: 0.5px solid var(--color-border-tertiary);
					border-radius: 999px;
					background: transparent;
					color: var(--color-text-secondary);
					cursor: pointer;
					transition: all 0.15s;
					white-space: nowrap;
				}
				.em-filter-pill:hover { background: var(--color-background-secondary); color: var(--color-text-primary); }
				.em-filter-pill.active {
					background: var(--color-text-primary);
					color: var(--color-background-primary);
					border-color: var(--color-text-primary);
				}

				/* Tabs */
				.em-tabs {
					display: flex;
					border-bottom: 0.5px solid var(--color-border-tertiary);
					margin-bottom: 0.75rem;
				}
				.em-tab {
					display: flex;
					align-items: center;
					gap: 6px;
					font-size: 13px;
					font-family: inherit;
					font-weight: 500;
					padding: 8px 16px;
					border: none;
					border-bottom: 2px solid transparent;
					background: transparent;
					color: var(--color-text-secondary);
					cursor: pointer;
					margin-bottom: -0.5px;
					transition: all 0.15s;
				}
				.em-tab:hover { color: var(--color-text-primary); }
				.em-tab.active { color: var(--color-text-primary); border-bottom-color: var(--color-text-primary); }

				.em-tab-count {
					font-size: 10px;
					font-family: 'DM Mono', monospace;
					font-weight: 500;
					padding: 2px 6px;
					border-radius: 999px;
					background: var(--color-background-secondary);
					color: var(--color-text-secondary);
				}
				.em-tab-count-expired  { background: #FCEBEB; color: #A32D2D; }
				.em-tab-count-soon     { background: #FAEEDA; color: #854F0B; }
				.em-tab-count-active   { background: #EAF3DE; color: #3B6D11; }

				/* Sort bar */
				.em-sort-bar {
					display: flex;
					align-items: center;
					gap: 6px;
					margin-bottom: 10px;
					padding: 6px 0;
				}
				.em-sort-label { font-size: 12px; color: var(--color-text-tertiary); }
				.em-sort-btn {
					font-size: 12px;
					font-family: 'DM Mono', monospace;
					padding: 4px 10px;
					border: 0.5px solid var(--color-border-tertiary);
					border-radius: 6px;
					background: transparent;
					color: var(--color-text-secondary);
					cursor: pointer;
					transition: all 0.15s;
				}
				.em-sort-btn:hover { color: var(--color-text-primary); }
				.em-sort-btn.active {
					background: var(--color-background-secondary);
					color: var(--color-text-primary);
					border-color: var(--color-border-secondary);
				}

				/* Doc list */
				.em-doc-list { display: flex; flex-direction: column; gap: 8px; }

				.em-doc-card {
					display: grid;
					grid-template-columns: 44px 1fr auto auto;
					align-items: center;
					gap: 14px;
					background: var(--color-background-primary);
					border: 0.5px solid var(--color-border-tertiary);
					border-radius: 12px;
					padding: 14px 16px;
					transition: border-color 0.15s;
				}
				.em-doc-card:hover { border-color: var(--color-border-secondary); }

				.em-doc-icon {
					width: 44px;
					height: 44px;
					border-radius: 10px;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 18px;
					flex-shrink: 0;
				}
				.em-icon-employee  { background: #E6F1FB; }
				.em-icon-vehicle   { background: #EAF3DE; }
				.em-icon-vendor    { background: #FAEEDA; }
				.em-icon-insurance { background: #FBEAF0; }
				.em-icon-license   { background: #EEEDFE; }

				.em-doc-name {
					font-size: 14px;
					font-weight: 500;
					display: flex;
					align-items: center;
					gap: 6px;
					flex-wrap: wrap;
				}
				.em-doc-owner {
					font-size: 12px;
					color: var(--color-text-secondary);
					margin-top: 2px;
				}

				.em-type-chip {
					font-size: 10px;
					font-family: 'DM Mono', monospace;
					padding: 2px 7px;
					border-radius: 4px;
					background: var(--color-background-secondary);
					color: var(--color-text-tertiary);
					text-transform: uppercase;
					letter-spacing: 0.05em;
					font-weight: 500;
				}

				.em-doc-expiry { text-align: right; flex-shrink: 0; }
				.em-expiry-date {
					font-size: 12px;
					font-family: 'DM Mono', monospace;
					color: var(--color-text-secondary);
				}
				.em-countdown { font-size: 11px; font-weight: 500; margin-top: 2px; }
				.countdown-expired { color: #A32D2D; }
				.countdown-soon    { color: #854F0B; }
				.countdown-ok      { color: #3B6D11; }

				/* Badge */
				.em-badge {
					font-size: 11px;
					font-family: 'DM Mono', monospace;
					font-weight: 500;
					padding: 4px 10px;
					border-radius: 999px;
					white-space: nowrap;
					flex-shrink: 0;
				}
				.badge-expired { background: #FCEBEB; color: #A32D2D; }
				.badge-soon    { background: #FAEEDA; color: #854F0B; }
				.badge-active  { background: #EAF3DE; color: #3B6D11; }

				/* Empty state */
				.em-empty {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 8px;
					padding: 2.5rem;
					text-align: center;
					font-size: 13px;
					color: var(--color-text-secondary);
					border: 0.5px dashed var(--color-border-tertiary);
					border-radius: 12px;
				}
				.em-empty-icon { font-size: 24px; }

				/* Responsive */
				@media (max-width: 640px) {
					.em-stats-grid { grid-template-columns: repeat(2, 1fr); }
					.em-doc-card   { grid-template-columns: 40px 1fr; grid-template-rows: auto auto; }
					.em-doc-expiry { text-align: left; }
					.em-badge      { grid-column: 2; justify-self: start; }
				}
			`}</style>
		</div>
	);
}

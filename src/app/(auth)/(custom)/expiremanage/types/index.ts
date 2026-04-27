export type DocType = 'employee' | 'vehicle' | 'vendor' | 'insurance' | 'license';

export type DocStatus = 'expired' | 'soon' | 'active';

export type SortKey = 'expiry' | 'name' | 'owner';
export type SortDir = 'asc' | 'desc';

export interface DocumentItem {
  id: string;
  name: string;
  type: DocType;
  owner: string;
  expiryDate: string;
  notes?: string;
}
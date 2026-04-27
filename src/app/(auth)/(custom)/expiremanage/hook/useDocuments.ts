import { documentService } from '@/services/document.service';
import { useEffect, useState } from 'react';

export function useDocuments() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {

    const fetchDocs = async () => {
      try {
        setLoading(true);
        const data = await documentService.getAll();
        setDocs(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  return { docs, loading, error };
}
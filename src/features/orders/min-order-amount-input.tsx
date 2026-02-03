'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { useRole } from '@/context/RoleContext';

export function MinOrderAmountInput() {
  const [minOrderAmount, setMinOrderAmount] = useState<number>(0);
  const [tempAmount, setTempAmount] = useState<string>(''); // need string state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch min_order on load
  useEffect(() => {
    fetchStoreMinOrder();
  }, []);

  const fetchStoreMinOrder = async () => {
    try {
      const supabase = createClient();

      // Get tenant name from cookie using js-cookie
      const encodedStoreName = Cookies.get('currentStore');
      if (!encodedStoreName) throw new Error('Store cookie not found');

      const storeName = decodeURIComponent(encodedStoreName);

      // Query tenants table
      const { data, error } = await supabase
        .from('tenants')
        .select('min_order')
        .eq('name', storeName)
        .single(); // only one row expected

      if (error) throw error;

      setMinOrderAmount(Number(data.min_order) || 0);
      setTempAmount(String(data.min_order || 0));
    } catch (error) {
      toast.error('Failed to fetch store minimum order');
    }
  };

  const handleCancel = () => {
    setTempAmount(minOrderAmount.toString());
    setEditing(false);
  };

  const handleSave = async () => {
    if (tempAmount.trim() === '') {
      toast.error('Amount cannot be empty');
      return;
    }

    const amountNumber = Number(tempAmount);
    if (isNaN(amountNumber) || amountNumber < 0) {
      toast.error('Amount must be 0 or greater');
      return;
    }

    try {
      setSaving(true);
      const supabase = createClient();

      const { error } = await supabase.rpc('update_tenant_min_order', {
        p_min_order: amountNumber
      });

      if (error) throw error;

      setMinOrderAmount(amountNumber);
      setEditing(false);
      toast.success('Minimum order amount updated');
    } catch (error) {
      toast.error('Failed to update minimum order');
    } finally {
      setSaving(false);
    }
  };

  const currentRole = useRole();

  return (
    <div className='mb-6 flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center'>
      <div className='flex-1'>
        <label className='text-sm font-medium'>
          Minimum Store Order Amount
        </label>
        <p className='mb-1 text-xs text-muted-foreground'>
          The amount added here will be shown to users on mobile app
        </p>

        <div className='flex items-center gap-1'>
          <span className='font-medium'>Rs</span>
          <input
            type='number'
            className='w-28 rounded border px-2 py-1 hover:border-gray-400 focus:border-gray-400 focus:outline-none disabled:cursor-not-allowed'
            value={tempAmount}
            onChange={(e) => {
              setTempAmount(e.target.value);
              setEditing(true);
            }}
            disabled={saving || currentRole !== 'super_admin'}
          />
        </div>
      </div>

      {editing && (
        <div className='mt-2 flex gap-2 sm:mt-0'>
          <button
            className='rounded bg-green-500 p-2 text-white'
            onClick={handleSave}
            disabled={saving}
          >
            <Check className='h-4 w-4' />
          </button>
          <button
            className='rounded bg-red-500 p-2 text-white'
            onClick={handleCancel}
            disabled={saving}
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      )}
    </div>
  );
}

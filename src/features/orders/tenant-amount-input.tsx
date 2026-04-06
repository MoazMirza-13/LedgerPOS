'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { useRole } from '@/context/RoleContext';

type AmountField = 'min_order' | 'delivery';

interface TenantAmountInputProps {
  field: AmountField;
  label: string;
  description: string;
  initialValue: number;
}

const RPC_MAP: Record<AmountField, string> = {
  min_order: 'update_tenant_min_order',
  delivery: 'update_tenant_delivery'
};

const RPC_PARAM_MAP: Record<AmountField, string> = {
  min_order: 'p_min_order',
  delivery: 'p_delivery'
};

export function TenantAmountInput({
  field,
  label,
  description,
  initialValue
}: TenantAmountInputProps) {
  const [savedAmount, setSavedAmount] = useState<number>(initialValue);
  const [tempAmount, setTempAmount] = useState<string>(String(initialValue));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const currentRole = useRole();

  // Sync when parent finishes fetching (initialValue starts as 0, then updates)
  useEffect(() => {
    setSavedAmount(initialValue);
    setTempAmount(String(initialValue));
  }, [initialValue]);

  const handleCancel = () => {
    setTempAmount(savedAmount.toString());
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

      const { error } = await supabase.rpc(RPC_MAP[field], {
        [RPC_PARAM_MAP[field]]: amountNumber
      });

      if (error) throw error;

      setSavedAmount(amountNumber);
      setEditing(false);
      toast.success(`${label} updated`);
    } catch {
      toast.error(`Failed to update ${label.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='mb-6 flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center'>
      <div className='flex-1'>
        <label className='text-sm font-medium'>{label}</label>
        <p className='mb-1 text-xs text-muted-foreground'>{description}</p>

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

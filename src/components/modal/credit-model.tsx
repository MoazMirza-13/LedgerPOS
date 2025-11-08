'use client';

import type React from 'react';

import { useState, useTransition } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { cn, toastMsg } from '@/utils/utils';
import { Reference, References_ledger } from 'types';
import { addCredit } from '@/lib/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CreditModalProps {
  referenceData: Reference;
}

export const CreditModal: React.FC<CreditModalProps> = ({ referenceData }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    cr: null as number | null,
    description: '',
    name: referenceData.name,
    reference_id: referenceData.id
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'cr' ? (value ? Number(value) : null) : value
    }));
  };

  const router = useRouter();
  const [isPending, startFormTransition] = useTransition();

  const handleSubmit = async () => {
    if (formData.cr !== null) {
      startFormTransition(async () => {
        const res = await addCredit({
          ...formData,
          cr: formData.cr
        } as References_ledger);

        if (res?.success) {
          toast.success(toastMsg.addCredit);
          setOpen(false);
          router.refresh();
        } else {
          toast.error(toastMsg.error);
        }
      });
    }
  };

  const isFormValid =
    formData.cr !== null && formData.description.trim() !== '';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn(buttonVariants(), 'gap-2 text-xs md:text-sm')}>
          <Plus className='h-4 w-4' />
          Credit
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add Credit</DialogTitle>
          <DialogDescription>
            Enter the credit amount and description for this transaction.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <label htmlFor='cr' className='text-sm font-medium text-foreground'>
              Credit
            </label>
            <Input
              id='cr'
              name='cr'
              type='number'
              placeholder='Enter credit amount'
              value={formData.cr !== null ? formData.cr : ''}
              onChange={handleInputChange}
              className='w-full'
            />
          </div>
          <div className='grid gap-2'>
            <label
              htmlFor='description'
              className='text-sm font-medium text-foreground'
            >
              Description
            </label>
            <Input
              id='description'
              name='description'
              type='text'
              placeholder='Enter description'
              value={formData.description}
              onChange={handleInputChange}
              className='w-full'
            />
          </div>
        </div>
        <div className='flex justify-end gap-3'>
          <Button
            className='cursor-pointer'
            variant='outline'
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className='cursor-pointer'
            onClick={handleSubmit}
            disabled={!isFormValid || isPending}
          >
            {isPending ? 'Adding' : 'Add Credit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

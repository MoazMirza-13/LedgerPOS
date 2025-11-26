'use client';

import type React from 'react';
import { useState, useTransition } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoaderCircle, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { cn, toastMsg } from '@/utils/utils';
import {
  Reference,
  References_ledger,
  Supplier,
  Suppliers_ledger
} from 'types';
import { addCredit, addDebit } from '@/lib/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CreditDebitModalProps {
  referenceData?: Reference;
  supplierData?: Supplier;
}

export const CreditDebitModal: React.FC<CreditDebitModalProps> = ({
  referenceData,
  supplierData
}) => {
  const isCredit = !!referenceData;
  const entity = isCredit ? referenceData : supplierData;

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: null as number | null,
    description: '',
    name: entity?.name || '',
    id: entity?.id || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? (value ? Number(value) : null) : value
    }));
  };

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () => {
    if (formData.amount !== null) {
      startTransition(async () => {
        const payload = isCredit
          ? ({
              cr: formData.amount,
              description: formData.description,
              name: formData.name,
              reference_id: formData.id
            } as References_ledger)
          : ({
              dr: formData.amount,
              description: formData.description,
              name: formData.name,
              supplier_id: formData.id
            } as Suppliers_ledger);

        const res = await (isCredit
          ? addCredit(payload as References_ledger)
          : addDebit(payload as Suppliers_ledger));

        if (res?.success) {
          toast.success(isCredit ? toastMsg.addCredit : toastMsg.addDebit);
          setOpen(false);
          setFormData({
            // do it before refresh
            amount: null,
            description: '',
            name: entity?.name || '',
            id: entity?.id || ''
          });
          router.refresh();
        } else {
          toast.error(toastMsg.error);
        }
      });
    }
  };

  const isFormValid = formData.amount !== null && formData.amount !== 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn(buttonVariants(), 'gap-2 text-xs md:text-sm')}>
          <Plus className='h-4 w-4' />
          {isCredit ? 'Credit' : 'Debit'}
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{`Add ${isCredit ? 'Credit' : 'Debit'}`}</DialogTitle>
          <DialogDescription>
            {`Enter the ${isCredit ? 'credit' : 'debit'} amount and description for this transaction.`}
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <label
              htmlFor='amount'
              className='text-sm font-medium text-foreground'
            >
              {isCredit ? 'Credit' : 'Debit'}
            </label>
            <Input
              id='amount'
              name='amount'
              type='number'
              placeholder={`Enter ${isCredit ? 'credit' : 'debit'} amount`}
              value={formData.amount ?? ''}
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
            disabled={isPending}
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
            {isPending ? (
              <div className='flex gap-2'>
                Adding
                <LoaderCircle className='h-5 w-5 animate-spin' />
              </div>
            ) : (
              `Add ${isCredit ? 'Credit' : 'Debit'}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { deleteContent } from '@/lib/actions';
import { toastMsg } from '@/utils/utils';
import { useQueryClient } from '@tanstack/react-query';
import { Edit, MoreHorizontal, Trash } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { itemData } from 'types';

interface CellActionProps {
  itemData: itemData;
  itemTable: string;
}

export const CellAction: React.FC<CellActionProps> = ({
  itemData,
  itemTable
}) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();

  const referenceRoute = pathname.includes('/references');
  const supplierRoute = pathname.includes('/suppliers');
  const invoicesRoute = pathname.includes('invoices');

  const forNavigatingURL = itemTable.replace(/_/g, '-');

  const onConfirm = async () => {
    const error = await deleteContent(itemTable, itemData);
    if (error) {
      toast.error(toastMsg.error);
    } else {
      toast.success(toastMsg.deleteItem);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['nestedData'] });
      router.push(`/dashboard/${forNavigatingURL}`);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          {!referenceRoute && !supplierRoute && (
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/${forNavigatingURL}/${itemData.id}`)
              }
            >
              <Edit className='mr-2 h-4 w-4' /> Edit
            </DropdownMenuItem>
          )}
          {!invoicesRoute && (
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <Trash className='mr-2 h-4 w-4' /> Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

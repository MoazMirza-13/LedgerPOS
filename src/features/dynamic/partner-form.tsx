// dynamic for references and suppliers
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { referenceSupplierSubmit } from '@/lib/actions';
import { toastMsg } from '@/utils/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { itemTable } from 'types';
import * as z from 'zod';

export default function PartnerForm({
  pageTitle,
  type
}: {
  pageTitle: string;
  type: itemTable;
}) {
  const formSchema = z.object({
    name: z.string().min(1, {
      message: `name is required`
    }),
    balance: z.coerce.number()
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      balance: 0
    }
  });

  const router = useRouter();
  const { isDirty } = form.formState;
  const [isPending, startFormTransition] = useTransition();

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    startFormTransition(async () => {
      const res = await referenceSupplierSubmit(values, type);
      const entity = type === 'references' ? 'Reference' : 'Supplier';

      if (res?.successNew) toast.success(toastMsg.dynamicNew(entity));
      else if (res?.error) toast.error(toastMsg.error);

      if (!res?.error) {
        router.push(`/dashboard/${type}`);
      }
    });
  };

  return (
    <>
      <Card className='mx-auto w-full'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='text-left text-2xl font-bold'>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className='space-y-8'
            >
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder={'Enter name'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='balance'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Balance</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0'
                          placeholder='Enter balance'
                          {...field}
                          value={field.value === 0 ? '' : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type='submit' disabled={isPending || !isDirty}>
                {isPending ? (
                  <div className='flex gap-2'>
                    Adding
                    <LoaderCircle className='h-5 w-5 animate-spin' />
                  </div>
                ) : (
                  `Add ${type === 'references' ? 'Reference' : 'Supplier'} `
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}

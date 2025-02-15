'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { createClient } from '@/utils/supabase/client';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const handleSignIn = async (credentials: UserFormValue) => {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      toast.error(error.message);
      router.push('/');
      return;
    }

    toast.success('Signed In Successfully!');
    router.push('/dashboard/overview');
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          startTransition(() => handleSignIn(values));
        })}
        className='w-full space-y-4'
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type='email'
                  placeholder='Enter your email'
                  // ? loading
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type='password'
                  placeholder='Enter your password'
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isPending} className='w-full' type='submit'>
          {isPending ? 'Signing in...' : 'Continue With Email'}
        </Button>
      </form>
    </Form>
  );
}

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
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import * as z from 'zod';
import { createClient } from '@/utils/supabase/client'; // Changed to client-side supabase

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const router = useRouter();
  // ? const searchParams = useSearchParams();
  // ? const callbackUrl = searchParams.get('callbackUrl');
  const [isPending, startTransition] = useTransition(); //?loading

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'demo@gmail.com',
      password: ''
    }
  });

  const handleSignIn = async (credentials: UserFormValue) => {
    const supabase = createClient();

    const res = await supabase.auth.signInWithPassword(credentials);
    console.log('🚀 ~ handleSignIn ~ res:', res);

    // if (error) {
    //   toast.error(error.message);
    //   return;
    // }

    // router.push(callbackUrl || '/protected');
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
                  placeholder='Enter your email...'
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
                  placeholder='Enter your password...'
                  disabled={isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* //?disabled={loading} */}
        <Button disabled={isPending} className='w-full' type='submit'>
          {isPending ? 'Signing in...' : 'Continue With Email'}
        </Button>
      </form>
    </Form>
  );
}

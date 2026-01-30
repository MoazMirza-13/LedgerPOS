import { Metadata } from 'next';
import UserAuthForm from './user-auth-form';
import { Store } from 'lucide-react';

export const metadata: Metadata = {
  title: 'NS | Sign in',
  description: 'Admin panel for NS.'
};

export default function SignInViewPage() {
  return (
    <div
      className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'
      data-new-gr-c-s-check-loaded='14.1209.0'
      data-gr-ext-installed=''
    >
      <div className='relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex'>
        <div className='absolute inset-0 bg-zinc-900' />
        <div className='relative z-20 flex items-center gap-2 text-lg font-medium'>
          <Store /> NS
        </div>
        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>Your own city, your own store.</p>
            <footer className='text-sm'>Sign in to use</footer>
          </blockquote>
        </div>
      </div>
      <div className='flex h-full items-center p-4 lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
          <div className='flex flex-col space-y-2 text-center'>
            <h1 className='text-2xl font-semibold tracking-tight'>
              Admin Panel
            </h1>
            <p className='text-sm text-muted-foreground'>
              Enter your email and password below to sign in
            </p>
          </div>
          <UserAuthForm />
        </div>
      </div>
    </div>
  );
}

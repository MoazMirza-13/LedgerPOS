import { redirect } from 'next/navigation';

export default async function Dashboard() {
  // ? route protecting (auth check)
  redirect('/dashboard/overview');
}

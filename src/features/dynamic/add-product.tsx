import { Plus } from 'lucide-react';

export default function AddProductButton() {
  return (
    <button className='group flex transform items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-all duration-200 hover:shadow-lg active:scale-95 active:shadow-sm'>
      <Plus className='h-5 w-0 transition-all duration-200 group-hover:w-5' />
      <span className='transition-all duration-200 group-hover:ml-1'>
        Add a Product
      </span>
    </button>
  );
}

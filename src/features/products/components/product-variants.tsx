'use client';

import { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ProductSizesProps {
  name: string;
}

export function ProductVariants({ name }: ProductSizesProps) {
  const { control } = useFormContext();
  const [newSize, setNewSize] = useState('');

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const addSize = () => {
          if (!newSize) return;
          const trimmedSize = newSize.trim();
          // Check if size contains 'ml' (case-insensitive)
          const hasML = /ml/i.test(trimmedSize);
          // Convert to lowercase if ML is present, otherwise uppercase
          const size = hasML
            ? trimmedSize.toLowerCase()
            : trimmedSize.toUpperCase();
          if (!field.value.includes(size)) {
            field.onChange([...field.value, size]);
            setNewSize('');
          }
        };

        const removeSize = (sizeToRemove: string) => {
          field.onChange(
            field.value.filter((size: string) => size !== sizeToRemove)
          );
        };

        const handleKeyPress = (e: React.KeyboardEvent) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addSize();
          }
        };

        return (
          <div className='grid gap-4'>
            <div className='flex gap-2'>
              <Input
                placeholder='Add variants'
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyPress={handleKeyPress}
                className='w-full'
              />
              <Button onClick={addSize} type='button'>
                Add
              </Button>
            </div>
            <div className='flex flex-wrap gap-2'>
              {field.value.map((size: string) => (
                <Badge key={size} variant='secondary' className='text-sm'>
                  {size}
                  <button
                    onClick={() => removeSize(size)}
                    className='ml-2 hover:text-destructive'
                    type='button'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        );
      }}
    />
  );
}

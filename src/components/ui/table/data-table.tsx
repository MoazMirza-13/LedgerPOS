'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useRole } from '@/context/RoleContext';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import { usePathname } from 'next/navigation';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { useRef, useEffect, useState } from 'react';
import { cn } from '@/utils/utils';
import { createClient } from '@/utils/supabase/client';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onLoadMore?: () => void;
  loading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onLoadMore,
  loading
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  const pathname = usePathname();
  const productsRoute = pathname.includes('/products');
  const currentRole = useRole();
  const supabase = createClient();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = scrollRef.current;
    if (!viewport || !onLoadMore) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      if (scrollHeight === 0) return;
      if ((scrollTop + clientHeight) / scrollHeight >= 0.8) {
        onLoadMore();
      }
    };

    viewport.addEventListener('scroll', handleScroll);
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [onLoadMore]);

  const [warehouseTotals, setWarehouseTotals] = useState<any[]>([]);
  const [loadingTotals, setLoadingTotals] = useState(true);

  useEffect(() => {
    const fetchTotals = async () => {
      const { data, error } = await supabase.rpc(
        'get_total_cost_per_warehouse'
      );

      if (!error) {
        setWarehouseTotals(data || []);
      }

      setLoadingTotals(false);
    };

    if (productsRoute) {
      fetchTotals();
    }
  }, [productsRoute]);

  return (
    <>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='relative flex flex-1'>
          <div className='absolute bottom-0 left-0 right-0 top-0 flex overflow-scroll rounded-md border md:overflow-auto'>
            <ScrollAreaPrimitive.Root
              className={cn('relative flex-1 overflow-hidden')}
            >
              <ScrollAreaPrimitive.Viewport
                ref={scrollRef}
                className='h-full w-full rounded-[inherit]'
              >
                <Table className='relative'>
                  <TableHeader className={`sticky top-0 z-10 bg-background`}>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header, index, headers) => (
                          <TableHead
                            key={header.id}
                            className={
                              index === headers.length - 1 &&
                              !productsRoute &&
                              currentRole === 'super_admin'
                                ? 'pr-8 text-right'
                                : ''
                            }
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                        >
                          {row.getVisibleCells().map((cell, index, cells) => (
                            <TableCell
                              key={cell.id}
                              className={
                                index === cells.length - 1 &&
                                !productsRoute &&
                                currentRole === 'super_admin'
                                  ? 'pr-8 text-right'
                                  : ''
                              }
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className='h-24 text-center'
                        >
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                    {loading && (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className='h-24 text-center'
                        >
                          <div className='flex items-center justify-center'>
                            <div className='h-6 w-6 animate-spin rounded-full border-4 border-gray-400 border-t-transparent'></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollAreaPrimitive.Viewport>
              <ScrollAreaPrimitive.Scrollbar
                orientation='vertical'
                className='flex h-full w-2.5 touch-none select-none border-l border-l-transparent bg-border/50 p-0.5 transition-colors'
              >
                <ScrollAreaPrimitive.Thumb className='relative flex-1 rounded-full bg-border' />
              </ScrollAreaPrimitive.Scrollbar>
              <ScrollAreaPrimitive.Scrollbar
                orientation='horizontal'
                className='flex h-2.5 touch-none select-none flex-col border-t border-t-transparent bg-border/50 p-0.5 transition-colors'
              >
                <ScrollAreaPrimitive.Thumb className='relative flex-1 rounded-full bg-border' />
              </ScrollAreaPrimitive.Scrollbar>
              <ScrollAreaPrimitive.Corner />
            </ScrollAreaPrimitive.Root>
          </div>
        </div>
      </div>

      {productsRoute && currentRole === 'super_admin' && (
        <div className='hidden flex-wrap gap-4 lg:flex'>
          {loadingTotals ? (
            // loading text if needed
            <div></div>
          ) : (
            warehouseTotals.map((w, i) => (
              <div
                key={w.warehouse}
                className={`text-right text-lg font-bold ${
                  i < warehouseTotals.length - 1
                    ? 'border-r border-gray-300 pr-4'
                    : ''
                }`}
              >
                {w.warehouse}: {w.total}
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}

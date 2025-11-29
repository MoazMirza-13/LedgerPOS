'use client';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Product } from 'types';
import { formatToPKTDate, getTotalQuantity } from '@/utils/utils';

export async function printWarehouseProducts(
  products: Product[],
  warehouse: string
) {
  if (!products.length || !warehouse) {
    console.warn('No products or warehouse selected');
    return;
  }

  const chunkSize = 20;

  // Split products into chunks of 20
  const productChunks: Product[][] = [];
  for (let i = 0; i < products.length; i += chunkSize) {
    productChunks.push(products.slice(i, i + chunkSize));
  }

  const pdf = new jsPDF('p', 'pt', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let pageIndex = 0; pageIndex < productChunks.length; pageIndex++) {
    const container = document.createElement('div');
    container.className = 'w-full max-w-5xl mx-auto bg-white text-[12px]';

    container.innerHTML = `
      <div class="min-h-[1123px] flex flex-col justify-between bg-white text-[12px]">
        <!-- HEADER -->
        <div class="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-t-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="bg-teal-500 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-8m0 0l9-4 9 4M3 13l9-4 9 4v8M9 21V9m6 12V9" />
                </svg>
              </div>
              <div>
                <h1 class="text-3xl font-bold tracking-tight">LedgerPOS</h1>
                <p class="text-teal-300 text-sm font-medium mt-1">Products List (${warehouse})</p>
              </div>
            </div>
          </div>
        </div>

        <!-- PRODUCTS TABLE -->
        <div class="p-8">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-teal-50 border-b-2 border-teal-500">
                <th class="px-4 py-3 text-left text-xs font-bold text-slate-900">Product</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-slate-900">Brand</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-slate-900">Category</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-slate-900">In ${warehouse}</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-slate-900">Total Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${productChunks[pageIndex]
                .map((p) => {
                  const brand = p.brands?.title ?? '';
                  const category = p.categories?.title ?? '';
                  const totalQty = getTotalQuantity(p);
                  const qtyInWarehouse =
                    warehouse === 'Zafarwal'
                      ? p.quantity_in_zafarwal
                      : warehouse === 'Ghaziwal'
                        ? p.quantity_in_ghaziwal
                        : warehouse === 'Lhr Road'
                          ? p.quantity_in_lhr_road
                          : warehouse === 'Eidgah Road'
                            ? p.quantity_in_eidgah_road
                            : warehouse === 'Mandi Tile'
                              ? p.quantity_in_mandi_tile
                              : warehouse === 'Mandi Bond'
                                ? p.quantity_in_mandi_bond
                                : 0;

                  return `
                    <tr class="border-b border-slate-200 hover:bg-slate-50">
                      <td class="px-4 py-2 text-sm text-slate-900 font-medium">${p.product_code}</td>
                      <td class="px-4 py-2 text-sm text-slate-700">${brand}</td>
                      <td class="px-4 py-2 text-sm text-slate-700">${category}</td>
                      <td class="px-4 py-2 text-sm text-center text-slate-700">${qtyInWarehouse}</td>
                      <td class="px-4 py-2 text-sm text-center text-slate-700">${totalQty}</td>
                    </tr>`;
                })
                .join('')}
            </tbody>
          </table>
        </div>

        <!-- FOOTER -->
        <div class="bg-slate-900 text-white px-8 py-6 rounded-b-lg text-center mt-auto">
          <p class="text-sm font-medium m-0">LedgerPOS | Warehouse Report - ${warehouse}</p>
          <p class="text-xs text-slate-400 m-0 mt-2">Generated on ${formatToPKTDate(new Date())}</p>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    const canvas = await html2canvas(container, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);

    document.body.removeChild(container);
  }

  window.open(pdf.output('bloburl'), '_blank');
}

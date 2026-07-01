'use client';
import { Invoice } from 'types';
import { formatToPKTDate } from '@/utils/utils';
import { toast } from 'sonner';

export async function printInvoice(finalData: Invoice, date?: string) {
  let invoiceDate = date ? formatToPKTDate(date) : formatToPKTDate(new Date());

  const printContent = `
  <div class="min-h-[1123px] flex flex-col justify-between bg-white text-[12px]">

    <!-- HEADER -->
    <div>
      <div class="bg-gray-800 text-white p-6 rounded-t-lg">
            <p class="text-gray-400 text-xs font-semibold tracking-widest">INVOICE# ${finalData.invoice_number}</p>
        <div class="flex items-start justify-between">
          <div class="flex flex-col">
          <div class="flex items-center gap-4 ">
            <div class="bg-gray-600 p-3 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-8m0 0l9-4 9 4M3 13l9-4 9 4v8M9 21V9m6 12V9" />
              </svg>
            </div>
            <div>
              <h1 class="text-4xl font-bold tracking-tight">Kashmir Tiles</h1>
              <p class="text-gray-400 text-sm font-medium mt-1">Tiles & Marble</p>
            </div>
            </div>
          </div>
          <div class="text-right">
            <p class="text-gray-500 text-sm mt-2">${invoiceDate}</p>
          </div>
        </div>
      </div>

      <!-- BILL TO -->
      <div class="p-8 bg-gray-50 border-b border-gray-200">
        <div>
          <h3 class="text-xs font-bold text-gray-600 tracking-widest mb-2">BILL TO</h3>
          <p class="text-sm text-gray-700 m-0"><strong>Customer Name:</strong> ${finalData.customer_name}</p>
          <p class="text-sm text-gray-700 m-0"><strong>Address:</strong> ${finalData.customer_address}</p>
          <p class="text-sm text-gray-700 m-0"><strong>Phone:</strong> ${finalData.customer_number}</p>
        </div>
      </div>

      <!-- TABLE -->
      <div class="p-8">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-100 border-b-2 border-gray-400">
              <th class="px-4 py-4 text-left text-xs font-bold text-gray-900 tracking-wider">Product</th>
              <th class="px-4 py-4 text-center text-xs font-bold text-gray-900 tracking-wider">Box</th>
              <th class="px-4 py-4 text-center text-xs font-bold text-gray-900 tracking-wider">Piece</th>
              <th class="px-4 py-4 text-center text-xs font-bold text-gray-900 tracking-wider">Total Quantity</th>
              <th class="px-4 py-4 text-left text-xs font-bold text-gray-900 tracking-wider">Warehouse</th>
              <th class="px-4 py-4 text-right text-xs font-bold text-gray-900 tracking-wider">Price</th>
              <th class="px-4 py-4 text-right text-xs font-bold text-gray-900 tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody>
            ${finalData.invoice_items
              .map((item: any) => {
                const totalPieces = item.quantity || 0;
                const itemsPerBox = item.product?.boxes || 1;
                let totalQuantityDisplay = '';

                if (item.product_code) {
                  if (item.product?.optional) {
                    // Optional → only pieces
                    totalQuantityDisplay = `${totalPieces} Piece${totalPieces > 1 ? 's' : ''}`;
                  } else {
                    // Normal → box + piece
                    const boxes = Math.floor(totalPieces / itemsPerBox);
                    const pieces = totalPieces % itemsPerBox;
                    totalQuantityDisplay = `${boxes ? boxes + ' Box' + (boxes > 1 ? 'es' : '') : ''}${
                      boxes && pieces ? ' and ' : ''
                    }${pieces ? pieces + ' Piece' + (pieces > 1 ? 's' : '') : ''}`;
                  }
                }

                return `
                  <tr class="border-b border-gray-200">
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">
                      ${item.product_code ? item.product_code : item.optional_item}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-700 text-center">
                      ${item.product?.optional ? '' : item.boxes || ''}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-700 text-center">${totalPieces}</td>
                    <td class="px-4 py-3 text-sm text-gray-700 text-center">${totalQuantityDisplay}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">${item.product_code ? item.warehouse : ''}</td>
                    <td class="px-4 py-3 text-sm text-gray-700 text-right">Rs. ${item.price}</td>
                    <td class="px-4 py-3 text-sm font-semibold text-gray-900 text-right">Rs. ${totalPieces * item.price}</td>
                  </tr>`;
              })
              .join('')}
          </tbody>
        </table>
      </div>

      <!-- TOTAL -->
      <div class="px-8 pb-8 flex justify-end">
        <div class="bg-gray-100 border-2 border-gray-500 rounded-lg p-6">
          <div class="flex flex-col justify-center items-center">
            <span class="text-lg font-bold text-gray-900 mb-2">Total Amount</span>
            <span class="text-3xl font-bold text-gray-900">Rs. ${finalData.total_price}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="bg-gray-800 text-white px-8 py-6 rounded-b-lg text-center mt-auto">
      <p class="text-sm font-medium m-0">Thank you for your business!</p>
      <p class="text-xs text-gray-400 m-0 mt-2">Kashmir Tiles | Contact: 03127226579</p>
      <p class="text-xs text-gray-500 m-0 mt-3">Invoice generated on ${invoiceDate}</p>
    </div>

  </div>
  `;

  // Hidden iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.position = 'absolute';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    toast.error('Failed to initialize print');
    return;
  }

  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice #${finalData.invoice_number}</title>
      <style>
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; }
        }
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      </style>
      <!-- Tailwind CDN -->
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          content: [],
          theme: { extend: {} }
        }
      </script>
    </head>
    <body>
      ${printContent}
      <script>
        window.onload = () => {
          setTimeout(() => window.print(), 500);
        };
      </script>
    </body>
    </html>
  `);

  doc.close();

  // Cleanup
  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    }, 1500);
  };

  iframe.contentWindow?.addEventListener('afterprint', cleanup);
}

'use client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice } from 'types';
import { formatToPKTDate } from '@/utils/utils';

export async function printInvoice(finalData: Invoice, date?: string) {
  const invoiceDate = date
    ? formatToPKTDate(date)
    : formatToPKTDate(new Date());
  const itemsPerPage = 15; // max items per PDF page
  const pdf = new jsPDF('p', 'pt', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Split items into chunks of itemsPerPage
  for (let i = 0; i < finalData.invoice_items.length; i += itemsPerPage) {
    const chunk = finalData.invoice_items.slice(i, i + itemsPerPage);

    const container = document.createElement('div');
    container.className = 'w-full max-w-4xl mx-auto bg-white text-[12px]';
    container.innerHTML = `
      <div class="min-h-[1123px] flex flex-col justify-between bg-white text-[12px]">

        <!-- HEADER -->
        <div>
          <div class="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-t-lg">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <div class="bg-teal-500 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-store-icon lucide-store"><path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"/><path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"/><path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"/></svg>
                </div>
                <div>
                  <h1 class="text-4xl font-bold tracking-tight">NS</h1>
                  <p class="text-teal-300 text-sm font-medium mt-1">Narowal Store</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-teal-300 text-xs font-semibold tracking-widest">INVOICE# ${finalData.invoice_number}</p>
                <p class="text-slate-400 text-sm mt-2">${invoiceDate}</p>
              </div>
            </div>
          </div>

          <!-- BILL TO -->
          <div class="p-8 bg-slate-50 border-b border-slate-200">
            <div>
              <h3 class="text-xs font-bold text-slate-600 tracking-widest mb-2">BILL TO</h3>
              <p class="text-sm text-slate-700 m-0"><strong>Customer Name:</strong> ${finalData.customer_name}</p>
              <p class="text-sm text-slate-700 m-0"><strong>Address:</strong> ${finalData.customer_address}</p>
              <p class="text-sm text-slate-700 m-0"><strong>Phone:</strong> ${finalData.customer_number}</p>
            </div>
          </div>

          <!-- TABLE -->
          <div class="p-8">
            <table class="w-full">
              <thead>
                <tr class="bg-teal-50 border-b-2 border-teal-500">
                  <th class="px-4 py-4 text-left text-xs font-bold text-slate-900 tracking-wider">Product</th>
                  <th class="px-4 py-4 text-center text-xs font-bold text-slate-900 tracking-wider">Quantity</th>
                  <th class="px-4 py-4 text-right text-xs font-bold text-slate-900 tracking-wider">Price</th>
                  <th class="px-4 py-4 text-right text-xs font-bold text-slate-900 tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody>
                ${chunk
                  .map(
                    (item: any) => `
                    <tr class="border-b border-slate-200 hover:bg-slate-50">
                      <td class="px-4 py-3 text-sm font-medium text-slate-900">
                        ${item.product_code ? item.product.title : item.optional_item}
                      </td>
                      <td class="px-4 py-3 text-sm text-slate-700 text-center">${item.quantity}</td>
                      <td class="px-4 py-3 text-sm text-slate-700 text-right">Rs. ${item.price}</td>
                      <td class="px-4 py-3 text-sm font-semibold text-slate-900 text-right">
                        Rs. ${item.quantity * item.price}
                      </td>
                    </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>

          <!-- TOTAL (only on last page) -->
          ${
            i + itemsPerPage >= finalData.invoice_items.length
              ? `<div class="px-8 pb-8 flex justify-end">
                  <div class="bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-500 rounded-lg p-6">
                    <div class="flex flex-col justify-center items-center">
                      <span class="text-lg font-bold text-slate-900 mb-2">Total Amount</span>
                      <span class="text-3xl font-bold text-teal-600">Rs. ${finalData.total_price}</span>
                    </div>
                  </div>
                </div>`
              : ''
          }

        </div>

        <!-- FOOTER -->
        <div class="bg-slate-900 text-white px-8 py-6 rounded-b-lg text-center mt-auto">
          <p class="text-sm font-medium m-0">Thank you for your business!</p>
          <p class="text-xs text-slate-400 m-0 mt-2">NS | Contact: 03030550072</p>
          <p class="text-xs text-slate-500 m-0 mt-3">Invoice generated on ${invoiceDate}</p>
        </div>

      </div>
    `;

    document.body.appendChild(container);

    const canvas = await html2canvas(container, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    if (i === 0) {
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
    } else {
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
    }

    document.body.removeChild(container);
  }

  window.open(pdf.output('bloburl'), '_blank');
}

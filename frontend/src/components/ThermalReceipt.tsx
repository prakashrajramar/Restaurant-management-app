import React from 'react';
import { Invoice, RestaurantSettings } from '../types';
import { api } from '../api';

interface ThermalReceiptProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ invoice, onClose }) => {
  const [settings, setSettings] = React.useState<RestaurantSettings | null>(null);
  React.useEffect(() => { api.getSettings().then(setSettings).catch(() => undefined); }, [invoice?.id]);
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const createdDate = new Date(invoice.createdAt);
  const formattedDate = createdDate.toLocaleDateString('en-GB');
  const formattedTime = createdDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface-container-lowest rounded-xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center pb-4 border-b border-outline-variant mb-4">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">print</span>
            80mm Thermal Receipt Preview
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Receipt Container for Screen & Thermal Printing */}
        <div className="overflow-y-auto flex-1 p-2 bg-gray-50 border border-dashed border-gray-300 rounded mb-4">
          <div id="thermal-receipt" className="bg-white p-4 font-mono text-xs text-black max-w-[80mm] mx-auto border border-gray-200 shadow-sm">
            <div className="text-center mb-3">
              <h1 className="text-base font-bold uppercase">{settings?.restaurantName || 'Prakashraj R'}</h1>
              {settings?.address && <p className="text-[10px]">{settings.address}</p>}
              {settings?.phone && <p className="text-[10px]">Phone: {settings.phone}</p>}
              {settings?.gstin && <p className="text-[10px]">GSTIN: {settings.gstin}</p>}
            </div>

            <div className="border-t border-b border-dashed border-black py-1 my-2 text-[11px] flex justify-between">
              <span>Inv: {invoice.invoiceNumber}</span>
              <span>Tbl: {invoice.table?.tableNumber || 'Takeaway'}</span>
            </div>

            <div className="flex justify-between text-[10px] mb-2">
              <span>Date: {formattedDate}</span>
              <span>Time: {formattedTime}</span>
            </div>

            {invoice.customer && (
              <div className="text-[10px] mb-2 pb-1 border-b border-dashed border-gray-300">
                Customer: {invoice.customer.name} ({invoice.customer.phone})
              </div>
            )}

            <div className="border-b border-dashed border-black pb-1 mb-2">
              <div className="flex justify-between font-bold text-[11px] mb-1">
                <span className="w-1/2">Item</span>
                <span className="w-1/6 text-center">Qty</span>
                <span className="w-1/3 text-right">Amt</span>
              </div>

              {invoice.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[10px] mb-1">
                  <span className="w-1/2 truncate">{item.foodItem?.name || 'Item'}</span>
                  <span className="w-1/6 text-center">{item.quantity}</span>
                  <span className="w-1/3 text-right">₹{item.totalPrice}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-[11px] border-b border-dashed border-black pb-2 mb-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{invoice.subtotal}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>-₹{invoice.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST ({settings?.taxRate ?? 5}%):</span>
                <span>₹{invoice.tax}</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-sm mb-2">
              <span>Grand Total:</span>
              <span>₹{invoice.total}</span>
            </div>

            <div className="text-[10px] text-center space-y-1 mt-3 pt-2 border-t border-dashed border-black">
              <p className="font-bold">Payment Method: {invoice.paymentMethod}</p>
              {invoice.amountReceived > 0 && (
                <p>Received: ₹{invoice.amountReceived} | Change: ₹{invoice.changeGiven}</p>
              )}
              <p className="mt-2 font-semibold">Thank You! Visit Again!</p>
              <p className="text-[9px] text-gray-500">Powered by Prakashraj R POS</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 border border-outline-variant text-on-surface-variant font-bold rounded-lg hover:bg-surface-container transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-primary text-on-primary font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-primary-container transition-colors shadow-md"
          >
            <span className="material-symbols-outlined">print</span>
            Print Receipt (80mm)
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Customer, RestaurantTable, Invoice } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  subtotal: number;
  discount: number;
  tax: number;
  selectedCustomer: Customer | null;
  selectedTable: RestaurantTable | null;
  items: { foodItemId: string; quantity: number; name: string; price: number }[];
  onPaymentSuccess: (invoice: Invoice) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  grandTotal,
  discount,
  selectedCustomer,
  selectedTable,
  items,
  onPaymentSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [amountReceived, setAmountReceived] = useState<number>(grandTotal);

  React.useEffect(() => { setAmountReceived(grandTotal); }, [grandTotal, isOpen]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const changeReturn = Math.max(0, amountReceived - grandTotal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'CASH' && amountReceived < grandTotal) {
      setError('Amount received is less than total bill amount.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const invoiceData = {
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name,
        customerPhone: selectedCustomer?.phone,
        tableId: selectedTable?.id,
        items: items.map((i) => ({ foodItemId: i.foodItemId, quantity: i.quantity })),
        discount: discount,
        paymentMethod,
        amountReceived: Number(amountReceived),
      };

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Payment failed');
      }

      const createdInvoice: Invoice = await res.json();
      setLoading(false);
      onPaymentSuccess(createdInvoice);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error processing payment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-surface-container-lowest shadow-2xl animate-in fade-in zoom-in duration-200 border border-outline-variant">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-container-highest px-6 py-4">
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">payments</span>
            Process Payment
          </h3>
          <button onClick={onClose} className="material-symbols-outlined text-on-surface-variant hover:text-primary">
            close
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {/* Amount Due Banner */}
          <div className="mb-6 rounded-xl bg-primary-container p-6 text-center text-on-primary shadow-inner">
            <p className="text-xs uppercase tracking-widest font-bold opacity-80">Total Amount Due</p>
            <h4 className="text-4xl font-bold mt-1">₹{grandTotal}</h4>
            {selectedTable && (
              <p className="text-xs mt-2 opacity-90 font-medium">Table: {selectedTable.tableNumber}</p>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-all border-2 ${
                paymentMethod === 'CASH'
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                  : 'border-outline-variant hover:border-primary text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-3xl">payments</span>
              <span className="text-xs font-bold">Cash</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('UPI')}
              className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-all border-2 ${
                paymentMethod === 'UPI'
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                  : 'border-outline-variant hover:border-primary text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-3xl">qr_code_2</span>
              <span className="text-xs font-bold">UPI</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('CARD')}
              className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-all border-2 ${
                paymentMethod === 'CARD'
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                  : 'border-outline-variant hover:border-primary text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-3xl">credit_card</span>
              <span className="text-xs font-bold">Card</span>
            </button>
          </div>

          {/* Cash Calculation */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1.5">Amount Received (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg text-on-surface-variant">₹</span>
                  <input
                    type="number"
                    min={grandTotal}
                    step="1"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(Number(e.target.value))}
                    className="h-14 w-full rounded-xl border border-outline-variant pl-8 pr-4 text-xl font-bold focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    required
                  />
                </div>
              </div>

              <div className="rounded-xl bg-surface-container-high p-4 flex justify-between items-center border border-outline-variant">
                <span className="text-sm font-bold text-on-surface-variant">Balance Return</span>
                <span className="text-2xl font-bold text-secondary">₹{changeReturn}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-outline-variant font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary-container transition-colors shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined">check_circle</span>
                  Complete Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

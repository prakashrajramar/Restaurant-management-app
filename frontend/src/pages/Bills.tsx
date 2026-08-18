import React, { useState, useEffect } from 'react';
import { Invoice } from '../types';
import { api } from '../api';
import { ThermalReceipt } from '../components/ThermalReceipt';

export const BillsPage: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.getInvoices({ search: searchQuery, paymentMethod: paymentFilter });
      setInvoices(res);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [searchQuery, paymentFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container-highest pb-4">
        <div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl text-primary font-bold">Invoices & Sales Bills</h1>
          <p className="font-body-sm text-on-surface-variant mt-1">Audit complete sales transactions, print thermal receipts, and inspect bill breakdowns.</p>
        </div>
      </div>

      {/* Payment Filter Pills */}
      <div className="flex gap-2">
        {['ALL', 'UPI', 'CARD', 'CASH'].map((pm) => (
          <button
            key={pm}
            onClick={() => setPaymentFilter(pm)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              paymentFilter === pm
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            {pm === 'ALL' ? 'All Payment Methods' : pm}
          </button>
        ))}
      </div>

      {/* Invoices Data Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline-variant bg-surface-bright flex justify-between items-center">
          <h3 className="font-headline-lg text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">receipt_long</span>
            Transaction Invoices
          </h3>
          <span className="text-xs text-on-surface-variant font-bold">{invoices.length} Bills</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-on-surface-variant font-semibold">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2">receipt</span>
              <p className="font-bold text-base">No invoices found.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant font-label-md text-xs uppercase">
                  <th className="py-3 px-6 font-semibold">Invoice #</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Table</th>
                  <th className="py-3 px-4 font-semibold">Date & Time</th>
                  <th className="py-3 px-4 font-semibold">Method</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount</th>
                  <th className="py-3 px-6 font-semibold text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest text-sm text-on-surface">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3.5 px-6 font-pos-price font-bold text-primary">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4 font-semibold">{inv.customer?.name || 'Walk-in Customer'}</td>
                    <td className="py-3.5 px-4 font-medium">{inv.table?.tableNumber || 'Takeaway'}</td>
                    <td className="py-3.5 px-4 text-xs text-on-surface-variant">
                      {new Date(inv.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded text-xs font-bold bg-secondary-container text-on-secondary-container">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-pos-price font-bold text-on-surface">₹{inv.total}</td>
                    <td className="py-3.5 px-6 text-center">
                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setIsReceiptOpen(true);
                        }}
                        className="h-8 px-3 bg-surface-container border border-outline-variant text-on-surface-variant font-bold text-xs rounded hover:bg-surface-container-highest flex items-center justify-center gap-1 mx-auto"
                      >
                        <span className="material-symbols-outlined text-[16px]">print</span>
                        Print 80mm
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ThermalReceipt invoice={selectedInvoice} onClose={() => setIsReceiptOpen(false)} />
    </div>
  );
};

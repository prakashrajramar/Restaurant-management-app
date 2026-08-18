import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { api } from '../api';
import { CustomerModal } from '../components/CustomerModal';

export const CustomersPage: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedHistoryCustomer, setSelectedHistoryCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.getCustomers(searchQuery);
      setCustomers(res);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer record?')) {
      try {
        await api.deleteCustomer(id);
        fetchCustomers();
      } catch (err) {
        console.error('Error deleting customer:', err);
      }
    }
  };

  const handleViewHistory = async (id: string) => {
    try {
      const fullDetails = await api.getCustomerDetails(id);
      setSelectedHistoryCustomer(fullDetails);
    } catch (err) {
      console.error('Error fetching customer history:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container-highest pb-4">
        <div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl text-primary font-bold">Customer Directory</h1>
          <p className="font-body-sm text-on-surface-variant mt-1">Manage customer profiles, order history, and loyalty tracking.</p>
        </div>
        <button
          onClick={() => {
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-on-primary font-title-md py-2.5 px-4 rounded-lg flex items-center gap-2 hover:bg-primary-container transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined">person_add</span>
          Add Customer
        </button>
      </div>

      {/* Customer List Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline-variant bg-surface-bright flex justify-between items-center">
          <h3 className="font-headline-lg text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">group</span>
            Registered Customers
          </h3>
          <span className="text-xs text-on-surface-variant font-bold">{customers.length} Profiles</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-on-surface-variant font-semibold">Loading customer directory...</div>
          ) : customers.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2">person_search</span>
              <p className="font-bold text-base">No customers found.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant font-label-md text-xs uppercase">
                  <th className="py-3 px-6 font-semibold">Customer Name</th>
                  <th className="py-3 px-4 font-semibold">Phone Number</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold text-center">Total Visits</th>
                  <th className="py-3 px-4 font-semibold text-right">Total Spent</th>
                  <th className="py-3 px-6 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest text-sm text-on-surface">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3.5 px-6 font-bold flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div>{c.name}</div>
                        {c.address && <div className="text-[11px] font-normal text-on-surface-variant">{c.address}</div>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{c.phone}</td>
                    <td className="py-3.5 px-4 text-on-surface-variant">{c.email || '-'}</td>
                    <td className="py-3.5 px-4 text-center font-bold">{c.totalVisits}</td>
                    <td className="py-3.5 px-4 text-right font-pos-price font-bold text-primary">₹{c.totalSpent.toLocaleString()}</td>
                    <td className="py-3.5 px-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewHistory(c.id)}
                          className="h-8 px-2.5 bg-surface-container border border-outline-variant text-on-surface-variant font-bold text-xs rounded hover:bg-surface-container-highest flex items-center gap-1"
                          title="History"
                        >
                          <span className="material-symbols-outlined text-[16px]">history</span>
                          History
                        </button>
                        <button
                          onClick={() => {
                            setEditingCustomer(c);
                            setIsModalOpen(true);
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* History Slideout / Modal */}
      {selectedHistoryCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-outline-variant max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-surface-container-highest flex justify-between items-center bg-surface-bright">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span>
                Order & Booking History: {selectedHistoryCustomer.name}
              </h3>
              <button onClick={() => setSelectedHistoryCustomer(null)} className="material-symbols-outlined text-on-surface-variant">
                close
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Customer summary card */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant text-center">
                <div>
                  <span className="text-xs text-on-surface-variant font-bold uppercase">Phone</span>
                  <p className="font-bold text-sm text-on-surface">{selectedHistoryCustomer.phone}</p>
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant font-bold uppercase">Visits</span>
                  <p className="font-bold text-sm text-on-surface">{selectedHistoryCustomer.totalVisits}</p>
                </div>
                <div>
                  <span className="text-xs text-on-surface-variant font-bold uppercase">Total Spent</span>
                  <p className="font-bold text-sm text-primary">₹{selectedHistoryCustomer.totalSpent.toLocaleString()}</p>
                </div>
              </div>

              {/* Invoices List */}
              <div>
                <h4 className="font-bold text-sm uppercase text-on-surface-variant mb-3">Past Invoices ({selectedHistoryCustomer.invoices?.length || 0})</h4>
                {selectedHistoryCustomer.invoices?.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No invoice records found.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedHistoryCustomer.invoices?.map((inv) => (
                      <div key={inv.id} className="p-3 border border-outline-variant rounded-lg flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-primary">{inv.invoiceNumber}</div>
                          <div className="text-gray-500">{new Date(inv.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm text-on-surface">₹{inv.total}</div>
                          <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-bold text-[10px]">
                            {inv.paymentMethod}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={editingCustomer}
        onSave={fetchCustomers}
      />
    </div>
  );
};

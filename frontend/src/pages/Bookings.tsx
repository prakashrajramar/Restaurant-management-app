import React, { useState, useEffect } from 'react';
import { Booking, RestaurantTable, Customer } from '../types';
import { api } from '../api';
import { BookingModal } from '../components/BookingModal';

export const BookingsPage: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bkRes, tblRes, custRes] = await Promise.all([
        api.getBookings({ status: activeTab, search: searchQuery }),
        api.getTables(),
        api.getCustomers(),
      ]);
      setBookings(bkRes);
      setTables(tblRes);
      setCustomers(custRes);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, searchQuery]);

  const handleStatusUpdate = async (id: string, status: string, tableId?: string) => {
    try {
      await api.updateBookingStatus(id, status, tableId);
      fetchData();
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container-highest pb-4">
        <div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl text-primary font-bold">Booking Management</h1>
          <p className="font-body-sm text-on-surface-variant mt-1">Track upcoming table reservations and customer check-ins.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-on-primary font-title-md py-2.5 px-4 rounded-lg flex items-center gap-2 hover:bg-primary-container transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined">event_available</span>
          New Booking
        </button>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 pt-4 border-b border-outline-variant">
          <div className="flex gap-6 font-label-md text-sm text-on-surface-variant overflow-x-auto">
            {['All', 'Today', 'Upcoming', 'Completed', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-bold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab ? 'border-primary text-primary' : 'border-transparent hover:text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-on-surface-variant font-semibold">Loading reservations...</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
              <p className="font-bold text-base">No bookings found for this filter.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant font-label-md text-xs uppercase">
                  <th className="py-3 px-6 font-semibold">Booking ID</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Phone</th>
                  <th className="py-3 px-4 font-semibold">Date & Time</th>
                  <th className="py-3 px-4 font-semibold">Guests</th>
                  <th className="py-3 px-4 font-semibold">Table</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest text-sm text-on-surface">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3.5 px-6 font-pos-price font-bold text-primary">{b.bookingNumber}</td>
                    <td className="py-3.5 px-4 font-semibold">{b.customer?.name || 'Guest'}</td>
                    <td className="py-3.5 px-4 text-on-surface-variant">{b.customer?.phone || '-'}</td>
                    <td className="py-3.5 px-4 font-medium">
                      {b.date}, {b.time}
                    </td>
                    <td className="py-3.5 px-4 font-bold">{b.guests}</td>
                    <td className="py-3.5 px-4 font-semibold">
                      {b.table?.tableNumber || <span className="text-on-surface-variant italic">Unassigned</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-xs font-bold uppercase border ${
                          b.status === 'RESERVED'
                            ? 'bg-secondary-container text-on-secondary-container border-secondary/40'
                            : b.status === 'SEATED'
                            ? 'bg-primary/10 text-primary border-primary/30'
                            : b.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-700 border-red-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      {b.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusUpdate(b.id, 'RESERVED')}
                          className="h-8 px-3 bg-primary text-on-primary font-bold text-xs rounded hover:bg-primary-container transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      {b.status === 'RESERVED' && (
                        <button
                          onClick={() => handleStatusUpdate(b.id, 'SEATED')}
                          className="h-8 px-3 bg-secondary-container text-on-secondary-container font-bold text-xs rounded hover:bg-secondary transition-colors"
                        >
                          Check-in
                        </button>
                      )}
                      {b.status === 'SEATED' && (
                        <button
                          onClick={() => handleStatusUpdate(b.id, 'COMPLETED')}
                          className="h-8 px-3 bg-green-700 text-white font-bold text-xs rounded hover:bg-green-800 transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleStatusUpdate(b.id, 'CANCELLED')}
                          className="h-8 px-3 bg-surface border border-outline-variant text-on-surface-variant font-bold text-xs rounded hover:bg-surface-container transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tables={tables}
        customers={customers}
        onSave={fetchData}
      />
    </div>
  );
};

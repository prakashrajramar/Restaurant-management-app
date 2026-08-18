import React, { useState } from 'react';
import { RestaurantTable, Customer } from '../types';
import { api } from '../api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: RestaurantTable[];
  customers: Customer[];
  onSave: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  tables,
  customers,
  onSave,
}) => {
  const [customerMode, setCustomerMode] = useState<'EXISTING' | 'NEW'>('NEW');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableId, setTableId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:00');
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customerMode === 'EXISTING' && !selectedCustomerId) {
      setError('Please select a customer.');
      return;
    }
    if (customerMode === 'NEW' && (!customerName.trim() || !customerPhone.trim())) {
      setError('Customer name and phone are required.');
      return;
    }
    if (!date || !time) {
      setError('Please select date and time.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.createBooking({
        customerId: customerMode === 'EXISTING' ? selectedCustomerId : undefined,
        customerName: customerMode === 'NEW' ? customerName.trim() : undefined,
        customerPhone: customerMode === 'NEW' ? customerPhone.trim() : undefined,
        tableId: tableId || undefined,
        date,
        time,
        guests: Number(guests),
        notes: notes.trim(),
      });

      setLoading(false);
      onSave();
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to create booking');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-surface-container-lowest shadow-2xl border border-outline-variant">
        <div className="flex items-center justify-between border-b border-surface-container-highest px-6 py-4">
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">event_available</span>
            New Table Booking
          </h3>
          <button onClick={onClose} className="material-symbols-outlined text-on-surface-variant hover:text-primary">
            close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {/* Customer Selection Mode */}
          <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant">
            <button
              type="button"
              onClick={() => setCustomerMode('NEW')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                customerMode === 'NEW' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'
              }`}
            >
              + New Customer
            </button>
            <button
              type="button"
              onClick={() => setCustomerMode('EXISTING')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                customerMode === 'EXISTING' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'
              }`}
            >
              Existing Customer
            </button>
          </div>

          {customerMode === 'NEW' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Eleanor Vance"
                  className="w-full h-11 px-3 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full h-11 px-3 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm"
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Select Customer *</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm bg-white"
                required
              >
                <option value="">Choose Customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 px-2 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Time *</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-11 px-2 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Guests *</label>
              <input
                type="number"
                min="1"
                max="20"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Assign Table (Optional)</label>
            <select
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm bg-white"
            >
              <option value="">Unassigned (Pending)</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id} disabled={t.status === 'OCCUPIED'}>
                  {t.tableNumber} (Cap: {t.capacity}) - {t.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Notes / Preferences</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Window table, high chair required"
              className="w-full h-11 px-3 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-surface-container-highest">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-lg border border-outline-variant font-bold text-on-surface-variant hover:bg-surface-container"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-lg bg-primary text-on-primary font-bold hover:bg-primary-container shadow-md"
            >
              {loading ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

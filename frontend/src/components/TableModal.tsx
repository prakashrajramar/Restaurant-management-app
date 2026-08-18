import React, { useState } from 'react';
import { api } from '../api';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const TableModal: React.FC<TableModalProps> = ({ isOpen, onClose, onSave }) => {
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [status, setStatus] = useState<'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'CLEANING'>('AVAILABLE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim()) {
      setError('Table number is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.createTable({
        tableNumber: tableNumber.trim().toUpperCase(),
        capacity: Number(capacity),
        status,
      });

      setLoading(false);
      onSave();
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to create table');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-surface-container-lowest shadow-2xl border border-outline-variant">
        <div className="flex items-center justify-between border-b border-surface-container-highest px-6 py-4">
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">table_restaurant</span>
            Add New Table
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

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Table Number *</label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. T-09"
              className="w-full h-11 px-3 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Seating Capacity *</label>
            <input
              type="number"
              min="1"
              max="30"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full h-11 px-3 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Initial Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full h-11 px-3 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm bg-white"
            >
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="CLEANING">Cleaning</option>
            </select>
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
              {loading ? 'Creating...' : 'Create Table'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { RestaurantTable } from '../types';
import { api } from '../api';
import { TableModal } from '../components/TableModal';

export const TablesPage: React.FC = () => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await api.getTables();
      setTables(res);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleStatusChange = async (tableId: string, newStatus: string) => {
    try {
      await api.updateTableStatus(tableId, newStatus);
      fetchTables();
    } catch (err) {
      console.error('Error updating table status:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-on-surface-variant gap-2">
        <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
        <span className="font-semibold">Loading Table Floor Plan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container-highest pb-4">
        <div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl text-primary font-bold">Table Floor Plan</h1>
          <p className="font-body-sm text-on-surface-variant mt-1">Manage restaurant seating layout and live status updates.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-on-primary font-title-md py-2.5 px-4 rounded-lg flex items-center gap-2 hover:bg-primary-container transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined">add</span>
          Add New Table
        </button>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap items-center gap-6 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-outline-variant bg-white" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-secondary-container border border-secondary" />
          <span>Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-primary" />
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-orange-100 border border-orange-500" />
          <span>Cleaning</span>
        </div>
      </div>

      {/* Table Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tables.map((table) => {
          let cardStyle = 'bg-surface-container-lowest border-outline-variant text-on-surface hover:border-primary';
          let statusBadge = 'bg-gray-100 text-gray-700 border-gray-300';
          let icon = 'table_restaurant';

          if (table.status === 'RESERVED') {
            cardStyle = 'bg-secondary-container/20 border-secondary text-on-surface shadow-sm';
            statusBadge = 'bg-secondary-container text-on-secondary-container border-secondary/40';
            icon = 'event_seat';
          } else if (table.status === 'OCCUPIED') {
            cardStyle = 'bg-primary text-on-primary border-primary shadow-md';
            statusBadge = 'bg-white/20 text-white border-white/30';
            icon = 'restaurant';
          } else if (table.status === 'CLEANING') {
            cardStyle = 'bg-orange-50 border-orange-400 border-dashed text-orange-950';
            statusBadge = 'bg-orange-200 text-orange-900 border-orange-400';
            icon = 'cleaning_services';
          }

          return (
            <div
              key={table.id}
              className={`relative flex flex-col items-center justify-between p-4 h-40 rounded-xl border-2 transition-all cursor-pointer group ${cardStyle}`}
              onClick={() => setSelectedTable(table)}
            >
              <div className="w-full flex justify-between items-center text-xs font-semibold">
                <span className="opacity-80">Cap: {table.capacity}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] border font-bold uppercase ${statusBadge}`}>
                  {table.status}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1 my-auto">
                <span className="material-symbols-outlined text-3xl">{icon}</span>
                <span className="font-headline-lg text-xl font-bold">{table.tableNumber}</span>
              </div>

              {/* Status Action Buttons Bar */}
              <div className="w-full pt-2 border-t border-current/10 flex justify-center gap-1 opacity-95">
                {table.status === 'AVAILABLE' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(table.id, 'RESERVED');
                    }}
                    className="px-2 py-0.5 text-[10px] font-bold rounded bg-secondary-container text-on-secondary-container hover:opacity-90"
                  >
                    Reserve
                  </button>
                )}
                {table.status === 'RESERVED' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(table.id, 'OCCUPIED');
                    }}
                    className="px-2 py-0.5 text-[10px] font-bold rounded bg-primary text-white hover:opacity-90"
                  >
                    Check-in
                  </button>
                )}
                {table.status === 'OCCUPIED' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(table.id, 'CLEANING');
                    }}
                    className="px-2 py-0.5 text-[10px] font-bold rounded bg-white text-primary hover:bg-gray-100"
                  >
                    Clear Bill
                  </button>
                )}
                {table.status === 'CLEANING' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(table.id, 'AVAILABLE');
                    }}
                    className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-700 text-white hover:bg-green-800"
                  >
                    Cleaned
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TableModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={fetchTables} />
    </div>
  );
};

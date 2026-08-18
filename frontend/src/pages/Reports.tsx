import React, { useEffect, useState } from 'react';
import { DashboardData } from '../types';
import { api } from '../api';

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await api.getDashboardData(period);
        setData(res);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setLoading(false);
      }
    };
    fetchReports();
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-on-surface-variant gap-2">
        <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
        <span className="font-semibold">Loading Sales Reports...</span>
      </div>
    );
  }

  const m = data?.metrics || {
    totalRevenue: 0,
    totalBills: 0,
    avgBillValue: 0,
    totalDiscounts: 0,
    totalTax: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container-highest pb-4">
        <div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl text-primary font-bold">Sales & Payment Reports</h1>
          <p className="font-body-sm text-on-surface-variant mt-1">Comprehensive breakdown of financial metrics, tax reports, and payment distribution.</p>
        </div>
        <div className="flex gap-2 items-center">
          {(['today', 'week', 'month', 'all'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-2 text-xs font-bold rounded-lg border ${period === p ? 'bg-primary text-on-primary' : 'bg-white border-outline-variant text-on-surface-variant'}`}>
              {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
          <button
          onClick={() => { document.body.classList.add('print-report'); window.print(); setTimeout(() => document.body.classList.remove('print-report'), 500); }}
          className="bg-primary text-on-primary font-title-md py-2.5 px-4 rounded-lg flex items-center gap-2 hover:bg-primary-container transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined">print</span>
          Print Summary Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <span className="text-xs uppercase font-bold text-on-surface-variant">Gross Sales Revenue</span>
          <div className="text-2xl font-bold text-primary mt-1">₹{m.totalRevenue.toLocaleString()}</div>
          <span className="text-[11px] text-on-surface-variant font-semibold">{period === 'today' ? 'Today' : period === 'week' ? 'Last 7 days' : period === 'month' ? 'Current month' : 'All recorded sales'}</span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <span className="text-xs uppercase font-bold text-on-surface-variant">Total Invoices Settled</span>
          <div className="text-2xl font-bold text-on-surface mt-1">{m.totalBills}</div>
          <span className="text-[11px] text-on-surface-variant font-semibold">100% Paid Status</span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <span className="text-xs uppercase font-bold text-on-surface-variant">GST Tax Collected</span>
          <div className="text-2xl font-bold text-on-surface mt-1">₹{m.totalTax.toLocaleString()}</div>
          <span className="text-[11px] text-on-surface-variant font-semibold">5% CGST / SGST</span>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <span className="text-xs uppercase font-bold text-on-surface-variant">Promotional Discounts</span>
          <div className="text-2xl font-bold text-error mt-1">₹{m.totalDiscounts.toLocaleString()}</div>
          <span className="text-[11px] text-on-surface-variant font-semibold">Applied on bills</span>
        </div>
      </div>

      {/* Itemized Category Breakdown */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
        <h3 className="font-title-md text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">analytics</span>
          Top Performing Items Breakdown
        </h3>

        <div className="space-y-3">
          {data?.topFoodItems.map((item) => (
            <div key={item.id} className="p-4 border border-outline-variant rounded-lg flex justify-between items-center bg-surface-bright">
              <div>
                <div className="font-bold text-base text-on-surface">{item.name}</div>
                <div className="text-xs text-on-surface-variant">{item.category?.name} • Unit Price: ₹{item.price}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-primary">{item.totalSold} Units Sold</div>
                <div className="text-xs font-semibold text-on-surface-variant">Total Value: ₹{(item.totalSold * item.price).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

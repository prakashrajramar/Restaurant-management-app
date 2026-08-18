import React, { useEffect, useState } from 'react';
import { DashboardData } from '../types';
import { api } from '../api';

export const DashboardPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardData(period);
      setData(res);
      setLoading(false);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-on-surface-variant gap-2">
        <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
        <span className="font-semibold text-lg">Loading Dashboard Data...</span>
      </div>
    );
  }

  const m = data?.metrics || {
    totalRevenue: 0,
    totalBills: 0,
    avgBillValue: 0,
    totalDiscounts: 0,
    totalTax: 0,
    totalCustomers: 0,
    availableTables: 0,
    occupiedTables: 0,
    reservedTables: 0,
    cleaningTables: 0,
  };

  const upi = data?.paymentSplit.upi || { count: 0, amount: 0 };
  const card = data?.paymentSplit.card || { count: 0, amount: 0 };
  const cash = data?.paymentSplit.cash || { count: 0, amount: 0 };
  const totalPaymentAmt = upi.amount + card.amount + cash.amount || 1;

  const upiPct = Math.round((upi.amount / totalPaymentAmt) * 100);
  const cardPct = Math.round((card.amount / totalPaymentAmt) * 100);
  const cashPct = Math.round((cash.amount / totalPaymentAmt) * 100);

  return (
    <div className="space-y-6">
      {/* Time Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-surface-container-highest pb-4">
        <div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl text-primary font-bold">Dashboard & Analytics</h1>
          <p className="font-body-sm text-on-surface-variant mt-1">Real-time overview of financial performance and table occupancy.</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-lg border border-outline-variant self-start md:self-auto">
          {(['today', 'week', 'month', 'all'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 text-xs font-bold rounded-md ${period === p ? 'text-primary bg-surface-container-lowest shadow-sm border border-outline-variant ring-1 ring-secondary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}>
              {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden shadow-sm hover:border-primary transition-colors group">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Total Revenue</span>
            <span className="material-symbols-outlined text-secondary text-[20px]">account_balance_wallet</span>
          </div>
          <div className="font-pos-price text-2xl font-bold text-on-surface mt-1">₹{m.totalRevenue.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-secondary mt-1">
            <span className="material-symbols-outlined text-xs">arrow_upward</span>
            {period === 'today' ? 'Today' : period === 'week' ? 'Last 7 days' : period === 'month' ? 'Current month' : 'All recorded sales'}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden shadow-sm hover:border-primary transition-colors">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Total Bills</span>
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">receipt</span>
          </div>
          <div className="font-display-sm text-2xl font-bold text-on-surface mt-1">{m.totalBills}</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-secondary mt-1">
            <span className="material-symbols-outlined text-xs">arrow_upward</span>
            {period === 'today' ? 'Today' : period === 'week' ? 'Last 7 days' : period === 'month' ? 'Current month' : 'All recorded sales'}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden shadow-sm hover:border-primary transition-colors">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Avg Bill Value</span>
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">calculate</span>
          </div>
          <div className="font-pos-price text-2xl font-bold text-on-surface mt-1">₹{m.avgBillValue.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant mt-1">
            <span className="material-symbols-outlined text-xs">horizontal_rule</span>
            Steady performance
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden shadow-sm hover:border-primary transition-colors">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Total Discounts</span>
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">loyalty</span>
          </div>
          <div className="font-pos-price text-2xl font-bold text-on-surface mt-1">₹{m.totalDiscounts.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-error mt-1">
            <span className="material-symbols-outlined text-xs">arrow_upward</span>
            4.1% higher
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden shadow-sm hover:border-primary transition-colors">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Total GST Tax</span>
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">account_balance</span>
          </div>
          <div className="font-pos-price text-2xl font-bold text-on-surface mt-1">₹{m.totalTax.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-secondary mt-1">
            <span className="material-symbols-outlined text-xs">arrow_upward</span>
            Aligned with revenue
          </div>
        </div>
      </div>

      {/* Bento Grid Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-title-md text-lg font-bold text-on-surface">Revenue Trend</h3>
            <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-2.5 py-1 rounded">Live DB Sync</span>
          </div>
          <div className="flex-1 w-full relative min-h-[220px] flex items-end">
            <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="revGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3c0004" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3c0004" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,80 L10,65 L20,70 L30,40 L40,55 L50,30 L60,45 L70,20 L80,35 L90,15 L100,25 L100,100 L0,100 Z" fill="url(#revGrad)" />
              <path d="M0,80 L10,65 L20,70 L30,40 L40,55 L50,30 L60,45 L70,20 L80,35 L90,15 L100,25" fill="none" stroke="#3c0004" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="flex justify-between text-[11px] text-on-surface-variant font-label-md mt-4 pt-2 border-t border-surface-container-highest">
            <span>1st</span><span>5th</span><span>10th</span><span>15th</span><span>20th</span><span>25th</span><span>30th</span>
          </div>
        </div>

        {/* Payment Split & Table Status */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-title-md text-lg font-bold text-on-surface mb-4">Payment Method Split</h3>
            
            {/* Visual Split Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex shadow-inner mb-6 bg-surface-container-highest">
              <div className="bg-primary h-full" style={{ width: `${upiPct}%` }} title={`UPI: ${upiPct}%`} />
              <div className="bg-secondary h-full" style={{ width: `${cardPct}%` }} title={`Card: ${cardPct}%`} />
              <div className="bg-outline-variant h-full" style={{ width: `${cashPct}%` }} title={`Cash: ${cashPct}%`} />
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary" />
                  <span className="font-semibold text-on-surface">UPI ({upiPct}%)</span>
                </div>
                <span className="font-bold text-on-surface">₹{upi.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-secondary" />
                  <span className="font-semibold text-on-surface">Card ({cardPct}%)</span>
                </div>
                <span className="font-bold text-on-surface">₹{card.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-outline-variant" />
                  <span className="font-semibold text-on-surface">Cash ({cashPct}%)</span>
                </div>
                <span className="font-bold text-on-surface">₹{cash.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Quick Table Status Summary */}
          <div className="mt-6 pt-4 border-t border-outline-variant">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-xs uppercase text-on-surface-variant">Table Occupancy</span>
              <button onClick={() => onNavigate('tables')} className="text-xs text-primary font-bold hover:underline">Manage Floor</button>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-green-50 text-green-700 font-bold border border-green-200">
                <div>{m.availableTables}</div>
                <div className="text-[10px] font-normal">Available</div>
              </div>
              <div className="p-2 rounded bg-red-50 text-primary font-bold border border-red-200">
                <div>{m.occupiedTables}</div>
                <div className="text-[10px] font-normal">Occupied</div>
              </div>
              <div className="p-2 rounded bg-yellow-50 text-amber-800 font-bold border border-amber-200">
                <div>{m.reservedTables}</div>
                <div className="text-[10px] font-normal">Reserved</div>
              </div>
              <div className="p-2 rounded bg-orange-50 text-orange-800 font-bold border border-orange-200">
                <div>{m.cleaningTables}</div>
                <div className="text-[10px] font-normal">Cleaning</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Leaderboard & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Leaderboard */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-title-md text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">bar_chart</span>
              Top Selling Food Items
            </h3>
            <button onClick={() => onNavigate('food')} className="text-xs text-primary font-bold hover:underline">View All Menu</button>
          </div>
          <div className="space-y-3">
            {data?.topFoodItems.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-sm text-on-surface flex items-center gap-2">
                      {item.name}
                      <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                    </div>
                    <div className="text-xs text-on-surface-variant">{item.category?.name || 'Category'} • ₹{item.price}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-primary">{item.totalSold} sold</div>
                  <div className="text-xs text-on-surface-variant">₹{(item.totalSold * item.price).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bills */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-title-md text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
              Recent Transactions
            </h3>
            <button onClick={() => onNavigate('bills')} className="text-xs text-primary font-bold hover:underline">View All Bills</button>
          </div>
          <div className="space-y-3">
            {data?.recentInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors">
                <div>
                  <div className="font-bold text-sm text-on-surface">{inv.invoiceNumber}</div>
                  <div className="text-xs text-on-surface-variant">
                    {inv.customer?.name || 'Walk-in Customer'} • {inv.table?.tableNumber || 'Takeaway'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-primary">₹{inv.total}</div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-secondary-container text-on-secondary-container">
                    {inv.paymentMethod}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

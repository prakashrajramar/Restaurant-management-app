import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewOrder: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onNewOrder }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'pos', label: 'Billing/POS', icon: 'point_of_sale' },
    { id: 'bookings', label: 'Bookings', icon: 'event_available' },
    { id: 'tables', label: 'Tables', icon: 'table_restaurant' },
    { id: 'food', label: 'Food Items', icon: 'restaurant_menu' },
    { id: 'bills', label: 'Bills & Sales', icon: 'receipt_long' },
    { id: 'customers', label: 'Customers', icon: 'group' },
    { id: 'reports', label: 'Reports', icon: 'assessment' },
  ];

  return (
    <nav className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 py-grid-margin bg-surface-container-low border-r border-outline-variant z-40">
      {/* Brand Header */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-headline-lg font-bold">
          P
        </div>
        <div className="overflow-hidden">
          <h1 className="font-headline-lg text-headline-lg text-primary truncate leading-none">Prakashraj R</h1>
          <p className="font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant mt-1">Heritage Modernity</p>
        </div>
      </div>

      {/* New Order Button */}
      <div className="px-4 mb-6">
        <button
          onClick={onNewOrder}
          className="w-full bg-primary text-on-primary font-title-md text-title-md py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined">add</span>
          New Order
        </button>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left rounded-lg mx-0 my-1 px-4 py-3 flex items-center gap-pos-gap transition-all ${
                isActive
                  ? 'bg-primary text-on-primary font-semibold shadow-md scale-[0.98]'
                  : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
              }`}
            >
              <span className={`material-symbols-outlined ${isActive ? 'fill-icon' : ''}`}>
                {item.icon}
              </span>
              <span className="font-title-md text-title-md">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings at bottom */}
      <div className="px-2 mt-auto">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full text-left rounded-lg mx-0 my-1 px-4 py-3 flex items-center gap-pos-gap transition-colors border-t border-outline-variant pt-4 ${
            activeTab === 'settings'
              ? 'bg-primary text-on-primary font-semibold'
              : 'text-on-surface-variant hover:bg-surface-container-highest'
          }`}
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-title-md text-title-md">Settings</span>
        </button>
      </div>
    </nav>
  );
};

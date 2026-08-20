import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import InstallAppButton from './components/InstallAppButton';

import { DashboardPage } from './pages/Dashboard';
import { POSPage } from './pages/POS';
import { TablesPage } from './pages/Tables';
import { BookingsPage } from './pages/Bookings';
import { FoodItemsPage } from './pages/FoodItems';
import { CustomersPage } from './pages/Customers';
import { BillsPage } from './pages/Bills';
import { ReportsPage } from './pages/Reports';

import { RestaurantSettings } from './types';
import { api } from './api';
import ChatAssistant from './components/ChatAssistant';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');

  useEffect(() => {
    if (activeTab !== 'settings') return;

    setSettingsLoading(true);

    api
      .getSettings()
      .then(setSettings)
      .catch(() => setSettingsMessage('Unable to load settings'))
      .finally(() => setSettingsLoading(false));
  }, [activeTab]);

  const getPageInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Food Inventory & Dashboard Overview',
          subtitle: 'Real-time financial metrics, table status, and sales analytics.',
        };

      case 'pos':
        return {
          title: 'Billing / Point of Sale (POS)',
          subtitle: 'Select food items, manage cart quantities, calculate tax, and process payments.',
        };

      case 'bookings':
        return {
          title: 'Table & Booking Management',
          subtitle: 'View upcoming table reservations, check-in guests, and prevent booking overlaps.',
        };

      case 'tables':
        return {
          title: 'Restaurant Floor & Table Layout',
          subtitle: 'Live visual table statuses (Available, Occupied, Reserved, Cleaning).',
        };

      case 'food':
        return {
          title: 'Menu & Food Inventory',
          subtitle: 'Manage dish names, categories, prices, veg/non-veg status, and availability.',
        };

      case 'bills':
        return {
          title: 'Invoices & Sales History',
          subtitle: 'Inspect past completed bills and trigger 80mm thermal receipts.',
        };

      case 'customers':
        return {
          title: 'Customer Directory & History',
          subtitle: 'View registered customers, phone numbers, visit counts, and lifetime spend.',
        };

      case 'reports':
        return {
          title: 'Financial & Sales Reports',
          subtitle: 'Tax statements, gross revenue summaries, and top-selling food items.',
        };

      default:
        return {
          title: 'Settings & Restaurant Profile',
          subtitle: 'Configure restaurant name, thermal printer options, and tax rates.',
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen flex bg-background text-on-background">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewOrder={() => setActiveTab('pos')}
      />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-grid-margin min-h-screen flex flex-col max-w-[1400px]">
        <Header
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          actionButton={<InstallAppButton />}
        />

        <div className="flex-1">
          {activeTab === 'dashboard' && (
            <DashboardPage onNavigate={setActiveTab} />
          )}

          {activeTab === 'pos' && <POSPage />}

          {activeTab === 'bookings' && (
            <BookingsPage searchQuery={searchQuery} />
          )}

          {activeTab === 'tables' && <TablesPage />}

          {activeTab === 'food' && (
            <FoodItemsPage searchQuery={searchQuery} />
          )}

          {activeTab === 'bills' && (
            <BillsPage searchQuery={searchQuery} />
          )}

          {activeTab === 'customers' && (
            <CustomersPage searchQuery={searchQuery} />
          )}

          {activeTab === 'reports' && <ReportsPage />}

          {activeTab === 'settings' && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 max-w-2xl space-y-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-outline-variant pb-3">
                <div>
                  <h2 className="text-xl font-bold text-primary">
                    Restaurant Configuration
                  </h2>

                  <p className="text-xs text-on-surface-variant mt-1">
                    These settings are saved to the database and used for
                    billing and receipts.
                  </p>
                </div>
              </div>

              {settingsLoading || !settings ? (
                <div className="py-8 text-center text-on-surface-variant">
                  Loading settings...
                </div>
              ) : (
                <form
                  className="space-y-4 text-sm"
                  onSubmit={async (e) => {
                    e.preventDefault();

                    setSettingsSaving(true);
                    setSettingsMessage('');

                    try {
                      const saved = await api.updateSettings(settings);
                      setSettings(saved);
                      setSettingsMessage('Settings saved successfully.');
                    } catch (err: any) {
                      setSettingsMessage(
                        err.response?.data?.error || 'Failed to save settings'
                      );
                    } finally {
                      setSettingsSaving(false);
                    }
                  }}
                >
                  <div>
                    <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                      Restaurant Name
                    </label>

                    <input
                      required
                      value={settings.restaurantName}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          restaurantName: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-outline-variant rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                      Address
                    </label>

                    <input
                      value={settings.address}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          address: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-outline-variant rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                      Phone
                    </label>

                    <input
                      value={settings.phone}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          phone: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-outline-variant rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                      GSTIN
                    </label>

                    <input
                      value={settings.gstin}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          gstin: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-outline-variant rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                      GST Tax Rate (%)
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={settings.taxRate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          taxRate: Number(e.target.value),
                        })
                      }
                      className="w-full p-3 border border-outline-variant rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                      Printer Setup
                    </label>

                    <select
                      value={settings.printerType}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          printerType: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-outline-variant rounded-lg bg-white font-semibold"
                    >
                      <option value="80MM">
                        Standard 80mm Thermal Receipt Printer
                      </option>

                      <option value="A4">
                        A4 Laser Printer
                      </option>
                    </select>
                  </div>

                  {settingsMessage && (
                    <div className="p-3 rounded-lg bg-surface-container text-sm font-semibold">
                      {settingsMessage}
                    </div>
                  )}

                  <button
                    disabled={settingsSaving}
                    className="w-full py-3 rounded-lg bg-primary text-on-primary font-bold hover:bg-primary-container disabled:opacity-50"
                  >
                    {settingsSaving
                      ? 'Saving...'
                      : 'Save Restaurant Settings'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

    {/* Floating AI Assistant */}
    <ChatAssistant />
    </div>
  );
};
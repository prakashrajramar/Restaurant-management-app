import React, { useState, useEffect } from 'react';
import { FoodItem, Category, Customer, RestaurantTable, Invoice, RestaurantSettings } from '../types';
import { api } from '../api';
import { PaymentModal } from '../components/PaymentModal';
import { ThermalReceipt } from '../components/ThermalReceipt';

interface CartItem {
  foodItem: FoodItem;
  quantity: number;
}

export const POSPage: React.FC = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadData = async () => {
    try {
      const [foods, cats, custs, tbls, appSettings] = await Promise.all([
        api.getFoodItems({ isAvailable: true }),
        api.getCategories(),
        api.getCustomers(),
        api.getTables(),
        api.getSettings(),
      ]);
      setFoodItems(foods);
      setCategories(cats);
      setCustomers(custs);
      setTables(tbls);
      setSettings(appSettings);
    } catch (err) {
      console.error('Error loading POS data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Cart operations
  const addToCart = (item: FoodItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.foodItem.id === item.id);
      if (existing) {
        return prev.map((i) => (i.foodItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { foodItem: item, quantity: 1 }];
    });
  };

  const updateQuantity = (foodItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.foodItem.id === foodItemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (foodItemId: string) => {
    setCart((prev) => prev.filter((i) => i.foodItem.id !== foodItemId));
  };

  const clearBill = () => {
    setCart([]);
    setSelectedCustomer(null);
    setSelectedTable(null);
    setDiscountAmount(0);
  };

  // Real calculations
  const subtotal = cart.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0);
  const taxable = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(taxable * ((settings?.taxRate ?? 5) / 100));
  const grandTotal = taxable + tax;

  // Filter food items
  const filteredItems = foodItems.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePaymentSuccess = (invoice: Invoice) => {
    setIsPaymentOpen(false);
    setCreatedInvoice(invoice);
    setIsReceiptOpen(true);
    showToast(`Payment successful! Bill ${invoice.invoiceNumber} created.`);
    clearBill();
    loadData(); // Refresh tables and metrics
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)]">
      {/* Toast banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-bounce font-bold">
          <span className="material-symbols-outlined">check_circle</span>
          {toastMessage}
        </div>
      )}

      {/* Main Food Menu Section */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Search & Category Filter */}
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food items..."
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-sm focus:border-primary outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                  selectedCategory === 'ALL'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Food Items Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1 overflow-y-auto max-h-[calc(100vh-250px)] pr-1">
          {filteredItems.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2">restaurant_menu</span>
              <p className="font-bold text-lg">No food items found.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant hover:border-primary hover:shadow-md transition-all p-3"
              >
                <div className="aspect-video w-full overflow-hidden rounded-lg relative bg-surface-container mb-3">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-3xl">image</span>
                    </div>
                  )}
                  <span
                    className={`absolute top-2 right-2 flex items-center justify-center h-6 w-6 rounded bg-white shadow-sm border ${
                      item.isVeg ? 'border-green-600' : 'border-error'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-error'}`} />
                  </span>
                </div>

                <div className="flex flex-col gap-1 mb-3">
                  <h3 className="font-bold text-base text-on-surface line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-on-surface-variant line-clamp-1">{item.description || item.category?.name}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-surface-container-highest">
                  <span className="font-pos-price text-lg font-bold text-primary">₹{item.price}</span>
                  <button
                    onClick={() => addToCart(item)}
                    className="flex items-center gap-1 rounded-lg bg-secondary-container px-3 py-1.5 text-xs font-bold text-on-secondary-container hover:bg-secondary hover:text-white transition-colors shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">add</span> Add
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Side Pane: Current Bill */}
      <aside className="w-full lg:w-96 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl flex flex-col">
        {/* Bill Header */}
        <div className="border-b border-surface-container-highest p-5 space-y-3 bg-surface-bright rounded-t-xl">
          <h2 className="text-lg font-bold text-on-surface flex items-center justify-between">
            <span>Current Bill</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-primary/10 text-primary">Live Calculator</span>
          </h2>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">Select Table</label>
              <select
                value={selectedTable?.id || ''}
                onChange={(e) => {
                  const t = tables.find((tbl) => tbl.id === e.target.value);
                  setSelectedTable(t || null);
                }}
                className="w-full p-2 rounded border border-outline-variant bg-white outline-none font-semibold text-xs"
              >
                <option value="">Takeaway / None</option>
                {tables.map((tbl) => (
                  <option key={tbl.id} value={tbl.id}>
                    {tbl.tableNumber} ({tbl.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-on-surface-variant mb-1">Select Customer</label>
              <select
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const c = customers.find((cust) => cust.id === e.target.value);
                  setSelectedCustomer(c || null);
                }}
                className="w-full p-2 rounded border border-outline-variant bg-white outline-none font-semibold text-xs"
              >
                <option value="">Walk-in Customer</option>
                {customers.map((cust) => (
                  <option key={cust.id} value={cust.id}>
                    {cust.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Order Items Cart List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px] divide-y divide-surface-container-highest">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-1">shopping_cart</span>
              <p className="text-sm font-semibold">Bill is currently empty.</p>
              <p className="text-xs text-gray-400">Click "+ Add" on menu items to begin.</p>
            </div>
          ) : (
            cart.map(({ foodItem, quantity }) => (
              <div key={foodItem.id} className="pt-3 first:pt-0 flex items-center justify-between">
                <div className="flex flex-col max-w-[130px]">
                  <span className="font-bold text-sm text-on-surface truncate">{foodItem.name}</span>
                  <span className="text-xs text-on-surface-variant">₹{foodItem.price} / unit</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg bg-surface-container-low px-1.5 py-1 border border-outline-variant">
                    <button
                      onClick={() => updateQuantity(foodItem.id, -1)}
                      className="material-symbols-outlined text-sm hover:text-primary"
                    >
                      remove
                    </button>
                    <span className="mx-2 text-xs font-bold w-4 text-center">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(foodItem.id, 1)}
                      className="material-symbols-outlined text-sm hover:text-primary"
                    >
                      add
                    </button>
                  </div>

                  <span className="w-14 text-right font-bold text-sm text-on-surface">
                    ₹{foodItem.price * quantity}
                  </span>

                  <button
                    onClick={() => removeFromCart(foodItem.id)}
                    className="text-on-surface-variant hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Footer & Totals */}
        <div className="border-t border-surface-container-highest bg-surface-container-low p-4 rounded-b-xl space-y-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-on-surface-variant">
              <span>Subtotal</span>
              <span className="font-bold text-on-surface">₹{subtotal}</span>
            </div>

            <div className="flex justify-between items-center text-on-surface-variant">
              <span>Discount (₹)</span>
              <input
                type="number"
                min="0"
                max={subtotal}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                className="w-16 p-1 text-right font-bold border border-outline-variant rounded bg-white outline-none text-xs text-error"
              />
            </div>

            <div className="flex justify-between text-on-surface-variant">
              <span>Tax ({settings?.taxRate ?? 5}% GST)</span>
              <span className="font-bold text-on-surface">₹{tax}</span>
            </div>

            <div className="pt-2 border-t border-outline-variant flex justify-between items-center">
              <span className="text-base font-bold text-on-surface">Grand Total</span>
              <span className="text-2xl font-bold text-primary">₹{grandTotal}</span>
            </div>
          </div>

          {/* POS Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={clearBill}
              disabled={cart.length === 0}
              className="h-11 rounded-lg border border-outline-variant font-bold text-xs text-on-surface-variant hover:bg-surface-container disabled:opacity-50"
            >
              Clear Bill
            </button>

            <button
              onClick={() => {
                if (cart.length > 0) setIsPaymentOpen(true);
              }}
              disabled={cart.length === 0}
              className="h-11 rounded-lg bg-primary text-on-primary font-bold text-xs hover:bg-primary-container shadow-md disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">payments</span>
              Pay Now
            </button>
          </div>
        </div>
      </aside>

      {/* Modals */}
  <PaymentModal
  isOpen={isPaymentOpen}
  onClose={() => setIsPaymentOpen(false)}
  grandTotal={grandTotal}
  subtotal={subtotal}
  discount={discountAmount}
  tax={tax}
  selectedCustomer={selectedCustomer}
  selectedTable={selectedTable}
  items={cart.map((c) => ({
    foodItemId: c.foodItem.id,
    quantity: c.quantity,
    name: c.foodItem.name,
    price: c.foodItem.price,
  }))}
  onPaymentSuccess={handlePaymentSuccess}
/>

{isReceiptOpen && (
  <ThermalReceipt
    invoice={createdInvoice}
    onClose={() => setIsReceiptOpen(false)}
  />
)}
    </div>
  );
};

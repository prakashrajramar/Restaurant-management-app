import React, { useState, useEffect } from 'react';
import { FoodItem, Category } from '../types';
import { api } from '../api';
import { FoodModal } from '../components/FoodModal';

export const FoodItemsPage: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [foods, cats] = await Promise.all([api.getFoodItems(), api.getCategories()]);
      setFoodItems(foods);
      setCategories(cats);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching food items:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleAvailability = async (id: string) => {
    try {
      await api.toggleFoodAvailability(id);
      fetchData();
    } catch (err) {
      console.error('Error toggling availability:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this food item?')) {
      try {
        await api.deleteFoodItem(id);
        fetchData();
      } catch (err) {
        console.error('Error deleting food item:', err);
      }
    }
  };

  const filteredItems = foodItems.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container-highest pb-4">
        <div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl text-primary font-bold">Food Inventory & Menu</h1>
          <p className="font-body-sm text-on-surface-variant mt-1">Manage restaurant menu items, pricing, and availability.</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-on-primary font-title-md py-2.5 px-4 rounded-lg flex items-center gap-2 hover:bg-primary-container transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined">add</span>
          Add Food Item
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            selectedCategory === 'ALL'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          All Items ({foodItems.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Bento Grid: Menu Items Table + Sales Leaderboard Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main Table */}
        <div className="xl:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-outline-variant bg-surface-bright flex justify-between items-center">
            <h3 className="font-headline-lg text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">menu_book</span>
              Menu Items List
            </h3>
            <span className="text-xs text-on-surface-variant font-bold">{filteredItems.length} Records</span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-on-surface-variant font-semibold">Loading menu items...</div>
            ) : filteredItems.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2">restaurant</span>
                <p className="font-bold text-base">No food items found matching your filters.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant font-label-md text-xs uppercase">
                    <th className="p-4 font-semibold w-16">Image</th>
                    <th className="p-4 font-semibold">Item Details</th>
                    <th className="p-4 font-semibold">Price</th>
                    <th className="p-4 font-semibold text-center">Available</th>
                    <th className="p-4 font-semibold text-right">Sold</th>
                    <th className="p-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-highest text-sm text-on-surface">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="p-4">
                        <div className="w-12 h-12 rounded bg-surface-container overflow-hidden border border-outline-variant flex items-center justify-center">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-on-surface-variant">image</span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-title-md font-bold text-on-surface">{item.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center justify-center w-3.5 h-3.5 border rounded-sm ${
                              item.isVeg ? 'border-green-600' : 'border-error'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-error'}`} />
                          </span>
                          <span className="text-xs text-on-surface-variant">{item.category?.name || 'Category'}</span>
                        </div>
                      </td>

                      <td className="p-4 font-pos-price font-bold text-primary">₹{item.price}</td>

                      <td className="p-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.isAvailable}
                            onChange={() => handleToggleAvailability(item.id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </td>

                      <td className="p-4 text-right font-bold text-on-surface-variant">{item.totalSold.toLocaleString()}</td>

                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setIsModalOpen(true);
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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

        {/* Sidebar Leaderboard */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
            <h3 className="font-title-md text-base font-bold text-on-surface flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary">bar_chart</span>
              Menu Analytics Summary
            </h3>
            <div className="space-y-4 text-xs font-semibold">
              <div className="flex justify-between p-3 rounded bg-surface-container-low">
                <span className="text-on-surface-variant">Total Menu Items</span>
                <span className="font-bold text-on-surface">{foodItems.length}</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-surface-container-low">
                <span className="text-on-surface-variant">Active Available Items</span>
                <span className="font-bold text-green-700">{foodItems.filter((i) => i.isAvailable).length}</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-surface-container-low">
                <span className="text-on-surface-variant">Vegetarian Items</span>
                <span className="font-bold text-on-surface">{foodItems.filter((i) => i.isVeg).length}</span>
              </div>
              <div className="flex justify-between p-3 rounded bg-surface-container-low">
                <span className="text-on-surface-variant">Non-Veg Items</span>
                <span className="font-bold text-on-surface">{foodItems.filter((i) => !i.isVeg).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FoodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        foodItem={editingItem}
        categories={categories}
        onSave={fetchData}
      />
    </div>
  );
};

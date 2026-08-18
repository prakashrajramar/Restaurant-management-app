import React, { useState, useEffect } from 'react';
import { FoodItem, Category } from '../types';
import { api } from '../api';

interface FoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodItem?: FoodItem | null;
  categories: Category[];
  onSave: () => void;
}

export const FoodModal: React.FC<FoodModalProps> = ({
  isOpen,
  onClose,
  foodItem,
  categories,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (foodItem) {
      setName(foodItem.name);
      setCategoryId(foodItem.categoryId);
      setPrice(foodItem.price);
      setDescription(foodItem.description || '');
      setIsVeg(foodItem.isVeg);
      setImageUrl(foodItem.imageUrl || '');
      setIsAvailable(foodItem.isAvailable);
    } else {
      setName('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setPrice('');
      setDescription('');
      setIsVeg(true);
      setImageUrl('');
      setIsAvailable(true);
    }
    setError('');
  }, [foodItem, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Food name is required.');
      return;
    }
    if (!categoryId) {
      setError('Please select a category.');
      return;
    }
    if (price === '' || Number(price) < 0) {
      setError('Please enter a valid price.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: name.trim(),
        categoryId,
        price: Number(price),
        description: description.trim(),
        isVeg,
        imageUrl: imageUrl.trim(),
        isAvailable,
      };

      if (foodItem) {
        await api.updateFoodItem(foodItem.id, payload);
      } else {
        await api.createFoodItem(payload);
      }

      setLoading(false);
      onSave();
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to save food item');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-surface-container-lowest shadow-2xl border border-outline-variant">
        <div className="flex items-center justify-between border-b border-surface-container-highest px-6 py-4">
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">restaurant_menu</span>
            {foodItem ? 'Edit Food Item' : 'Add Food Item'}
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
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Food Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Murgh Makhani"
              className="w-full h-11 px-3 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm bg-white"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Price (₹) *</label>
              <input
                type="number"
                step="1"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="450"
                className="w-full h-11 px-3 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="vegNonVeg"
                checked={isVeg}
                onChange={() => setIsVeg(true)}
                className="text-primary focus:ring-primary"
              />
              <span className="inline-flex items-center justify-center w-4 h-4 border border-green-600 rounded-sm mr-1">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              </span>
              <span className="text-sm font-semibold text-on-surface">Veg</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="vegNonVeg"
                checked={!isVeg}
                onChange={() => setIsVeg(false)}
                className="text-primary focus:ring-primary"
              />
              <span className="inline-flex items-center justify-center w-4 h-4 border border-error rounded-sm mr-1">
                <span className="w-2 h-2 bg-error rounded-full"></span>
              </span>
              <span className="text-sm font-semibold text-on-surface">Non-Veg</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full h-11 px-3 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of ingredients or taste..."
              className="w-full p-3 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-bold text-on-surface">Currently Available</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
            </label>
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
              {loading ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

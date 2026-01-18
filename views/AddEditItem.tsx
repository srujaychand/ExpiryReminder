import React, { useState, useEffect } from 'react';
import { Item, Category } from '../types.ts';
import { CATEGORIES } from '../constants.tsx';
import { addItem, updateItem } from '../services/storageService.ts';

interface AddEditItemProps {
  item?: Item;
  onSave: () => void;
  onCancel: () => void;
}

const AddEditItem: React.FC<AddEditItemProps> = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Item>>({
    name: '',
    category: Category.Grocery,
    expiryDate: '',
    reminderDays: 7,
    notes: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        expiryDate: item.expiryDate.split('T')[0],
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.expiryDate) {
      alert('Please fill in required fields');
      return;
    }

    const itemToSave: Item = {
      id: item?.id || Date.now().toString(),
      name: formData.name!,
      category: formData.category as Category,
      expiryDate: new Date(formData.expiryDate!).toISOString(),
      reminderDays: Number(formData.reminderDays),
      notes: formData.notes,
      createdAt: item?.createdAt || new Date().toISOString(),
    };

    if (item) {
      updateItem(itemToSave);
    } else {
      addItem(itemToSave);
    }
    onSave();
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">{item ? 'Edit Item' : 'New Item'}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Item Name *</label>
          <input 
            type="text" 
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g. Tomato Sauce"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
          <select 
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Expiry Date *</label>
            <input 
              type="date" 
              required
              value={formData.expiryDate}
              onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Remind Me (Days)</label>
            <input 
              type="number" 
              min="1"
              max="90"
              value={formData.reminderDays}
              onChange={(e) => setFormData({...formData, reminderDays: parseInt(e.target.value)})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Notes (Optional)</label>
          <textarea 
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Storage instructions or quantity..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="flex-1 px-4 py-3 bg-blue-600 rounded-xl font-bold text-white hover:bg-blue-700 shadow-md active:scale-95 transition-all"
          >
            {item ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditItem;
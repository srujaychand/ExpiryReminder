import React, { useState, useEffect } from 'react';
import { Item, Category } from '../types.ts';
import { CATEGORIES } from '../constants.tsx';
import { addItem, updateItem, getItems } from '../services/storageService.ts';

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

  // reminderInput state allows users to type freely, including clearing the field
  const [reminderInput, setReminderInput] = useState<string>('7');

  useEffect(() => {
    if (item) {
      setFormData({
        ...item,
        expiryDate: item.expiryDate.split('T')[0],
      });
      setReminderInput(item.reminderDays.toString());
    }
  }, [item]);

  const handleReminderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow any numeric string or empty string
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
      setReminderInput(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert input to number on submit, default to 0 if empty
    const finalReminderDays = reminderInput === '' ? 0 : parseInt(reminderInput, 10);

    if (!formData.name || !formData.expiryDate) {
      alert('Please fill in required fields');
      return;
    }

    const currentItems = getItems();
    const newExpiryIso = new Date(formData.expiryDate!).toISOString();

    const isDuplicate = currentItems.some(existingItem => 
      existingItem.id !== item?.id && 
      existingItem.name.trim().toLowerCase() === formData.name?.trim().toLowerCase() &&
      existingItem.expiryDate.split('T')[0] === formData.expiryDate
    );

    if (isDuplicate) {
      const confirmSave = window.confirm(`An item named "${formData.name}" with the same expiry date already exists. Save anyway?`);
      if (!confirmSave) return;
    }

    const itemToSave: Item = {
      id: item?.id || Date.now().toString(),
      name: formData.name!.trim(),
      category: formData.category as Category,
      expiryDate: newExpiryIso,
      reminderDays: finalReminderDays,
      notes: formData.notes,
      createdAt: item?.createdAt || new Date().toISOString(),
      // CRITICAL: Reset lastNotifiedStatus on any save/edit to ensure 
      // the notification engine re-evaluates this item immediately.
      lastNotifiedStatus: undefined, 
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{item ? 'Edit Item' : 'New Item'}</h2>
        <button onClick={onCancel} className="text-slate-400 p-2 active:scale-90 transition-transform">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Item Name *</label>
          <input 
            type="text" 
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g. Paracetamol 500mg"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
          <div className="relative">
            <select 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none text-base"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Expiry Date *</label>
            <input 
              type="date" 
              required
              value={formData.expiryDate}
              onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Alert Days</label>
            <input 
              type="text" 
              inputMode="numeric"
              value={reminderInput}
              onChange={handleReminderChange}
              placeholder="e.g. 7"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Notes (Optional)</label>
          <textarea 
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Quantity, dosage, or storage info..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-base"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 active:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="flex-1 px-4 py-4 bg-blue-600 rounded-2xl font-bold text-white shadow-lg shadow-blue-200 active:scale-95 transition-all"
          >
            {item ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditItem;
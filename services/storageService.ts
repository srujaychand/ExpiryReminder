
import { Item, AppSettings, ExpiryStatus } from '../types';
import { SAMPLE_DATA } from '../constants';

const STORAGE_KEY = 'expiry_app_items';
const SETTINGS_KEY = 'expiry_app_settings';

export const getItems = (): Item[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    saveItems(SAMPLE_DATA);
    return SAMPLE_DATA;
  }
  return JSON.parse(data);
};

export const saveItems = (items: Item[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const addItem = (item: Item): void => {
  const items = getItems();
  items.push(item);
  saveItems(items);
};

export const updateItem = (updatedItem: Item): void => {
  const items = getItems();
  const index = items.findIndex(i => i.id === updatedItem.id);
  if (index !== -1) {
    items[index] = updatedItem;
    saveItems(items);
  }
};

export const deleteItem = (id: string): void => {
  const items = getItems();
  const filtered = items.filter(i => i.id !== id);
  saveItems(filtered);
};

export const snoozeItem = (id: string, days: number): void => {
  const items = getItems();
  const index = items.findIndex(i => i.id === id);
  if (index !== -1) {
    const snoozeDate = new Date();
    snoozeDate.setDate(snoozeDate.getDate() + days);
    items[index].snoozedUntil = snoozeDate.toISOString();
    saveItems(items);
  }
};

export const getAppSettings = (): AppSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) {
    const defaultSettings: AppSettings = {
      notificationsEnabled: false,
      digestModeEnabled: false,
      affiliateLinkBase: 'https://www.amazon.in/s?k=',
      categoryStorePreferences: {}
    };
    saveAppSettings(defaultSettings);
    return defaultSettings;
  }
  return JSON.parse(data);
};

export const saveAppSettings = (settings: AppSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getReorderLink = (item: Item): string => {
  const settings = getAppSettings();
  const preferredStore = settings.categoryStorePreferences[item.category];
  const baseUrl = preferredStore || settings.affiliateLinkBase;
  return `${baseUrl}${encodeURIComponent(item.name)}`;
};

export const getExpiryStatus = (item: Item): ExpiryStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(item.expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const reminderDate = new Date(expiry);
  reminderDate.setDate(expiry.getDate() - item.reminderDays);

  if (today > expiry) return ExpiryStatus.Expired;
  if (today >= reminderDate && today <= expiry) return ExpiryStatus.Soon;
  return ExpiryStatus.Active;
};

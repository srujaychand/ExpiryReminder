
export const Category = {
  Grocery: 'Grocery',
  Medicine: 'Medicine',
  Cosmetics: 'Cosmetics',
  Electronics: 'Electronics',
  Others: 'Others'
} as const;

export type Category = typeof Category[keyof typeof Category];

export const ExpiryStatus = {
  Active: 'Active',
  Soon: 'Expiring Soon',
  Expired: 'Expired'
} as const;

export type ExpiryStatus = typeof ExpiryStatus[keyof typeof ExpiryStatus];

export interface Item {
  id: string;
  name: string;
  category: Category;
  expiryDate: string; // ISO format
  reminderDays: number;
  notes?: string;
  lastNotifiedStatus?: ExpiryStatus;
  snoozedUntil?: string; // ISO format
  createdAt: string;
}

export interface AppSettings {
  notificationsEnabled: boolean;
  digestModeEnabled: boolean;
  affiliateLinkBase: string;
  categoryStorePreferences: Record<string, string>;
}

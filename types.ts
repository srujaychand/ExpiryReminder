
export enum Category {
  Grocery = 'Grocery',
  Medicine = 'Medicine',
  Cosmetics = 'Cosmetics',
  Electronics = 'Electronics',
  Others = 'Others'
}

export enum ExpiryStatus {
  Active = 'Active',
  Soon = 'Expiring Soon',
  Expired = 'Expired'
}

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

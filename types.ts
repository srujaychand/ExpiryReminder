
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
  createdAt: string;
}

export interface AppSettings {
  notificationsEnabled: boolean;
  affiliateLinkBase: string;
}


import { getItems, getAppSettings, getExpiryStatus, updateItem } from './storageService.ts';
import { ExpiryStatus, Item } from '../types.ts';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

const shouldNotifyItem = (item: Item): boolean => {
  const now = new Date();
  // Check if snoozed
  if (item.snoozedUntil && new Date(item.snoozedUntil) > now) {
    return false;
  }
  
  const currentStatus = getExpiryStatus(item);
  // Notify if status has changed and it's something urgent
  return (currentStatus === ExpiryStatus.Soon || currentStatus === ExpiryStatus.Expired) &&
         item.lastNotifiedStatus !== currentStatus;
};

export const checkAndNotify = async () => {
  const settings = getAppSettings();
  if (!settings.notificationsEnabled) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const items = getItems();
  const itemsToNotify = items.filter(shouldNotifyItem);
  
  if (itemsToNotify.length === 0) return;

  let reg: ServiceWorkerRegistration | null = null;
  if ('serviceWorker' in navigator) {
    reg = await navigator.serviceWorker.getRegistration();
  }

  // Handle Digest Mode
  if (settings.digestModeEnabled && itemsToNotify.length > 0) {
    const title = 'Expiry Daily Digest 📋';
    const soonCount = itemsToNotify.filter(i => getExpiryStatus(i) === ExpiryStatus.Soon).length;
    const expiredCount = itemsToNotify.filter(i => getExpiryStatus(i) === ExpiryStatus.Expired).length;
    
    let body = '';
    if (soonCount > 0) body += `${soonCount} items expiring soon. `;
    if (expiredCount > 0) body += `${expiredCount} items expired.`;

    const options = {
      body,
      icon: 'https://picsum.photos/192/192',
      tag: 'expiry-digest',
      data: { url: '/#/items' }
    };

    if (reg) await reg.showNotification(title, options);
    else new Notification(title, options);

    // Update notified status for all items in digest
    itemsToNotify.forEach(item => {
      const updated = { ...item, lastNotifiedStatus: getExpiryStatus(item) };
      updateItem(updated);
    });
    return;
  }

  // Individual Notifications
  for (const item of itemsToNotify) {
    const status = getExpiryStatus(item);
    const title = status === ExpiryStatus.Soon ? 'Expiring Soon! ⏳' : 'Item Expired! 🚨';
    const body = `${item.name} is ${status.toLowerCase()}. Tap to manage.`;

    const options = {
      body,
      icon: 'https://picsum.photos/192/192',
      tag: `item-${item.id}`,
      data: { url: '/#/items' }
    };

    if (reg) await reg.showNotification(title, options);
    else new Notification(title, options);

    updateItem({ ...item, lastNotifiedStatus: status });
  }
};

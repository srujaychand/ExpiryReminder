import { getItems, getAppSettings, getExpiryStatus, updateItem } from './storageService.ts';
import { ExpiryStatus } from '../types.ts';

/**
 * Requests permission for browser notifications.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported in this browser.');
    return false;
  }
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

/**
 * Iterates through items and triggers notifications for new status changes (Expired or Soon).
 */
export const checkAndNotify = async () => {
  const settings = getAppSettings();
  if (!settings.notificationsEnabled) return;
  
  if (Notification.permission !== 'granted') {
    return;
  }

  const items = getItems();
  let reg: ServiceWorkerRegistration | null = null;
  
  if ('serviceWorker' in navigator) {
    reg = await navigator.serviceWorker.getRegistration();
  }

  for (const item of items) {
    const currentStatus = getExpiryStatus(item);
    
    // Only notify if status is not 'Active' and it's a new status change for this item
    if (item.lastNotifiedStatus !== currentStatus && currentStatus !== ExpiryStatus.Active) {
      const isSoon = currentStatus === ExpiryStatus.Soon;
      const title = isSoon ? 'Expiring Soon! ⏳' : 'Item Expired! 🚨';
      const body = isSoon 
        ? `${item.name} is expiring soon. Tap to view.` 
        : `${item.name} has expired. Tap to reorder.`;

      const options = {
        body,
        icon: 'https://picsum.photos/192/192',
        badge: 'https://picsum.photos/96/96',
        vibrate: isSoon ? [200, 100, 200] : [500, 100, 500],
        tag: `expiry-alert-${item.id}`,
        data: { url: '/#/items' },
        requireInteraction: true
      };

      try {
        if (reg && reg.showNotification) {
          await reg.showNotification(title, options);
        } else {
          new Notification(title, options);
        }
      } catch (e) {
        console.error('Failed to show notification', e);
      }

      // Persist the notified status so we don't spam the user
      item.lastNotifiedStatus = currentStatus;
      updateItem(item);
    }
  }
};
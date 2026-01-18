
import { getItems, getAppSettings, getExpiryStatus, updateItem } from './storageService';
import { ExpiryStatus } from '../types';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported in this browser.');
    return false;
  }
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const checkAndNotify = async () => {
  const settings = getAppSettings();
  if (!settings.notificationsEnabled) return;
  if (Notification.permission !== 'granted') return;

  const items = getItems();
  
  // Use Service Worker registration for more reliable mobile notifications
  const swReg = await navigator.serviceWorker.ready.catch(() => null);

  for (const item of items) {
    const currentStatus = getExpiryStatus(item);
    
    // Only notify if the status has changed to something urgent
    if (item.lastNotifiedStatus !== currentStatus) {
      if (currentStatus === ExpiryStatus.Soon) {
        const title = 'Expiring Soon! ⏳';
        const options = {
          body: `${item.name} is expiring soon. Tap to reorder.`,
          icon: 'https://picsum.photos/128/128',
          badge: 'https://picsum.photos/96/96',
          vibrate: [200, 100, 200],
          tag: `expiry-${item.id}`, // Prevents duplicate notifications for the same item
          data: { url: '/#/items' }
        };

        if (swReg) {
          swReg.showNotification(title, options);
        } else {
          new Notification(title, options);
        }

        item.lastNotifiedStatus = currentStatus;
        updateItem(item);
      } else if (currentStatus === ExpiryStatus.Expired) {
        const title = 'Item Expired! 🚨';
        const options = {
          body: `${item.name} has expired. Buy a fresh one now.`,
          icon: 'https://picsum.photos/128/128',
          badge: 'https://picsum.photos/96/96',
          vibrate: [500, 100, 500],
          tag: `expired-${item.id}`,
          data: { url: '/#/items' }
        };

        if (swReg) {
          swReg.showNotification(title, options);
        } else {
          new Notification(title, options);
        }

        item.lastNotifiedStatus = currentStatus;
        updateItem(item);
      }
    }
  }
};

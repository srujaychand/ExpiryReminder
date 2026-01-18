
import { getItems, getAppSettings, getExpiryStatus, updateItem } from './storageService.ts';
import { ExpiryStatus } from '../types.ts';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported in this browser.');
    return false;
  }
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const triggerManualNotification = async (title: string, body: string) => {
  const swReg = await navigator.serviceWorker.ready.catch(() => null);
  const options = {
    body,
    icon: 'https://picsum.photos/128/128',
    badge: 'https://picsum.photos/96/96',
    vibrate: [200, 100, 200],
    tag: 'test-notification',
  };

  if (swReg) {
    await swReg.showNotification(title, options);
  } else {
    new Notification(title, options);
  }
};

export const checkAndNotify = async () => {
  const settings = getAppSettings();
  if (!settings.notificationsEnabled) return;
  if (Notification.permission !== 'granted') return;

  const items = getItems();
  const swReg = await navigator.serviceWorker.ready.catch(() => null);

  for (const item of items) {
    const currentStatus = getExpiryStatus(item);
    
    // Only notify if status changed and it's not 'Active'
    if (item.lastNotifiedStatus !== currentStatus && currentStatus !== ExpiryStatus.Active) {
      const isSoon = currentStatus === ExpiryStatus.Soon;
      const title = isSoon ? 'Expiring Soon! ⏳' : 'Item Expired! 🚨';
      const body = isSoon 
        ? `${item.name} is expiring soon. Tap to reorder.` 
        : `${item.name} has expired. Buy a fresh one now.`;

      const options = {
        body,
        icon: 'https://picsum.photos/128/128',
        badge: 'https://picsum.photos/96/96',
        vibrate: isSoon ? [200, 100, 200] : [500, 100, 500],
        tag: `expiry-alert-${item.id}`,
        data: { url: '/#/items' }
      };

      if (swReg) {
        await swReg.showNotification(title, options);
      } else {
        new Notification(title, options);
      }

      // Record that we notified for this specific status
      item.lastNotifiedStatus = currentStatus;
      updateItem(item);
    }
  }
};

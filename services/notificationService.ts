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

export const getServiceWorkerStatus = async (): Promise<string> => {
  if (!('serviceWorker' in navigator)) return 'Not Supported';
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return 'Not Registered';
  if (reg.active) return 'Active & Ready';
  if (reg.installing) return 'Installing...';
  if (reg.waiting) return 'Waiting...';
  return 'Registered (Inactive)';
};

export const triggerManualNotification = async (title: string, body: string) => {
  if (!('Notification' in window)) {
    alert('Notifications not supported on this browser/OS version.');
    return;
  }

  // Fix: Removed explicit NotificationOptions type to avoid TS error on 'vibrate' property 
  // which may not be present in some NotificationOptions type definitions.
  const options = {
    body,
    icon: 'https://picsum.photos/192/192',
    badge: 'https://picsum.photos/96/96',
    vibrate: [200, 100, 200],
    tag: 'expiry-alert-test',
    requireInteraction: true, // Key for mobile visibility
  };

  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg && reg.showNotification) {
      // Preferred method for PWAs (works in background)
      await reg.showNotification(title, options);
    } else {
      // Fallback for foreground only
      new Notification(title, options);
    }
  } catch (e) {
    console.error('Notification error:', e);
    // Final fallback
    new Notification(title, options);
  }
};

export const checkAndNotify = async () => {
  const settings = getAppSettings();
  if (!settings.notificationsEnabled) return;
  if (Notification.permission !== 'granted') return;

  const items = getItems();
  const reg = await navigator.serviceWorker.getRegistration();

  for (const item of items) {
    const currentStatus = getExpiryStatus(item);
    
    if (item.lastNotifiedStatus !== currentStatus && currentStatus !== ExpiryStatus.Active) {
      const isSoon = currentStatus === ExpiryStatus.Soon;
      const title = isSoon ? 'Expiring Soon! ⏳' : 'Item Expired! 🚨';
      const body = isSoon 
        ? `${item.name} is expiring soon. Tap to reorder.` 
        : `${item.name} has expired. Buy a fresh one now.`;

      const options = {
        body,
        icon: 'https://picsum.photos/192/192',
        badge: 'https://picsum.photos/96/96',
        vibrate: isSoon ? [200, 100, 200] : [500, 100, 500],
        tag: `expiry-alert-${item.id}`,
        data: { url: '/#/items' }
      };

      if (reg && reg.showNotification) {
        reg.showNotification(title, options);
      } else {
        new Notification(title, options);
      }

      item.lastNotifiedStatus = currentStatus;
      updateItem(item);
    }
  }
};
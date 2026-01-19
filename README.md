# ExpiryReminder PWA

A production-quality Progressive Web Application (PWA) designed for mobile-first tracking of product expiries. It features automated status monitoring, local-first data persistence, and an affiliate-backed reorder system.

## 🚀 Features

- **Inventory Tracking**: Manage groceries, medicines, electronics, and more with smart expiry categorisation.
- **Expiry Intelligence**: Automatically flags items as "Active", "Expiring Soon", or "Expired" based on customizable alert windows.
- **PWA Capabilities**: Full offline support via Service Workers, installable on mobile home screens, and native-like navigation.
- **Privacy First**: All user data is stored locally on the device (LocalStorage). No cloud sync by default.
- **Reorder System**: Deep integration with affiliate APIs to suggest reorder links, with a transparent disclosure flow.
- **Smart Notifications**: Support for individual alerts and a "Digest Mode" for daily summaries.
- **Data Portability**: Built-in JSON export/import for manual backups and data control.

## 🛠 Tech Stack

- **Framework**: React 19 (ES Modules via esm.sh)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Persistence**: Browser LocalStorage
- **Deployment**: PWA (Service Worker + Web Manifest)

## 📂 File Structure Summary

### Core Entry & Configuration
- `index.html`: Main entry point with Tailwind CDN and Import Maps.
- `index.tsx`: React mounting and PWA Service Worker registration.
- `App.tsx`: Main view controller and notification initialization.
- `types.ts`: Centralized TypeScript definitions for Items, Settings, and Enums.
- `constants.tsx`: UI constants, SVG icons, and store configuration.
- `metadata.json`: Application metadata and permissions.
- `manifest.json`: Web App Manifest for PWA installation.

### Services (Logic Layer)
- `services/storageService.ts`: Handles all LocalStorage CRUD operations and business logic for expiry statuses.
- `services/notificationService.ts`: Manages browser Notification API requests and alert scheduling logic.
- `services/affiliateService.ts`: Asynchronous logic for fetching affiliate links with caching and fallback search link generation.

### Views (UI Layer)
- `views/Dashboard.tsx`: High-level summary of inventory health and urgent action items.
- `views/Inventory.tsx`: Filterable/Searchable list of all items with reorder triggers.
- `views/AddEditItem.tsx`: Comprehensive form for managing item metadata.
- `views/SettingsView.tsx`: User preferences, notification toggles, and data import/export tools.
- `views/AffiliateDisclosure.tsx`: Transparency section explaining data privacy and the affiliate model.

### Components & Infrastructure
- `components/Layout.tsx`: The primary shell including the header, bottom navigation, and offline status banner.
- `components/StatusBadge.tsx`: Reusable status indicator with dynamic color mapping.
- `sw.js`: Service worker implementation for offline asset caching and notification handling.

## 🔒 Privacy & Transparency
The application adheres to a "Local-Only" data principle. Sensitive item data is never sent to a server unless explicitly triggered by an external API request (like link generation), where only the minimum necessary non-PII information is used.
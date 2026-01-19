import { AFFILIATE_API_URL, AFFILIATE_CACHE_DURATION_MS } from '../constants.tsx';
import { getReorderLink } from './storageService.ts';
import { Item } from '../types.ts';

const CACHE_KEY_PREFIX = 'affiliate_cache_';

interface CachedAffiliate {
  affiliate_url: string;
  store: string;
  cachedAt: number;
}

export interface AffiliateResult {
  url: string;
  isAffiliate: boolean;
}

export const getAffiliateLinkAsync = async (item: Item): Promise<AffiliateResult> => {
  const cacheKey = `${CACHE_KEY_PREFIX}${item.name}|${item.category}`;
  const now = Date.now();

  // 1. Check Cache
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    try {
      const parsed: CachedAffiliate = JSON.parse(cachedData);
      if (now - parsed.cachedAt < AFFILIATE_CACHE_DURATION_MS) {
        return { url: parsed.affiliate_url, isAffiliate: true };
      }
    } catch (e) {
      console.warn('Failed to parse cached affiliate link', e);
    }
  }

  // 2. Call API
  try {
    const response = await fetch(AFFILIATE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_name: item.name,
        category: item.category
      })
    });

    if (response.ok) {
      const data = await response.json();
      const affiliateUrl = data.affiliate_url;

      // 3. Update Cache
      if (affiliateUrl) {
        localStorage.setItem(cacheKey, JSON.stringify({
          affiliate_url: affiliateUrl,
          store: data.store || 'Partner',
          cachedAt: now
        }));
        return { url: affiliateUrl, isAffiliate: true };
      }
    }
  } catch (error) {
    console.error('Affiliate API Error, falling back to direct link:', error);
  }

  // 4. Fallback to direct search link (Not an affiliate link)
  return { url: getReorderLink(item), isAffiliate: false };
};

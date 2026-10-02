/**
 * Jangkhng 3D NeoTab - Storage Module
 * High-performance hybrid storage:
 * - chrome.storage.local / localStorage for configurations & shortcuts
 * - IndexedDB for high-resolution wallpaper images (Blobs) with zero memory lag
 */

const StorageModule = (function () {
  const DB_NAME = 'JangkhngWallpapersDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'wallpapers';

  // Default configuration
  const DEFAULT_SETTINGS = {
    wallpaperMode: 'online_auto', // 'online_auto' | 'online_curated' | 'local_slideshow' | 'local_single' | 'gradient_3d'
    onlineCategory: 'cyberpunk', // 'cyberpunk' | 'space' | 'nature' | 'abstract' | 'minimal' | 'anime' | 'city'
    autoRotateInterval: 60000, // 60s default (ms), or 0 for every new tab
    wallpaperBlur: 0, // px
    wallpaperBrightness: 90, // %
    gradientPreset: 'cosmic_nebula',
    selectedLocalImageId: null,

    // Bookmarks settings
    bookmarkPosition: 'top', // 'top' | 'bottom' | 'left' | 'right' | 'center_dock' | 'hidden'
    bookmarkStyle: 'icon_text', // 'icon_only' | 'icon_text' | 'compact'
    bookmarkShowFavoritesOnly: false,

    // Shortcuts settings
    shortcutStyle: 'glass_3d', // 'glass_3d' | 'neon_glow' | 'minimal'
    shortcutColumns: 5, // 4, 5, 6, 8
    enable3DTilt: true,

    // Search settings
    defaultEngine: 'google', // 'google' | 'bing' | 'duckduckgo' | 'youtube' | 'github' | 'wikipedia' | 'perplexity'
    searchGlowEffect: true,
    openInNewTab: false,

    // 3D & Performance
    enableParticles: true,
    performanceMode: false, // Disables heavy blur/shadows on low-end hardware

    // Clock & Personalization
    timeFormat: '12h', // '12h' | '24h'
    showSeconds: true,
    showDate: true,
    userName: 'Barman IT',
    userEmail: 'businesskumarjangkhng@gmail.com',
    userAvatarUrl: 'assets/user_avatar.png',
    showGreeting: true,

    // Custom shortcuts list (defaults)
    shortcuts: [
      { id: '1', title: 'Google', url: 'https://www.google.com', icon: 'https://www.google.com/favicon.ico' },
      { id: '2', title: 'YouTube', url: 'https://www.youtube.com', icon: 'https://www.youtube.com/favicon.ico' },
      { id: '3', title: 'GitHub', url: 'https://github.com', icon: 'https://github.githubassets.com/favicons/favicon.png' },
      { id: '4', title: 'ChatGPT', url: 'https://chatgpt.com', icon: 'https://chatgpt.com/favicon.ico' },
      { id: '5', title: 'Twitter / X', url: 'https://x.com', icon: 'https://abs.twimg.com/favicons/twitter.3.ico' },
      { id: '6', title: 'Reddit', url: 'https://www.reddit.com', icon: 'https://www.redditstatic.com/shreddit/assets/favicon/192x192.png' },
      { id: '7', title: 'Gmail', url: 'https://mail.google.com', icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico' },
      { id: '8', title: 'Netflix', url: 'https://www.netflix.com', icon: 'https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico' },
      { id: '9', title: 'Spotify', url: 'https://open.spotify.com', icon: 'https://open.spotifycdn.com/cdn/images/favicon.0f31d2ea.ico' },
      { id: '10', title: 'Wikipedia', url: 'https://en.wikipedia.org', icon: 'https://en.wikipedia.org/favicon.ico' }
    ]
  };

  // Check if Chrome extension storage is available
  const isChromeStorage = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

  /**
   * IndexedDB setup for wallpaper images
   */
  let dbPromise = null;

  function getDB() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
      });
    }
    return dbPromise;
  }

  // --- IndexedDB Operations ---

  async function saveWallpaperImage(file) {
    const db = await getDB();
    const id = 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const item = {
      id: id,
      name: file.name,
      type: file.type,
      size: file.size,
      blob: file,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.add(item);
      req.onsuccess = () => resolve(item);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async function getAllWallpaperImages() {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async function getWallpaperImageById(id) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async function deleteWallpaperImage(id) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async function clearAllWallpaperImages() {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  // --- Settings & Configuration Operations ---

  async function getSettings() {
    return new Promise((resolve) => {
      if (isChromeStorage) {
        chrome.storage.local.get(['jangkhng_settings'], (result) => {
          if (result && result.jangkhng_settings) {
            resolve({ ...DEFAULT_SETTINGS, ...result.jangkhng_settings });
          } else {
            resolve({ ...DEFAULT_SETTINGS });
          }
        });
      } else {
        try {
          const raw = localStorage.getItem('jangkhng_settings');
          if (raw) {
            resolve({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
          } else {
            resolve({ ...DEFAULT_SETTINGS });
          }
        } catch (e) {
          resolve({ ...DEFAULT_SETTINGS });
        }
      }
    });
  }

  async function saveSettings(newSettings) {
    return new Promise((resolve) => {
      if (isChromeStorage) {
        chrome.storage.local.set({ jangkhng_settings: newSettings }, () => {
          resolve(newSettings);
        });
      } else {
        localStorage.setItem('jangkhng_settings', JSON.stringify(newSettings));
        resolve(newSettings);
      }
    });
  }

  async function updateSetting(key, value) {
    const current = await getSettings();
    current[key] = value;
    await saveSettings(current);
    return current;
  }

  return {
    DEFAULT_SETTINGS,
    getSettings,
    saveSettings,
    updateSetting,
    saveWallpaperImage,
    getAllWallpaperImages,
    getWallpaperImageById,
    deleteWallpaperImage,
    clearAllWallpaperImages
  };
})();

// Export globally for browser scripts
window.StorageModule = StorageModule;

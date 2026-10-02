/**
 * Jangkhng 3D NeoTab - Wallpaper & Background Engine
 * Features:
 * - Online auto dynamic wallpapers (Curated, Unsplash categories, 4K)
 * - Multi-image local slideshow with IndexedDB storage
 * - Single local image selection
 * - 3D dynamic mesh gradient engine (0ms offline load)
 * - Double-buffered 3D crossfade (zero flicker, zero lag)
 * - Configurable auto-rotation interval & manual next/prev controls
 */

const WallpaperEngine = (function () {
  // Curated online collections categorized by style
  const ONLINE_COLLECTIONS = {
    cyberpunk: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1920&q=80'
    ],
    space: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1920&q=80'
    ],
    nature: [
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1920&q=80'
    ],
    abstract: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&w=1920&q=80'
    ],
    minimal: [
      'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1920&q=80'
    ],
    anime: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1920&q=80'
    ],
    city: [
      'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1920&q=80'
    ]
  };

  // 3D dynamic CSS gradient presets for instantaneous load / offline mode
  const GRADIENT_PRESETS = {
    cosmic_nebula: 'radial-gradient(ellipse at 20% 20%, #7928ca 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, #ff0080 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, #0070f3 0%, #060919 100%)',
    cyber_matrix: 'radial-gradient(circle at 10% 20%, rgba(0, 255, 170, 0.4) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(0, 180, 255, 0.5) 0%, transparent 40%), radial-gradient(circle at 50% 50%, #030a16 0%, #02050b 100%)',
    sunset_aurora: 'radial-gradient(circle at 70% 30%, #ff4b1f 0%, transparent 50%), radial-gradient(circle at 20% 80%, #ff9068 0%, transparent 50%), radial-gradient(circle at 50% 50%, #1a0826 0%, #09020e 100%)',
    deep_ocean: 'radial-gradient(circle at 30% 20%, #00c6ff 0%, transparent 50%), radial-gradient(circle at 80% 70%, #0072ff 0%, transparent 50%), radial-gradient(circle at 50% 50%, #021024 0%, #010409 100%)',
    neon_violet: 'radial-gradient(circle at 25% 25%, #da22ff 0%, transparent 50%), radial-gradient(circle at 75% 75%, #9733ee 0%, transparent 50%), radial-gradient(circle at 50% 50%, #15002b 0%, #070010 100%)'
  };

  let bgLayerA = null;
  let bgLayerB = null;
  let activeLayer = 'A';
  let rotationTimer = null;
  let currentSettings = null;
  let localImagesCache = [];
  let currentOnlineIndex = 0;
  let currentLocalIndex = 0;
  let currentObjectUrl = null;

  async function init(settings) {
    currentSettings = settings;
    bgLayerA = document.getElementById('bg-layer-a');
    bgLayerB = document.getElementById('bg-layer-b');

    // Instant paint from local cache so there is 0ms delay and never a black void
    try {
      const cachedUrl = localStorage.getItem('jangkhng_last_wp_url');
      if (cachedUrl && bgLayerA) {
        bgLayerA.style.backgroundImage = `url("${cachedUrl}")`;
        bgLayerA.style.opacity = '1';
      }
    } catch (e) {}

    // Load local images cache
    await refreshLocalImagesCache();

    // Apply adjustments (blur, brightness)
    applyAdjustments();

    // Display initial wallpaper
    await loadInitialWallpaper();

    // Start auto-rotation if interval > 0
    setupAutoRotation();
  }

  async function refreshLocalImagesCache() {
    try {
      localImagesCache = await StorageModule.getAllWallpaperImages();
    } catch (e) {
      console.warn('Failed to load local images from IndexedDB:', e);
      localImagesCache = [];
    }
  }

  function applyAdjustments() {
    const blur = currentSettings.wallpaperBlur || 0;
    const brightness = (currentSettings.wallpaperBrightness !== undefined) ? currentSettings.wallpaperBrightness : 90;
    const filterValue = `blur(${blur}px) brightness(${brightness}%)`;

    if (bgLayerA) bgLayerA.style.filter = filterValue;
    if (bgLayerB) bgLayerB.style.filter = filterValue;
  }

  async function loadInitialWallpaper() {
    switch (currentSettings.wallpaperMode) {
      case 'online_auto':
      case 'online_curated':
        await showNextOnlineWallpaper(true);
        break;
      case 'local_slideshow':
        if (localImagesCache.length > 0) {
          await showNextLocalWallpaper(true);
        } else {
          // Fallback to online auto if no local images uploaded yet
          await showNextOnlineWallpaper(true);
        }
        break;
      case 'local_single':
        if (currentSettings.selectedLocalImageId) {
          const imgItem = await StorageModule.getWallpaperImageById(currentSettings.selectedLocalImageId);
          if (imgItem && imgItem.blob) {
            setLayerImage(imgItem.blob);
          } else {
            await showNextOnlineWallpaper(true);
          }
        } else if (localImagesCache.length > 0) {
          setLayerImage(localImagesCache[0].blob);
        } else {
          await showNextOnlineWallpaper(true);
        }
        break;
      case 'gradient_3d':
        showGradientWallpaper(currentSettings.gradientPreset || 'cosmic_nebula');
        break;
      default:
        await showNextOnlineWallpaper(true);
    }
  }

  function setupAutoRotation() {
    if (rotationTimer) {
      clearInterval(rotationTimer);
      rotationTimer = null;
    }

    const interval = parseInt(currentSettings.autoRotateInterval, 10);
    // 0 means only on new tab
    if (interval && interval >= 10000) {
      rotationTimer = setInterval(async () => {
        await triggerNextWallpaper();
      }, interval);
    }
  }

  async function triggerNextWallpaper() {
    if (currentSettings.wallpaperMode === 'local_slideshow') {
      await showNextLocalWallpaper(false);
    } else if (currentSettings.wallpaperMode === 'online_auto' || currentSettings.wallpaperMode === 'online_curated') {
      await showNextOnlineWallpaper(false);
    }
  }

  async function showNextOnlineWallpaper(isInitial = false) {
    const category = currentSettings.onlineCategory || 'cyberpunk';
    const list = ONLINE_COLLECTIONS[category] || ONLINE_COLLECTIONS.cyberpunk;

    currentOnlineIndex = (currentOnlineIndex + 1) % list.length;
    const baseUri = list[currentOnlineIndex];
    // Add cache buster only if dynamic rotation
    const url = isInitial ? baseUri : `${baseUri}&sig=${Date.now()}`;

    // Preload image before crossfade to guarantee 0 flicker
    await preloadAndCrossfade(url);
  }

  async function showNextLocalWallpaper(isInitial = false) {
    if (localImagesCache.length === 0) {
      await refreshLocalImagesCache();
    }

    if (localImagesCache.length === 0) {
      // Fallback
      await showNextOnlineWallpaper(isInitial);
      return;
    }

    currentLocalIndex = (currentLocalIndex + 1) % localImagesCache.length;
    const imgItem = localImagesCache[currentLocalIndex];
    if (imgItem && imgItem.blob) {
      setLayerImage(imgItem.blob);
    }
  }

  function showGradientWallpaper(presetKey) {
    const gradient = GRADIENT_PRESETS[presetKey] || GRADIENT_PRESETS.cosmic_nebula;
    const targetLayer = activeLayer === 'A' ? bgLayerB : bgLayerA;
    const currentLayer = activeLayer === 'A' ? bgLayerA : bgLayerB;

    targetLayer.style.backgroundImage = gradient;
    targetLayer.style.backgroundSize = 'cover';
    targetLayer.style.opacity = '1';
    currentLayer.style.opacity = '0';
    activeLayer = activeLayer === 'A' ? 'B' : 'A';
  }

  function preloadAndCrossfade(url) {
    return new Promise((resolve) => {
      let isSettled = false;
      const img = new Image();

      const finishSuccess = () => {
        if (isSettled) return;
        isSettled = true;
        const targetLayer = activeLayer === 'A' ? bgLayerB : bgLayerA;
        const currentLayer = activeLayer === 'A' ? bgLayerA : bgLayerB;

        targetLayer.style.backgroundImage = `url("${url}")`;
        targetLayer.style.backgroundSize = 'cover';
        targetLayer.style.backgroundPosition = 'center';
        targetLayer.style.opacity = '1';
        currentLayer.style.opacity = '0';

        activeLayer = activeLayer === 'A' ? 'B' : 'A';
        try {
          if (!url.startsWith('blob:')) {
            localStorage.setItem('jangkhng_last_wp_url', url);
          }
        } catch (e) {}
        resolve();
      };

      const finishError = () => {
        if (isSettled) return;
        isSettled = true;
        showGradientWallpaper('cosmic_nebula');
        resolve();
      };

      img.onload = finishSuccess;
      img.onerror = finishError;
      setTimeout(finishError, 4000); // 4-second timeout protection
      img.src = url;
    });
  }

  function setLayerImage(blob) {
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
    }
    currentObjectUrl = URL.createObjectURL(blob);
    preloadAndCrossfade(currentObjectUrl);
  }

  // API exposed for settings UI & controls
  return {
    init,
    ONLINE_COLLECTIONS,
    GRADIENT_PRESETS,
    refreshLocalImagesCache,
    triggerNextWallpaper,
    applyAdjustments,
    setupAutoRotation,
    updateSettings: async (newSettings) => {
      currentSettings = newSettings;
      applyAdjustments();
      setupAutoRotation();
      await loadInitialWallpaper();
    },
    setDirectLocalImage: (blob) => {
      setLayerImage(blob);
    }
  };
})();

window.WallpaperEngine = WallpaperEngine;

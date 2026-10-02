/**
 * Jangkhng 3D NeoTab - Main Application Controller
 * Boots all modules swiftly without blocking the main render loop.
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Fetch initial configuration
    const settings = await StorageModule.getSettings();

    // 2. Set performance mode class immediately to avoid layout thrashing
    if (settings.performanceMode) {
      document.body.classList.add('performance-mode');
    }

    // 3. Initialize Wallpaper Background Engine
    await WallpaperEngine.init(settings);

    // 4. Initialize Clock & Greeting
    ClockModule.init(settings);

    // 5. Initialize Dynamic 3D Search Bar
    SearchModule.init(settings);

    // 6. Initialize 3D Stylish Shortcuts Grid
    await ShortcutsModule.init(settings);

    // 7. Initialize Bookmarks Bar with user's customized position
    await BookmarksModule.init(settings);

    // 8. Initialize 3D Ambient Particles Engine
    ParticlesEngine.init(settings.enableParticles, settings.performanceMode);

    // 9. Initialize Settings Modal & Drawer
    SettingsModal.init(settings);

    // 10. Initialize Google Apps & Profile Account Menu
    await GoogleMenuModule.init(settings);

    // 11. Wire up on-screen quick action buttons & Spacebar shortcut
    const nextWpBtn = document.getElementById('quick-next-wp-btn');
    const triggerShuffle = async () => {
      if (nextWpBtn) nextWpBtn.classList.add('spin-anim');
      await WallpaperEngine.triggerNextWallpaper();
      setTimeout(() => { if (nextWpBtn) nextWpBtn.classList.remove('spin-anim'); }, 600);
    };

    if (nextWpBtn) {
      nextWpBtn.addEventListener('click', triggerShuffle);
    }

    // Spacebar shuffles wallpaper when not typing
    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInput = activeTag === 'input' || activeTag === 'textarea';
      const settingsModal = document.getElementById('settings-modal');
      const isModalOpen = settingsModal && settingsModal.classList.contains('active');

      if (e.code === 'Space' && !isInput && !isModalOpen) {
        e.preventDefault();
        triggerShuffle();
      }
    });

    console.log('⚡ Jangkhng 3D NeoTab loaded smoothly in record time.');
  } catch (error) {
    console.error('Initialization error in Jangkhng NeoTab:', error);
  }
});

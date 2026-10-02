/**
 * Jangkhng 3D NeoTab - Complete 3D Settings Menu & Customizer
 * Features:
 * - Multi-tab sliding glass modal drawer
 * - Complete control over wallpapers, online auto rotation, local multi-upload slideshow
 * - Bookmark placement customizer (Top, Bottom, Left, Right, Center, Hidden)
 * - Shortcuts style and grid configuration
 * - Search bar preferences
 * - 3D & Performance settings
 * - Clock personalization
 * - Backup export / import & reset to factory defaults
 */

const SettingsModal = (function () {
  let modalEl = null;
  let currentSettings = null;

  function init(settings) {
    currentSettings = settings;
    modalEl = document.getElementById('settings-modal');

    setupOpenClose();
    setupTabs();
    populateFormValues();
    setupEventListeners();
  }

  function setupOpenClose() {
    const openBtn = document.getElementById('settings-toggle-btn');
    const closeBtn = document.getElementById('settings-modal-close');

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        openModal();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        closeModal();
      });
    }

    if (modalEl) {
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) {
          closeModal();
        }
      });
    }

    // Keyboard shortcut Escape or comma (',') opens/closes settings
    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInput = activeTag === 'input' || activeTag === 'textarea';

      if (e.key === 'Escape' && modalEl && modalEl.classList.contains('active')) {
        closeModal();
      } else if (e.key === ',' && !isInput && modalEl && !modalEl.classList.contains('active')) {
        openModal();
      }
    });
  }

  function openModal() {
    if (!modalEl) return;
    refreshLocalGallery();
    modalEl.classList.add('active');
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove('active');
  }

  function setupTabs() {
    const tabBtns = modalEl.querySelectorAll('.settings-tab-btn');
    const tabPanels = modalEl.querySelectorAll('.settings-tab-panel');

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        tabBtns.forEach(b => b.classList.toggle('active', b === btn));
        tabPanels.forEach(p => p.classList.toggle('active', p.getAttribute('data-tab-content') === targetTab));
      });
    });
  }

  function populateFormValues() {
    // Wallpaper mode
    const wpModeSelect = document.getElementById('setting-wp-mode');
    if (wpModeSelect) wpModeSelect.value = currentSettings.wallpaperMode;

    const wpCategorySelect = document.getElementById('setting-wp-category');
    if (wpCategorySelect) wpCategorySelect.value = currentSettings.onlineCategory;

    const wpIntervalSelect = document.getElementById('setting-wp-interval');
    if (wpIntervalSelect) wpIntervalSelect.value = currentSettings.autoRotateInterval;

    const wpBlurInput = document.getElementById('setting-wp-blur');
    const wpBlurVal = document.getElementById('setting-wp-blur-val');
    if (wpBlurInput) {
      wpBlurInput.value = currentSettings.wallpaperBlur || 0;
      if (wpBlurVal) wpBlurVal.textContent = `${wpBlurInput.value}px`;
    }

    const wpBrightInput = document.getElementById('setting-wp-brightness');
    const wpBrightVal = document.getElementById('setting-wp-brightness-val');
    if (wpBrightInput) {
      wpBrightInput.value = currentSettings.wallpaperBrightness !== undefined ? currentSettings.wallpaperBrightness : 90;
      if (wpBrightVal) wpBrightVal.textContent = `${wpBrightInput.value}%`;
    }

    // Bookmarks
    const bmPosSelect = document.getElementById('setting-bm-position');
    if (bmPosSelect) bmPosSelect.value = currentSettings.bookmarkPosition;

    const bmStyleSelect = document.getElementById('setting-bm-style');
    if (bmStyleSelect) bmStyleSelect.value = currentSettings.bookmarkStyle;

    // Shortcuts
    const scStyleSelect = document.getElementById('setting-sc-style');
    if (scStyleSelect) scStyleSelect.value = currentSettings.shortcutStyle;

    const scColsSelect = document.getElementById('setting-sc-columns');
    if (scColsSelect) scColsSelect.value = currentSettings.shortcutColumns;

    const scTiltCheck = document.getElementById('setting-sc-tilt');
    if (scTiltCheck) scTiltCheck.checked = currentSettings.enable3DTilt;

    // Search
    const searchEngineSelect = document.getElementById('setting-search-engine');
    if (searchEngineSelect) searchEngineSelect.value = currentSettings.defaultEngine;

    const searchNewTabCheck = document.getElementById('setting-search-newtab');
    if (searchNewTabCheck) searchNewTabCheck.checked = currentSettings.openInNewTab;

    // 3D & Performance
    const partCheck = document.getElementById('setting-enable-particles');
    if (partCheck) partCheck.checked = currentSettings.enableParticles;

    const perfCheck = document.getElementById('setting-performance-mode');
    if (perfCheck) perfCheck.checked = currentSettings.performanceMode;

    // Clock
    const timeFormatSelect = document.getElementById('setting-clock-format');
    if (timeFormatSelect) timeFormatSelect.value = currentSettings.timeFormat;

    const showSecCheck = document.getElementById('setting-show-seconds');
    if (showSecCheck) showSecCheck.checked = currentSettings.showSeconds;

    const showDateCheck = document.getElementById('setting-show-date');
    if (showDateCheck) showDateCheck.checked = currentSettings.showDate;

    const userNameInput = document.getElementById('setting-user-name');
    if (userNameInput) userNameInput.value = currentSettings.userName || 'Explorer';

    toggleConditionalWallpaperPanels();
  }

  function toggleConditionalWallpaperPanels() {
    const mode = currentSettings.wallpaperMode;
    const onlinePanel = document.getElementById('wp-online-options');
    const localPanel = document.getElementById('wp-local-options');
    const gradientPanel = document.getElementById('wp-gradient-options');

    if (onlinePanel) onlinePanel.style.display = (mode === 'online_auto' || mode === 'online_curated') ? 'block' : 'none';
    if (localPanel) localPanel.style.display = (mode === 'local_slideshow' || mode === 'local_single') ? 'block' : 'none';
    if (gradientPanel) gradientPanel.style.display = (mode === 'gradient_3d') ? 'block' : 'none';
  }

  function setupEventListeners() {
    // Wallpaper Mode Change
    const wpModeSelect = document.getElementById('setting-wp-mode');
    if (wpModeSelect) {
      wpModeSelect.addEventListener('change', async (e) => {
        currentSettings.wallpaperMode = e.target.value;
        toggleConditionalWallpaperPanels();
        await StorageModule.saveSettings(currentSettings);
        WallpaperEngine.updateSettings(currentSettings);
      });
    }

    // Online Category
    const wpCategorySelect = document.getElementById('setting-wp-category');
    if (wpCategorySelect) {
      wpCategorySelect.addEventListener('change', async (e) => {
        currentSettings.onlineCategory = e.target.value;
        await StorageModule.saveSettings(currentSettings);
        WallpaperEngine.updateSettings(currentSettings);
      });
    }

    // Auto rotate interval
    const wpIntervalSelect = document.getElementById('setting-wp-interval');
    if (wpIntervalSelect) {
      wpIntervalSelect.addEventListener('change', async (e) => {
        currentSettings.autoRotateInterval = parseInt(e.target.value, 10);
        await StorageModule.saveSettings(currentSettings);
        WallpaperEngine.updateSettings(currentSettings);
      });
    }

    // Sliders: Blur & Brightness
    const wpBlurInput = document.getElementById('setting-wp-blur');
    const wpBlurVal = document.getElementById('setting-wp-blur-val');
    if (wpBlurInput) {
      wpBlurInput.addEventListener('input', (e) => {
        currentSettings.wallpaperBlur = parseInt(e.target.value, 10);
        if (wpBlurVal) wpBlurVal.textContent = `${e.target.value}px`;
        WallpaperEngine.applyAdjustments();
      });
      wpBlurInput.addEventListener('change', async () => {
        await StorageModule.saveSettings(currentSettings);
      });
    }

    const wpBrightInput = document.getElementById('setting-wp-brightness');
    const wpBrightVal = document.getElementById('setting-wp-brightness-val');
    if (wpBrightInput) {
      wpBrightInput.addEventListener('input', (e) => {
        currentSettings.wallpaperBrightness = parseInt(e.target.value, 10);
        if (wpBrightVal) wpBrightVal.textContent = `${e.target.value}%`;
        WallpaperEngine.applyAdjustments();
      });
      wpBrightInput.addEventListener('change', async () => {
        await StorageModule.saveSettings(currentSettings);
      });
    }

    // Local Multi-Image Upload Dropzone & File Input
    const dropzone = document.getElementById('local-wp-dropzone');
    const fileInput = document.getElementById('local-wp-file-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-active');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('drag-active');
      });

      dropzone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-active');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          await handleFilesUpload(e.dataTransfer.files);
        }
      });

      fileInput.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files.length > 0) {
          await handleFilesUpload(e.target.files);
          fileInput.value = '';
        }
      });
    }

    // Clear all uploaded local images button
    const clearAllBtn = document.getElementById('clear-all-local-images-btn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', async () => {
        if (confirm('Delete all uploaded local wallpapers?')) {
          await StorageModule.clearAllWallpaperImages();
          await refreshLocalGallery();
          await WallpaperEngine.refreshLocalImagesCache();
          await WallpaperEngine.updateSettings(currentSettings);
        }
      });
    }

    // Bookmarks Position
    const bmPosSelect = document.getElementById('setting-bm-position');
    if (bmPosSelect) {
      bmPosSelect.addEventListener('change', async (e) => {
        currentSettings.bookmarkPosition = e.target.value;
        await StorageModule.saveSettings(currentSettings);
        BookmarksModule.updatePosition(e.target.value);
      });
    }

    // Bookmarks Style
    const bmStyleSelect = document.getElementById('setting-bm-style');
    if (bmStyleSelect) {
      bmStyleSelect.addEventListener('change', async (e) => {
        currentSettings.bookmarkStyle = e.target.value;
        await StorageModule.saveSettings(currentSettings);
        BookmarksModule.updateStyle(e.target.value);
      });
    }

    // Shortcuts Style
    const scStyleSelect = document.getElementById('setting-sc-style');
    if (scStyleSelect) {
      scStyleSelect.addEventListener('change', async (e) => {
        currentSettings.shortcutStyle = e.target.value;
        await StorageModule.saveSettings(currentSettings);
        ShortcutsModule.updateStyle(e.target.value);
      });
    }

    // Shortcuts Columns
    const scColsSelect = document.getElementById('setting-sc-columns');
    if (scColsSelect) {
      scColsSelect.addEventListener('change', async (e) => {
        currentSettings.shortcutColumns = parseInt(e.target.value, 10);
        await StorageModule.saveSettings(currentSettings);
        ShortcutsModule.updateColumns(currentSettings.shortcutColumns);
      });
    }

    // Shortcuts 3D Tilt
    const scTiltCheck = document.getElementById('setting-sc-tilt');
    if (scTiltCheck) {
      scTiltCheck.addEventListener('change', async (e) => {
        currentSettings.enable3DTilt = e.target.checked;
        await StorageModule.saveSettings(currentSettings);
        ShortcutsModule.updateTilt(e.target.checked);
      });
    }

    // Search Engine
    const searchEngineSelect = document.getElementById('setting-search-engine');
    if (searchEngineSelect) {
      searchEngineSelect.addEventListener('change', async (e) => {
        currentSettings.defaultEngine = e.target.value;
        await StorageModule.saveSettings(currentSettings);
        SearchModule.selectEngine(e.target.value);
      });
    }

    // Search Open in New Tab
    const searchNewTabCheck = document.getElementById('setting-search-newtab');
    if (searchNewTabCheck) {
      searchNewTabCheck.addEventListener('change', async (e) => {
        currentSettings.openInNewTab = e.target.checked;
        await StorageModule.saveSettings(currentSettings);
      });
    }

    // 3D Particles Toggle
    const partCheck = document.getElementById('setting-enable-particles');
    if (partCheck) {
      partCheck.addEventListener('change', async (e) => {
        currentSettings.enableParticles = e.target.checked;
        await StorageModule.saveSettings(currentSettings);
        ParticlesEngine.toggle(e.target.checked, currentSettings.performanceMode);
      });
    }

    // Ultra-Performance Mode Toggle
    const perfCheck = document.getElementById('setting-performance-mode');
    if (perfCheck) {
      perfCheck.addEventListener('change', async (e) => {
        currentSettings.performanceMode = e.target.checked;
        document.body.classList.toggle('performance-mode', e.target.checked);
        await StorageModule.saveSettings(currentSettings);
        ParticlesEngine.toggle(currentSettings.enableParticles, e.target.checked);
        ShortcutsModule.render();
      });
    }

    // Clock format & date
    const timeFormatSelect = document.getElementById('setting-clock-format');
    if (timeFormatSelect) {
      timeFormatSelect.addEventListener('change', async (e) => {
        currentSettings.timeFormat = e.target.value;
        await StorageModule.saveSettings(currentSettings);
        if (window.ClockModule) window.ClockModule.updateSettings(currentSettings);
      });
    }

    const showSecCheck = document.getElementById('setting-show-seconds');
    if (showSecCheck) {
      showSecCheck.addEventListener('change', async (e) => {
        currentSettings.showSeconds = e.target.checked;
        await StorageModule.saveSettings(currentSettings);
        if (window.ClockModule) window.ClockModule.updateSettings(currentSettings);
      });
    }

    const showDateCheck = document.getElementById('setting-show-date');
    if (showDateCheck) {
      showDateCheck.addEventListener('change', async (e) => {
        currentSettings.showDate = e.target.checked;
        await StorageModule.saveSettings(currentSettings);
        if (window.ClockModule) window.ClockModule.updateSettings(currentSettings);
      });
    }

    const userNameInput = document.getElementById('setting-user-name');
    if (userNameInput) {
      userNameInput.addEventListener('input', async (e) => {
        currentSettings.userName = e.target.value.trim() || 'Explorer';
        if (window.ClockModule) window.ClockModule.updateSettings(currentSettings);
      });
      userNameInput.addEventListener('change', async () => {
        await StorageModule.saveSettings(currentSettings);
      });
    }

    // Export Settings
    const exportBtn = document.getElementById('backup-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentSettings, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute('href', dataStr);
        dlAnchor.setAttribute('download', 'jangkhng_3d_neotab_backup.json');
        dlAnchor.click();
      });
    }

    // Import Settings
    const importInput = document.getElementById('backup-import-file');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const imported = JSON.parse(event.target.result);
            currentSettings = { ...StorageModule.DEFAULT_SETTINGS, ...imported };
            await StorageModule.saveSettings(currentSettings);
            alert('Settings imported successfully! Reloading...');
            window.location.reload();
          } catch (err) {
            alert('Failed to parse backup file: ' + err.message);
          }
        };
        reader.readAsText(file);
      });
    }

    // Reset Defaults
    const resetBtn = document.getElementById('backup-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to reset all settings to defaults? Your bookmarks and local images will not be deleted.')) {
          currentSettings = { ...StorageModule.DEFAULT_SETTINGS };
          await StorageModule.saveSettings(currentSettings);
          window.location.reload();
        }
      });
    }
  }

  async function handleFilesUpload(fileList) {
    const statusEl = document.getElementById('upload-status-indicator');
    if (statusEl) statusEl.textContent = `Uploading ${fileList.length} image(s)...`;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.type.startsWith('image/')) {
        await StorageModule.saveWallpaperImage(file);
      }
    }

    if (statusEl) statusEl.textContent = 'Upload complete!';
    setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 3000);

    await refreshLocalGallery();
    await WallpaperEngine.refreshLocalImagesCache();

    // Auto set wallpaper mode to local slideshow or local single
    if (currentSettings.wallpaperMode !== 'local_slideshow' && currentSettings.wallpaperMode !== 'local_single') {
      currentSettings.wallpaperMode = 'local_slideshow';
      const wpModeSelect = document.getElementById('setting-wp-mode');
      if (wpModeSelect) wpModeSelect.value = 'local_slideshow';
      toggleConditionalWallpaperPanels();
      await StorageModule.saveSettings(currentSettings);
    }

    await WallpaperEngine.updateSettings(currentSettings);
  }

  async function refreshLocalGallery() {
    const galleryEl = document.getElementById('local-images-gallery');
    if (!galleryEl) return;

    const images = await StorageModule.getAllWallpaperImages();
    if (images.length === 0) {
      galleryEl.innerHTML = '<div class="empty-gallery-hint">No local images uploaded yet. Drag & drop or click above to add photos!</div>';
      return;
    }

    galleryEl.innerHTML = '';

    images.forEach((item) => {
      const card = document.createElement('div');
      card.className = `gallery-thumb-card ${currentSettings.selectedLocalImageId === item.id ? 'active-thumb' : ''}`;

      const thumbUrl = URL.createObjectURL(item.blob);
      const sizeKB = (item.size / 1024).toFixed(0);

      card.innerHTML = `
        <div class="thumb-img-wrapper" style="background-image: url('${thumbUrl}')">
          <div class="thumb-badge">${sizeKB} KB</div>
        </div>
        <div class="thumb-info">
          <span class="thumb-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span>
          <div class="thumb-btns">
            <button class="thumb-select-btn" title="Set as single wallpaper">Set</button>
            <button class="thumb-delete-btn" title="Delete image">✕</button>
          </div>
        </div>
      `;

      card.querySelector('.thumb-select-btn').addEventListener('click', async () => {
        currentSettings.selectedLocalImageId = item.id;
        currentSettings.wallpaperMode = 'local_single';
        const modeSelect = document.getElementById('setting-wp-mode');
        if (modeSelect) modeSelect.value = 'local_single';
        toggleConditionalWallpaperPanels();
        await StorageModule.saveSettings(currentSettings);
        WallpaperEngine.setDirectLocalImage(item.blob);
        refreshLocalGallery();
      });

      card.querySelector('.thumb-delete-btn').addEventListener('click', async () => {
        await StorageModule.deleteWallpaperImage(item.id);
        if (currentSettings.selectedLocalImageId === item.id) {
          currentSettings.selectedLocalImageId = null;
          await StorageModule.saveSettings(currentSettings);
        }
        await refreshLocalGallery();
        await WallpaperEngine.refreshLocalImagesCache();
        await WallpaperEngine.updateSettings(currentSettings);
      });

      galleryEl.appendChild(card);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return {
    init,
    open: openModal,
    close: closeModal
  };
})();

window.SettingsModal = SettingsModal;

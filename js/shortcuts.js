/**
 * Jangkhng 3D NeoTab - 3D Shortcuts & Quick Launch Module
 * Features:
 * - 3D Interactive Card Tilt with specular lighting & depth perspective
 * - Multiple stylish div themes: Glass 3D, Cyber Neon Glow, Minimal Pill
 * - Dynamic columns layout (4, 5, 6, 8 columns)
 * - Complete CRUD: Add, Edit, Delete, Reorder shortcuts
 * - Smart Favicon resolution & fallback avatar generator
 */

const ShortcutsModule = (function () {
  let containerEl = null;
  let currentSettings = null;
  let shortcutsList = [];
  let editingId = null;

  async function init(settings) {
    currentSettings = settings;
    containerEl = document.getElementById('shortcuts-grid');
    shortcutsList = settings.shortcuts || [];

    setupModals();
    render();
  }

  function render() {
    if (!containerEl) return;

    const styleMode = currentSettings.shortcutStyle || 'glass_3d';
    const columns = currentSettings.shortcutColumns || 5;

    containerEl.className = `shortcuts-grid-container style-${styleMode} cols-${columns}`;
    containerEl.innerHTML = '';

    shortcutsList.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'shortcut-3d-card';
      card.setAttribute('data-id', item.id);
      card.setAttribute('data-index', index);

      const faviconUrl = getFavicon(item.url, item.icon);
      const initialLetter = (item.title || 'W').charAt(0).toUpperCase();

      card.innerHTML = `
        <div class="card-inner-3d">
          <div class="card-glare"></div>
          <div class="card-actions">
            <button class="action-btn edit-btn" title="Edit Shortcut" data-id="${item.id}">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
            <button class="action-btn delete-btn" title="Delete Shortcut" data-id="${item.id}">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <a href="${item.url}" class="card-link" title="${escapeHtml(item.title)}">
            <div class="icon-wrapper">
              <img class="site-icon" src="${faviconUrl}" alt="" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
              <div class="fallback-avatar" style="display: none;">${initialLetter}</div>
            </div>
            <span class="card-title">${escapeHtml(item.title)}</span>
          </a>
        </div>
      `;

      // 3D tilt mouse movement
      if (currentSettings.enable3DTilt && !currentSettings.performanceMode) {
        attach3DTilt(card);
      }

      // Action buttons
      const editBtn = card.querySelector('.edit-btn');
      const deleteBtn = card.querySelector('.delete-btn');

      editBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openEditModal(item.id);
      });

      deleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        deleteShortcut(item.id);
      });

      containerEl.appendChild(card);
    });

    // Add "New Shortcut" card
    const addCard = document.createElement('div');
    addCard.className = 'shortcut-3d-card add-shortcut-card';
    addCard.innerHTML = `
      <div class="card-inner-3d">
        <button class="add-shortcut-btn" id="open-add-shortcut-btn" title="Add Shortcut">
          <div class="plus-icon-circle">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <span class="card-title">Add New</span>
        </button>
      </div>
    `;

    addCard.querySelector('#open-add-shortcut-btn').addEventListener('click', () => {
      openAddModal();
    });

    if (currentSettings.enable3DTilt && !currentSettings.performanceMode) {
      attach3DTilt(addCard);
    }

    containerEl.appendChild(addCard);
  }

  function getFavicon(url, customIcon) {
    if (customIcon) return customIcon;
    try {
      const u = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(u.hostname)}&sz=64`;
    } catch (e) {
      return '';
    }
  }

  /**
   * Ultra-performant 3D tilt effect using requestAnimationFrame and CSS transform3d
   */
  function attach3DTilt(cardElement) {
    const inner = cardElement.querySelector('.card-inner-3d');
    const glare = cardElement.querySelector('.card-glare');
    if (!inner) return;

    let bounds;
    let isHovering = false;
    let mouseX = 0;
    let mouseY = 0;
    let rAF = null;

    function updateTransform() {
      if (!isHovering) {
        inner.style.transform = '';
        if (glare) glare.style.opacity = '0';
        return;
      }

      const x = mouseX - bounds.left;
      const y = mouseY - bounds.top;
      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;

      // Max tilt degrees: 10deg
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      inner.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`;

      if (glare) {
        const glareX = (x / bounds.width) * 100;
        const glareY = (y / bounds.height) * 100;
        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.4) 0%, transparent 60%)`;
        glare.style.opacity = '1';
      }

      rAF = requestAnimationFrame(updateTransform);
    }

    cardElement.addEventListener('mouseenter', (e) => {
      bounds = cardElement.getBoundingClientRect();
      isHovering = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (rAF) cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(updateTransform);
    });

    cardElement.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    cardElement.addEventListener('mouseleave', () => {
      isHovering = false;
      if (rAF) cancelAnimationFrame(rAF);
      inner.style.transform = '';
      if (glare) glare.style.opacity = '0';
    });
  }

  function setupModals() {
    const modal = document.getElementById('shortcut-modal');
    const closeBtn = document.getElementById('shortcut-modal-close');
    const cancelBtn = document.getElementById('shortcut-modal-cancel');
    const saveBtn = document.getElementById('shortcut-modal-save');

    if (!modal) return;

    const closeModal = () => {
      modal.classList.remove('active');
      editingId = null;
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const titleInput = document.getElementById('shortcut-title-input');
        const urlInput = document.getElementById('shortcut-url-input');

        let title = titleInput.value.trim();
        let url = urlInput.value.trim();

        if (!url) {
          alert('Please enter a valid URL');
          return;
        }

        if (!/^https?:\/\//i.test(url)) {
          url = 'https://' + url;
        }

        if (!title) {
          try {
            title = new URL(url).hostname.replace(/^www\./, '');
          } catch (e) {
            title = url;
          }
        }

        if (editingId) {
          // Edit existing
          const idx = shortcutsList.findIndex(s => s.id === editingId);
          if (idx !== -1) {
            shortcutsList[idx].title = title;
            shortcutsList[idx].url = url;
          }
        } else {
          // Add new
          shortcutsList.push({
            id: 'sc_' + Date.now(),
            title: title,
            url: url,
            icon: ''
          });
        }

        currentSettings.shortcuts = shortcutsList;
        await StorageModule.updateSetting('shortcuts', shortcutsList);
        render();
        closeModal();
      });
    }
  }

  function openAddModal() {
    editingId = null;
    const modal = document.getElementById('shortcut-modal');
    const titleHeader = document.getElementById('shortcut-modal-title');
    const titleInput = document.getElementById('shortcut-title-input');
    const urlInput = document.getElementById('shortcut-url-input');

    if (titleHeader) titleHeader.textContent = 'Add New 3D Shortcut';
    if (titleInput) titleInput.value = '';
    if (urlInput) urlInput.value = '';

    modal.classList.add('active');
    urlInput.focus();
  }

  function openEditModal(id) {
    const item = shortcutsList.find(s => s.id === id);
    if (!item) return;

    editingId = id;
    const modal = document.getElementById('shortcut-modal');
    const titleHeader = document.getElementById('shortcut-modal-title');
    const titleInput = document.getElementById('shortcut-title-input');
    const urlInput = document.getElementById('shortcut-url-input');

    if (titleHeader) titleHeader.textContent = 'Edit Shortcut';
    if (titleInput) titleInput.value = item.title;
    if (urlInput) urlInput.value = item.url;

    modal.classList.add('active');
    titleInput.focus();
  }

  async function deleteShortcut(id) {
    shortcutsList = shortcutsList.filter(s => s.id !== id);
    currentSettings.shortcuts = shortcutsList;
    await StorageModule.updateSetting('shortcuts', shortcutsList);
    render();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return {
    init,
    render,
    getShortcuts: () => shortcutsList,
    updateStyle: (newStyle) => {
      currentSettings.shortcutStyle = newStyle;
      render();
    },
    updateColumns: (newCols) => {
      currentSettings.shortcutColumns = newCols;
      render();
    },
    updateTilt: (enabled) => {
      currentSettings.enable3DTilt = enabled;
      render();
    }
  };
})();

window.ShortcutsModule = ShortcutsModule;

/**
 * Jangkhng 3D NeoTab - Bookmarks Customization Engine
 * Features:
 * - Live integration with chrome.bookmarks API
 * - Graceful fallback mock tree for offline/dev preview
 * - User-customizable positioning:
 *   * 'top' (Sleek Glass Top Bar)
 *   * 'bottom' (Sleek Bottom Dock)
 *   * 'left' (3D Collapsible Left Sidebar)
 *   * 'right' (3D Collapsible Right Sidebar)
 *   * 'center_dock' (3D Floating Center Card)
 *   * 'hidden' (Completely hidden)
 * - Folder drilldown dropdowns & bookmark search filter
 */

const BookmarksModule = (function () {
  let containerEl = null;
  let currentSettings = null;
  let bookmarksTree = null;
  let activeFolderDropdown = null;

  // Fallback sample bookmarks for preview outside Chrome extension context
  const SAMPLE_BOOKMARKS = [
    {
      id: 'f1',
      title: 'Work & Code',
      children: [
        { id: 'b1', title: 'GitHub', url: 'https://github.com' },
        { id: 'b2', title: 'Stack Overflow', url: 'https://stackoverflow.com' },
        { id: 'b3', title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
        { id: 'b4', title: 'ChatGPT', url: 'https://chatgpt.com' }
      ]
    },
    {
      id: 'f2',
      title: 'Media & Social',
      children: [
        { id: 'b5', title: 'YouTube', url: 'https://youtube.com' },
        { id: 'b6', title: 'Reddit', url: 'https://reddit.com' },
        { id: 'b7', title: 'Twitter / X', url: 'https://x.com' },
        { id: 'b8', title: 'Spotify', url: 'https://spotify.com' }
      ]
    },
    { id: 'b9', title: 'Gmail', url: 'https://mail.google.com' },
    { id: 'b10', title: 'Google Drive', url: 'https://drive.google.com' },
    { id: 'b11', title: 'Maps', url: 'https://maps.google.com' },
    { id: 'b12', title: 'News', url: 'https://news.google.com' }
  ];

  async function init(settings) {
    currentSettings = settings;
    containerEl = document.getElementById('bookmarks-wrapper');

    // Close any folder dropdown on global click outside
    document.addEventListener('click', (e) => {
      if (activeFolderDropdown && !e.target.closest('.bookmark-folder-trigger') && !e.target.closest('.bookmark-dropdown')) {
        closeFolderDropdown();
      }
    });

    await loadBookmarks();
    render();
  }

  async function loadBookmarks() {
    if (typeof chrome !== 'undefined' && chrome.bookmarks && chrome.bookmarks.getTree) {
      try {
        const tree = await new Promise((resolve, reject) => {
          chrome.bookmarks.getTree((results) => {
            if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
            else resolve(results);
          });
        });

        // Chrome bookmarks root usually has: Bookmarks Bar, Other Bookmarks, Mobile Bookmarks
        if (tree && tree.length > 0 && tree[0].children) {
          // Find bookmarks bar folder or gather children
          const barFolder = tree[0].children.find(c => c.title.toLowerCase().includes('bar')) || tree[0].children[0];
          bookmarksTree = (barFolder && barFolder.children) ? barFolder.children : tree[0].children;
        } else {
          bookmarksTree = SAMPLE_BOOKMARKS;
        }
      } catch (err) {
        console.warn('Could not read chrome.bookmarks, using mock tree:', err);
        bookmarksTree = SAMPLE_BOOKMARKS;
      }
    } else {
      bookmarksTree = SAMPLE_BOOKMARKS;
    }
  }

  function getFaviconUrl(url) {
    if (!url) return '';
    try {
      const u = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(u.hostname)}&sz=32`;
    } catch (e) {
      return '';
    }
  }

  function render() {
    if (!containerEl) return;

    const position = currentSettings.bookmarkPosition || 'top';
    const styleMode = currentSettings.bookmarkStyle || 'icon_text';

    // Remove old position classes
    containerEl.className = 'bookmarks-container';

    if (position === 'hidden') {
      containerEl.style.display = 'none';
      return;
    }

    containerEl.style.display = 'flex';
    containerEl.classList.add(`pos-${position}`);
    containerEl.classList.add(`style-${styleMode}`);

    // If sidebar mode, add toggle button & header
    const isSidebar = (position === 'left' || position === 'right');

    let html = '';

    if (isSidebar) {
      html += `
        <div class="sidebar-header">
          <div class="sidebar-title">
            <svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Bookmarks</span>
          </div>
          <button class="sidebar-collapse-btn" id="sidebar-collapse-btn" title="Toggle Sidebar">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              ${position === 'left' ? '<path d="M15 18l-6-6 6-6"/>' : '<path d="M9 18l6-6-6-6"/>'}
            </svg>
          </button>
        </div>
        <div class="sidebar-search">
          <input type="text" id="bookmark-filter-input" placeholder="Filter bookmarks..." autocomplete="off">
        </div>
      `;
    }

    html += `<div class="bookmarks-list" id="bookmarks-items-list"></div>`;
    containerEl.innerHTML = html;

    renderItems(bookmarksTree);

    // Setup sidebar collapse toggle if applicable
    if (isSidebar) {
      const collapseBtn = document.getElementById('sidebar-collapse-btn');
      if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
          containerEl.classList.toggle('collapsed');
        });
      }

      const searchInput = document.getElementById('bookmark-filter-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase().trim();
          filterAndRenderItems(query);
        });
      }
    }
  }

  function filterAndRenderItems(query) {
    if (!query) {
      renderItems(bookmarksTree);
      return;
    }

    const flatMatches = [];
    function searchTree(nodes) {
      for (const node of nodes) {
        if (node.url && (node.title.toLowerCase().includes(query) || node.url.toLowerCase().includes(query))) {
          flatMatches.push(node);
        }
        if (node.children) {
          searchTree(node.children);
        }
      }
    }
    searchTree(bookmarksTree);
    renderItems(flatMatches, true);
  }

  function renderItems(items, isFlat = false) {
    const listEl = document.getElementById('bookmarks-items-list');
    if (!listEl) return;

    if (!items || items.length === 0) {
      listEl.innerHTML = '<div class="no-bookmarks">No bookmarks found</div>';
      return;
    }

    listEl.innerHTML = '';

    items.forEach((item) => {
      if (item.children && !isFlat) {
        // Folder item
        const folderBtn = document.createElement('button');
        folderBtn.className = 'bookmark-item bookmark-folder bookmark-folder-trigger';
        folderBtn.setAttribute('data-id', item.id);
        folderBtn.innerHTML = `
          <svg class="bookmark-icon folder-svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
          </svg>
          <span class="bookmark-text">${escapeHtml(item.title || 'Folder')}</span>
          <svg class="chevron-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        `;

        folderBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleFolderDropdown(folderBtn, item);
        });

        listEl.appendChild(folderBtn);
      } else if (item.url) {
        // Bookmark Link
        const link = document.createElement('a');
        link.className = 'bookmark-item bookmark-link';
        link.href = item.url;
        link.title = `${item.title}\n${item.url}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        const faviconSrc = getFaviconUrl(item.url);
        link.innerHTML = `
          <img class="bookmark-icon" src="${faviconSrc}" alt="" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'%23888\\'><circle cx=\\'12\\' cy=\\'12\\' r=\\'10\\'/></svg>'">
          <span class="bookmark-text">${escapeHtml(item.title || item.url)}</span>
        `;
        listEl.appendChild(link);
      }
    });
  }

  function toggleFolderDropdown(triggerBtn, folderNode) {
    if (activeFolderDropdown && activeFolderDropdown.trigger === triggerBtn) {
      closeFolderDropdown();
      return;
    }

    closeFolderDropdown();

    const dropdown = document.createElement('div');
    dropdown.className = 'bookmark-dropdown glass-panel-3d';

    const header = document.createElement('div');
    header.className = 'dropdown-header';
    header.innerHTML = `<strong>📁 ${escapeHtml(folderNode.title)}</strong>`;
    dropdown.appendChild(header);

    const scrollList = document.createElement('div');
    scrollList.className = 'dropdown-list';

    if (!folderNode.children || folderNode.children.length === 0) {
      scrollList.innerHTML = '<div class="empty-folder">Empty folder</div>';
    } else {
      folderNode.children.forEach((child) => {
        if (child.url) {
          const itemLink = document.createElement('a');
          itemLink.className = 'dropdown-item';
          itemLink.href = child.url;
          itemLink.target = '_blank';
          itemLink.rel = 'noopener noreferrer';
          itemLink.innerHTML = `
            <img class="bookmark-icon" src="${getFaviconUrl(child.url)}" alt="" loading="lazy">
            <span>${escapeHtml(child.title || child.url)}</span>
          `;
          scrollList.appendChild(itemLink);
        }
      });
    }

    dropdown.appendChild(scrollList);
    document.body.appendChild(dropdown);

    // Position dropdown relative to trigger
    const rect = triggerBtn.getBoundingClientRect();
    const pos = currentSettings.bookmarkPosition || 'top';

    if (pos === 'top') {
      dropdown.style.top = `${rect.bottom + 8}px`;
      dropdown.style.left = `${Math.min(rect.left, window.innerWidth - 280)}px`;
    } else if (pos === 'bottom') {
      dropdown.style.bottom = `${window.innerHeight - rect.top + 8}px`;
      dropdown.style.left = `${Math.min(rect.left, window.innerWidth - 280)}px`;
    } else if (pos === 'left') {
      dropdown.style.top = `${Math.min(rect.top, window.innerHeight - 300)}px`;
      dropdown.style.left = `${rect.right + 10}px`;
    } else if (pos === 'right') {
      dropdown.style.top = `${Math.min(rect.top, window.innerHeight - 300)}px`;
      dropdown.style.right = `${window.innerWidth - rect.left + 10}px`;
    } else {
      dropdown.style.top = `${rect.bottom + 8}px`;
      dropdown.style.left = `${rect.left}px`;
    }

    activeFolderDropdown = { element: dropdown, trigger: triggerBtn };
  }

  function closeFolderDropdown() {
    if (activeFolderDropdown) {
      if (activeFolderDropdown.element.parentNode) {
        activeFolderDropdown.element.parentNode.removeChild(activeFolderDropdown.element);
      }
      activeFolderDropdown = null;
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return {
    init,
    render,
    updatePosition: (newPos) => {
      currentSettings.bookmarkPosition = newPos;
      render();
    },
    updateStyle: (newStyle) => {
      currentSettings.bookmarkStyle = newStyle;
      render();
    }
  };
})();

window.BookmarksModule = BookmarksModule;

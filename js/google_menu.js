/**
 * Jangkhng 3D NeoTab - Google Menu & Apps Launcher Module
 * Authentically matches Google.com's top-right corner profile & 9-dot Google Apps launcher
 * Designed in high-tech 3D Frosted Glass aesthetic with specular lighting.
 */

const GoogleMenuModule = (function () {
  let currentSettings = null;
  let appsDropdownEl = null;
  let profileDropdownEl = null;
  let appsBtn = null;
  let profileBtn = null;

  // Authentic Google Apps with clean, crisp SVG logos
  const GOOGLE_APPS = [
    {
      name: 'Search',
      url: 'https://www.google.com',
      icon: `<svg viewBox="0 0 24 24" width="32" height="32"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>`
    },
    {
      name: 'Gmail',
      url: 'https://mail.google.com',
      icon: `<svg viewBox="0 0 24 24" width="32" height="32"><path fill="#EA4335" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`
    },
    {
      name: 'Drive',
      url: 'https://drive.google.com',
      icon: `<svg viewBox="0 0 24 24" width="32" height="32"><path fill="#FFBA00" d="M8.05 3.5h7.9l4.55 7.9-3.95 6.85H8.65z"/><path fill="#0066DA" d="M16.5 18.25H3.5l3.95-6.85 7.9 13.7z"/><path fill="#00AC47" d="M3.5 18.25l4.55-7.9 3.95-6.85 4.55 7.9-8.5 14.7z"/></svg>`
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com',
      icon: `<svg viewBox="0 0 24 24" width="32" height="32" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
    },
    {
      name: 'Gemini',
      url: 'https://gemini.google.com',
      icon: `<svg viewBox="0 0 24 24" width="32" height="32"><path fill="url(#gemini-grad)" d="M12 2C12 7.5 7.5 12 2 12c5.5 0 10 4.5 10 10 0-5.5 4.5-10 10-10-5.5 0-10-4.5-10-10z"/><defs><linearGradient id="gemini-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#1A73E8"/><stop offset="0.5" stop-color="#8AB4F8"/><stop offset="1" stop-color="#EA4335"/></linearGradient></defs></svg>`
    },
    {
      name: 'Maps',
      url: 'https://maps.google.com',
      icon: `<svg viewBox="0 0 24 24" width="32" height="32"><path fill="#34A853" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`
    },
    {
      name: 'Calendar',
      url: 'https://calendar.google.com',
      icon: `<svg viewBox="0 0 24 24" width="32" height="32"><rect width="20" height="20" x="2" y="2" rx="4" fill="#4285F4"/><path fill="#fff" d="M6 10h12v10H6z"/><path fill="#1976D2" d="M6 6h12v4H6z"/><text x="12" y="18" fill="#4285F4" font-size="8" font-weight="bold" text-anchor="middle">31</text></svg>`
    },
    {
      name: 'Photos',
      url: 'https://photos.google.com',
      icon: `<svg viewBox="0 0 24 24" width="32" height="32"><path fill="#EA4335" d="M12 12V4a4 4 0 0 0-4 4 4 4 0 0 0 4 4z"/><path fill="#4285F4" d="M12 12h8a4 4 0 0 0-4-4 4 4 0 0 0-4 4z"/><path fill="#34A853" d="M12 12v8a4 4 0 0 0 4-4 4 4 0 0 0-4-4z"/><path fill="#FBBC05" d="M12 12H4a4 4 0 0 0 4 4 4 4 0 0 0 4-4z"/></svg>`
    },
    {
      name: 'Meet',
      url: 'https://meet.google.com',
      icon: `<svg viewBox="0 0 24 24" width="32" height="32"><rect width="14" height="12" x="2" y="6" rx="2" fill="#00832D"/><path fill="#0066DA" d="M16 9.5l6-4v13l-6-4z"/></svg>`
    },
    {
      name: 'Translate',
      url: 'https://translate.google.com',
      icon: `<svg viewBox="0 0 24 24" width="32" height="32"><path fill="#4285F4" d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z"/><path fill="#fff" d="M7 7h10v2H7zm2 4h6v2H9zm-1 4h8v2H8z"/></svg>`
    },
    {
      name: 'Docs',
      url: 'https://docs.google.com',
      icon: `<svg viewBox="0 0 24 24" width="32" height="32"><path fill="#4285F4" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path fill="#fff" d="M14 2v6h6z"/><path fill="#fff" d="M8 12h8v1.5H8zm0 3h8v1.5H8zm0 3h5v1.5H8z"/></svg>`
    },
    {
      name: 'Sheets',
      url: 'https://sheets.google.com',
      icon: `<svg viewBox="0 0 24 24" width="32" height="32"><path fill="#0F9D58" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path fill="#fff" d="M14 2v6h6z"/><path fill="#fff" d="M8 12h8v6H8zm2 1.5h4v3h-4z"/></svg>`
    },
    {
      name: 'Play',
      url: 'https://play.google.com',
      icon: `<svg viewBox="0 0 24 24" width="32" height="32"><path fill="#4285F4" d="M3.6 2.4L13.8 12 3.6 21.6z"/><path fill="#34A853" d="M17.4 8.6L13.8 12l3.6 3.4 3-1.7c.9-.5.9-1.4 0-1.9z"/><path fill="#EA4335" d="M3.6 2.4l10.2 9.6 3.6-3.4L6.2 1.5C5.1.9 4 1.3 3.6 2.4z"/><path fill="#FBBC05" d="M3.6 21.6c.4 1.1 1.5 1.5 2.6.9l11.2-7.1-3.6-3.4z"/></svg>`
    },
    {
      name: 'Contacts',
      url: 'https://contacts.google.com',
      icon: `<svg viewBox="0 0 24 24" width="32" height="32"><path fill="#1A73E8" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1z"/></svg>`
    },
    {
      name: 'Keep',
      url: 'https://keep.google.com',
      icon: `<svg viewBox="0 0 24 24" width="32" height="32"><path fill="#FFBB00" d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/></svg>`
    }
  ];

  async function init(settings) {
    currentSettings = settings;

    appsBtn = document.getElementById('google-apps-btn');
    profileBtn = document.getElementById('google-profile-btn');
    appsDropdownEl = document.getElementById('google-apps-dropdown');
    profileDropdownEl = document.getElementById('google-profile-dropdown');

    // Try detecting Chrome logged-in profile identity if available
    await detectChromeIdentity();

    renderAvatarUI();
    renderAppsGrid();
    setupEventListeners();
  }

  async function detectChromeIdentity() {
    if (typeof chrome !== 'undefined' && chrome.identity && chrome.identity.getProfileUserInfo) {
      try {
        const userInfo = await new Promise((resolve) => {
          chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, (info) => {
            resolve(info || {});
          });
        });

        let changed = false;
        if (userInfo.email) {
          if (currentSettings.userEmail !== userInfo.email) {
            currentSettings.userEmail = userInfo.email;
            changed = true;
          }
          if (!currentSettings.userName || currentSettings.userName === 'Explorer' || currentSettings.userName === 'JANGKHNG') {
            currentSettings.userName = userInfo.email.includes('jangkhng') || userInfo.email.includes('barman')
              ? 'Barman IT'
              : userInfo.email.split('@')[0];
            changed = true;
          }
        }

        if (!currentSettings.userAvatarUrl) {
          currentSettings.userAvatarUrl = 'assets/user_avatar.png';
          changed = true;
        }

        if (changed) {
          await StorageModule.saveSettings(currentSettings);
        }
      } catch (e) {
        console.log('Chrome identity auto-detect skipped:', e);
      }
    }
  }

  function renderAvatarUI() {
    const avatarImg = document.getElementById('top-user-avatar');
    const avatarInitial = document.getElementById('top-user-initial');
    const popupAvatarImg = document.getElementById('popup-user-avatar');
    const popupAvatarInitial = document.getElementById('popup-user-initial');
    const popupUserName = document.getElementById('popup-user-name');
    const popupUserEmail = document.getElementById('popup-user-email');

    // Default to the real Chrome logged-in identity
    const name = (currentSettings.userName && currentSettings.userName !== 'Explorer' && currentSettings.userName !== 'JANGKHNG') 
      ? currentSettings.userName 
      : 'Barman IT';
    const email = (currentSettings.userEmail && currentSettings.userEmail !== 'user@gmail.com' && currentSettings.userEmail !== 'jangkhng@gmail.com')
      ? currentSettings.userEmail 
      : 'businesskumarjangkhng@gmail.com';
    const avatarSrc = currentSettings.userAvatarUrl || 'assets/user_avatar.png';
    const initial = name.charAt(0).toUpperCase();

    if (popupUserName) popupUserName.textContent = name;
    if (popupUserEmail) popupUserEmail.textContent = email;

    if (avatarSrc) {
      if (avatarImg) {
        avatarImg.src = avatarSrc;
        avatarImg.style.display = 'block';
      }
      if (avatarInitial) avatarInitial.style.display = 'none';

      if (popupAvatarImg) {
        popupAvatarImg.src = avatarSrc;
        popupAvatarImg.style.display = 'block';
      }
      if (popupAvatarInitial) popupAvatarInitial.style.display = 'none';
    } else {
      if (avatarImg) avatarImg.style.display = 'none';
      if (avatarInitial) {
        avatarInitial.textContent = initial;
        avatarInitial.style.display = 'flex';
      }

      if (popupAvatarImg) popupAvatarImg.style.display = 'none';
      if (popupAvatarInitial) {
        popupAvatarInitial.textContent = initial;
        popupAvatarInitial.style.display = 'flex';
      }
    }
  }

  function renderAppsGrid() {
    const grid = document.getElementById('google-apps-grid');
    if (!grid) return;

    grid.innerHTML = '';
    GOOGLE_APPS.forEach((app) => {
      const item = document.createElement('a');
      item.className = 'google-app-item';
      item.href = app.url;
      item.target = '_blank';
      item.rel = 'noopener noreferrer';
      item.title = app.name;
      item.innerHTML = `
        <div class="google-app-icon-wrap">${app.icon}</div>
        <span class="google-app-name">${escapeHtml(app.name)}</span>
      `;
      grid.appendChild(item);
    });
  }

  function setupEventListeners() {
    // 9-dot Waffle Button Click
    if (appsBtn) {
      appsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeProfileDropdown();
        toggleAppsDropdown();
      });
    }

    // Profile Avatar Button Click
    if (profileBtn) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAppsDropdown();
        toggleProfileDropdown();
      });
    }

    // Change Avatar Picture from Popup
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    const avatarFileInput = document.getElementById('avatar-file-input');

    if (changeAvatarBtn && avatarFileInput) {
      changeAvatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        avatarFileInput.click();
      });

      avatarFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            currentSettings.userAvatarUrl = event.target.result;
            await StorageModule.saveSettings(currentSettings);
            renderAvatarUI();
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Chrome Profile Action Item Clicks
    document.querySelectorAll('.chrome-menu-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.getAttribute('data-action');
        closeProfileDropdown();
        handleChromeAction(action);
      });
    });

    // Global click outside closes both menus
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#google-apps-dropdown') && !e.target.closest('#google-apps-btn')) {
        closeAppsDropdown();
      }
      if (!e.target.closest('#google-profile-dropdown') && !e.target.closest('#google-profile-btn')) {
        closeProfileDropdown();
      }
    });

    // Escape closes menus
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAppsDropdown();
        closeProfileDropdown();
      }
    });
  }

  function handleChromeAction(action) {
    switch (action) {
      case 'passwords':
        openUrl('chrome://password-manager/passwords', 'https://passwords.google.com');
        break;
      case 'manage-google-account':
        openUrl('https://myaccount.google.com/');
        break;
      case 'customize-profile':
        openUrl('chrome://settings/manageProfile', 'https://myaccount.google.com/personal-info');
        break;
      case 'chrome-account':
        openUrl('chrome://settings/people', 'https://myaccount.google.com/');
        break;
      case 'signout-chrome':
        openUrl('https://accounts.google.com/Logout');
        break;
      case 'add-profile':
        openUrl('chrome://settings/manageProfile', 'https://accounts.google.com/AddSession');
        break;
      case 'guest-profile':
        if (typeof chrome !== 'undefined' && chrome.windows && chrome.windows.create) {
          try {
            chrome.windows.create({ incognito: true });
            return;
          } catch (err) {
            console.warn('chrome.windows.create failed:', err);
          }
        }
        openUrl('chrome://settings/manageProfile');
        break;
      case 'manage-profiles':
        openUrl('chrome://settings/manageProfile', 'https://accounts.google.com/');
        break;
      default:
        break;
    }
  }

  function openUrl(targetUrl, fallbackUrl) {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      try {
        chrome.tabs.create({ url: targetUrl }, (tab) => {
          if (chrome.runtime.lastError && fallbackUrl) {
            chrome.tabs.create({ url: fallbackUrl });
          }
        });
        return;
      } catch (err) {
        console.warn('chrome.tabs.create failed, falling back:', err);
      }
    }
    window.open(fallbackUrl || targetUrl, '_blank');
  }

  function toggleAppsDropdown() {
    if (!appsDropdownEl) return;
    appsDropdownEl.classList.toggle('active');
  }

  function openAppsDropdown() {
    if (appsDropdownEl) appsDropdownEl.classList.add('active');
  }

  function closeAppsDropdown() {
    if (appsDropdownEl) appsDropdownEl.classList.remove('active');
  }

  function toggleProfileDropdown() {
    if (!profileDropdownEl) return;
    profileDropdownEl.classList.toggle('active');
  }

  function closeProfileDropdown() {
    if (profileDropdownEl) profileDropdownEl.classList.remove('active');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return {
    init,
    updateSettings: (newSettings) => {
      currentSettings = newSettings;
      renderAvatarUI();
    }
  };
})();

window.GoogleMenuModule = GoogleMenuModule;

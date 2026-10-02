/**
 * Jangkhng 3D NeoTab - Dynamic 3D Search Engine Module
 * Features:
 * - 3D Capsule with animated glowing aura & depth shadows
 * - Multi-engine switchable selector (Google, YouTube, DuckDuckGo, Bing, GitHub, Wikipedia, Perplexity)
 * - Direct URL vs Search Query auto-detection
 * - Dynamic animated placeholder
 * - Keyboard shortcuts: Press '/' or 'Ctrl+K' to focus immediately
 * - Voice search support (Web Speech API)
 * - Clear text button
 */

const SearchModule = (function () {
  const ENGINES = {
    google: {
      name: 'Google',
      url: 'https://www.google.com/search?q=',
      placeholder: 'Search Google or type a URL...',
      icon: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>`
    },
    youtube: {
      name: 'YouTube',
      url: 'https://www.youtube.com/results?search_query=',
      placeholder: 'Search YouTube videos & music...',
      icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
    },
    duckduckgo: {
      name: 'DuckDuckGo',
      url: 'https://duckduckgo.com/?q=',
      placeholder: 'Search privacy-friendly with DuckDuckGo...',
      icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#DE5833"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93c-2.31 0-4.2-1.74-4.47-3.99l2.42-.32c.16 1.15 1.14 2.03 2.33 2.03 1.3 0 2.35-1.05 2.35-2.35 0-.58-.21-1.12-.57-1.53l1.52-1.52c.8.84 1.33 1.98 1.33 3.25 0 2.4-1.95 4.35-4.35 4.35z"/></svg>`
    },
    bing: {
      name: 'Bing',
      url: 'https://www.bing.com/search?q=',
      placeholder: 'Search Microsoft Bing...',
      icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#008373"><path d="M5 3v18l5-3V7.5l5.5 3.5L19 9 7 2H5zm5.5 8.5L7 9.5V5.2L16 10l-5.5 1.5z"/></svg>`
    },
    github: {
      name: 'GitHub',
      url: 'https://github.com/search?q=',
      placeholder: 'Search GitHub repositories & code...',
      icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#FFFFFF"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>`
    },
    wikipedia: {
      name: 'Wikipedia',
      url: 'https://en.wikipedia.org/wiki/Special:Search?search=',
      placeholder: 'Search Wikipedia articles & knowledge...',
      icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#FFFFFF"><path d="M12.09 13.124l2.62-6.848h2.092l-4.148 9.948h-1.312L8.52 9.42l-2.82 6.804H4.388L8.536 6.276h2.092l1.462 6.848zm6.554-6.848h1.838l-4.06 9.948h-1.838l4.06-9.948z"/></svg>`
    },
    perplexity: {
      name: 'Perplexity AI',
      url: 'https://www.perplexity.ai/search?q=',
      placeholder: 'Ask Perplexity AI anything...',
      icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#20B2AA"><path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.2l6.8 3.8-6.8 3.8L5.2 8 12 4.2zm-7 5.1l6 3.3v7.4l-6-3.3v-7.4zm14 7.4l-6 3.3v-7.4l6-3.3v7.4z"/></svg>`
    }
  };

  let currentSettings = null;
  let activeEngineKey = 'google';
  let formEl = null;
  let inputEl = null;
  let engineBtn = null;
  let engineDropdown = null;
  let clearBtn = null;
  let voiceBtn = null;

  function init(settings) {
    currentSettings = settings;
    activeEngineKey = settings.defaultEngine || 'google';

    formEl = document.getElementById('search-form');
    inputEl = document.getElementById('search-input');
    engineBtn = document.getElementById('search-engine-btn');
    engineDropdown = document.getElementById('search-engine-dropdown');
    clearBtn = document.getElementById('search-clear-btn');
    voiceBtn = document.getElementById('search-voice-btn');

    setupEngineSelector();
    setupInputEvents();
    setupKeyboardShortcuts();
    setupVoiceSearch();
    updateEngineUI();
  }

  function setupEngineSelector() {
    if (!engineBtn || !engineDropdown) return;

    // Build dropdown list
    engineDropdown.innerHTML = '';
    Object.keys(ENGINES).forEach((key) => {
      const eng = ENGINES[key];
      const item = document.createElement('div');
      item.className = `engine-option ${key === activeEngineKey ? 'selected' : ''}`;
      item.setAttribute('data-engine', key);
      item.innerHTML = `
        <span class="engine-opt-icon">${eng.icon}</span>
        <span class="engine-opt-name">${eng.name}</span>
      `;

      item.addEventListener('click', () => {
        selectEngine(key);
        closeDropdown();
      });

      engineDropdown.appendChild(item);
    });

    engineBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      engineDropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#search-engine-selector')) {
        closeDropdown();
      }
    });
  }

  function closeDropdown() {
    if (engineDropdown) engineDropdown.classList.remove('active');
  }

  function selectEngine(key) {
    if (!ENGINES[key]) return;
    activeEngineKey = key;
    currentSettings.defaultEngine = key;
    StorageModule.updateSetting('defaultEngine', key);
    updateEngineUI();

    // Update selected class in dropdown
    const opts = engineDropdown.querySelectorAll('.engine-option');
    opts.forEach(opt => {
      opt.classList.toggle('selected', opt.getAttribute('data-engine') === key);
    });

    inputEl.focus();
  }

  function updateEngineUI() {
    const eng = ENGINES[activeEngineKey] || ENGINES.google;
    if (engineBtn) {
      engineBtn.innerHTML = `
        ${eng.icon}
        <svg class="dropdown-chevron" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      `;
      engineBtn.title = `Current engine: ${eng.name} (Click to switch)`;
    }
    if (inputEl) {
      inputEl.placeholder = eng.placeholder;
    }
  }

  function setupInputEvents() {
    if (!formEl || !inputEl) return;

    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      executeSearch();
    });

    inputEl.addEventListener('input', () => {
      if (clearBtn) {
        clearBtn.style.display = inputEl.value.trim().length > 0 ? 'flex' : 'none';
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        inputEl.value = '';
        clearBtn.style.display = 'none';
        inputEl.focus();
      });
    }
  }

  function executeSearch() {
    const query = inputEl.value.trim();
    if (!query) return;

    let targetUrl = '';

    // Check if query is a direct URL (e.g., "github.com", "http://...", "localhost:3000")
    const isUrl = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/i.test(query) || /^localhost(:[0-9]+)?/i.test(query);

    if (isUrl) {
      targetUrl = /^https?:\/\//i.test(query) ? query : `https://${query}`;
    } else {
      const eng = ENGINES[activeEngineKey] || ENGINES.google;
      targetUrl = eng.url + encodeURIComponent(query);
    }

    if (currentSettings.openInNewTab) {
      window.open(targetUrl, '_blank');
    } else {
      window.location.href = targetUrl;
    }
  }

  function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // If user is already typing in an input or textarea, don't hijack unless Escape
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInput = activeTag === 'input' || activeTag === 'textarea';

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        inputEl.focus();
        inputEl.select();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputEl.focus();
        inputEl.select();
      } else if (e.key === 'Escape' && document.activeElement === inputEl) {
        inputEl.blur();
        closeDropdown();
      }
    });
  }

  function setupVoiceSearch() {
    if (!voiceBtn) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      voiceBtn.style.display = 'none';
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    let isListening = false;

    recognition.onstart = () => {
      isListening = true;
      voiceBtn.classList.add('listening');
      if (inputEl) inputEl.placeholder = 'Listening... Speak now';
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (inputEl) {
        inputEl.value = transcript;
        if (clearBtn) clearBtn.style.display = 'flex';
        executeSearch();
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      stopListening();
    };

    recognition.onend = () => {
      stopListening();
    };

    function stopListening() {
      isListening = false;
      voiceBtn.classList.remove('listening');
      updateEngineUI();
    }

    voiceBtn.addEventListener('click', () => {
      if (isListening) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (e) {
          console.warn('Voice recognition start error:', e);
        }
      }
    });
  }

  return {
    init,
    selectEngine,
    focus: () => {
      if (inputEl) inputEl.focus();
    }
  };
})();

window.SearchModule = SearchModule;

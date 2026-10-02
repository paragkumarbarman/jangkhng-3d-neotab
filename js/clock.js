/**
 * Jangkhng 3D NeoTab - Clock, Date & Greeting Module
 * Futuristic 3D typography with live precision updates
 */

const ClockModule = (function () {
  let timeEl = null;
  let secondsEl = null;
  let periodEl = null;
  let dateEl = null;
  let greetingEl = null;
  let currentSettings = null;
  let timerId = null;

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function init(settings) {
    currentSettings = settings;

    timeEl = document.getElementById('clock-time');
    secondsEl = document.getElementById('clock-seconds');
    periodEl = document.getElementById('clock-period');
    dateEl = document.getElementById('clock-date');
    greetingEl = document.getElementById('clock-greeting');

    updateClock();
    timerId = setInterval(updateClock, 1000);
  }

  function updateClock() {
    const now = new Date();
    const hours24 = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    let displayHours = hours24;
    let period = '';

    if (currentSettings.timeFormat === '12h') {
      period = hours24 >= 12 ? 'PM' : 'AM';
      displayHours = hours24 % 12;
      if (displayHours === 0) displayHours = 12;
    }

    const pad = (n) => (n < 10 ? '0' + n : n);

    if (timeEl) {
      timeEl.textContent = `${pad(displayHours)}:${pad(minutes)}`;
    }

    if (secondsEl) {
      if (currentSettings.showSeconds) {
        secondsEl.style.display = 'inline-block';
        secondsEl.textContent = `:${pad(seconds)}`;
      } else {
        secondsEl.style.display = 'none';
      }
    }

    if (periodEl) {
      if (currentSettings.timeFormat === '12h') {
        periodEl.style.display = 'inline-block';
        periodEl.textContent = period;
      } else {
        periodEl.style.display = 'none';
      }
    }

    if (dateEl) {
      if (currentSettings.showDate) {
        dateEl.style.display = 'block';
        const dayName = DAYS[now.getDay()];
        const monthName = MONTHS[now.getMonth()];
        dateEl.textContent = `${dayName}, ${monthName} ${now.getDate()}, ${now.getFullYear()}`;
      } else {
        dateEl.style.display = 'none';
      }
    }

    if (greetingEl) {
      if (currentSettings.showGreeting) {
        greetingEl.style.display = 'block';
        let greetingText = 'Good morning';
        if (hours24 >= 12 && hours24 < 17) {
          greetingText = 'Good afternoon';
        } else if (hours24 >= 17 && hours24 < 22) {
          greetingText = 'Good evening';
        } else if (hours24 >= 22 || hours24 < 5) {
          greetingText = 'Night vibes';
        }

        const name = currentSettings.userName || 'Explorer';
        greetingEl.innerHTML = `${greetingText}, <span class="user-name-highlight">${escapeHtml(name)}</span> ✨`;
      } else {
        greetingEl.style.display = 'none';
      }
    }
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
      updateClock();
    }
  };
})();

window.ClockModule = ClockModule;

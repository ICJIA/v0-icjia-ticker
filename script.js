class Ticker {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      dataUrl: options.dataUrl || "ticker-data.json",
      baseSpeed: options.baseSpeed || 16,
      speedMultiplier: options.speedMultiplier || 14,
      rtl: options.rtl || false,
      darkMode: options.darkMode !== undefined ? options.darkMode : true,
      position: options.position || "bottom", // "top" or "bottom"
      retryAttempts: options.retryAttempts || 3,
      retryDelay: options.retryDelay || 2000,
      bubbleTitleFontSize: options.bubbleTitleFontSize || "14px", // Configurable title font size
      bubbleContentFontSize: options.bubbleContentFontSize || "12px", // Configurable content font size
      bubbleBackgroundColor: options.bubbleBackgroundColor || "#fff", // Configurable speech bubble background color
      tickerBackgroundColor: options.tickerBackgroundColor || "#222", // Configurable ticker background color
      tickerTextColor: options.tickerTextColor || "#fff", // Configurable ticker text color
    };

    // DOM elements
    this.container = document.getElementById("ticker-container");
    this.ticker = document.getElementById("ticker");
    this.wrapper = document.getElementById("ticker-wrapper");
    this.errorBox = document.getElementById("ticker-error");

    // State
    this.isPaused = false;
    this.retryCount = 0;
    this.resizeTimer = null;

    // Initialize
    this._applyTheme();
    this._bindEvents();
    this.fetchData();
    this._applyStyles();
  }

  _applyTheme() {
    document.body.classList.add(
      this.config.darkMode ? "dark-mode" : "light-mode"
    );
    document.body.classList.add(
      this.config.position === "top" ? "ticker-top" : "ticker-bottom"
    );
  }

  _applyStyles() {
    document.documentElement.style.setProperty(
      "--bubble-title-font-size",
      this.config.bubbleTitleFontSize
    );
    document.documentElement.style.setProperty(
      "--bubble-content-font-size",
      this.config.bubbleContentFontSize
    );
    document.documentElement.style.setProperty(
      "--bubble-background-color",
      this.config.bubbleBackgroundColor
    );
    document.documentElement.style.setProperty(
      "--ticker-background-color",
      this.config.tickerBackgroundColor
    );
    document.documentElement.style.setProperty(
      "--ticker-text-color",
      this.config.tickerTextColor
    );
  }

  _bindEvents() {
    // Debounced resize handler
    window.addEventListener("resize", () => {
      if (this.resizeTimer) clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        if (!this.isPaused) this._applyAnimationSpeed();
      }, 250);
    });

    // Add keyboard controls
    document.addEventListener("keydown", (e) => {
      // Pause/resume with spacebar when ticker is focused
      if (e.code === "Space" && document.activeElement === this.ticker) {
        e.preventDefault();
        this.togglePause();
      }
    });

    // Add optional play/pause button if it exists
    const pauseButton = document.getElementById("ticker-pause");
    if (pauseButton) {
      pauseButton.addEventListener("click", () => this.togglePause());
    }
  }

  fetchData() {
    this.showError(null); // Clear any previous errors

    fetch(this.config.dataUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load ticker data.");
        return res.json();
      })
      .then((data) => {
        if (
          !data.items ||
          !Array.isArray(data.items) ||
          data.items.length === 0
        ) {
          throw new Error("No items found in ticker data.");
        }
        this.hideError();
        this.initTicker(data.items);
      })
      .catch((err) => {
        if (this.retryCount < this.config.retryAttempts) {
          this.retryCount++;
          setTimeout(() => this.fetchData(), this.config.retryDelay);
          this.showError(
            `Loading ticker data... (Attempt ${this.retryCount}/${this.config.retryAttempts})`
          );
        } else {
          this.showError(err.message);
        }
      });
  }

  showError(message) {
    if (!message) {
      this.errorBox.style.display = "none";
      return;
    }
    this.errorBox.textContent = message;
    this.errorBox.style.display = "block";
  }

  hideError() {
    this.errorBox.style.display = "none";
  }

  showTicker(content) {
    this.wrapper.style.display = "block";
    this.wrapper.setAttribute("aria-hidden", "false");
    if (content) this.ticker.textContent = content;
  }

  hideTicker() {
    this.wrapper.style.display = "none";
    this.wrapper.setAttribute("aria-hidden", "true");
  }

  initTicker(items) {
    this.showTicker("");

    const fullItems = [...items, ...items];
    this.ticker.innerHTML = "";
    this.ticker.setAttribute("tabindex", "0");
    this.ticker.setAttribute("role", "marquee");
    this.ticker.setAttribute("aria-label", "Announcements ticker");

    fullItems.forEach((item, index) => {
      const span = document.createElement("span");
      span.className = "ticker-item";

      const link = document.createElement("a");
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("tabindex", "0");

      // Display title in bold and truncate content if necessary
      const title = document.createElement("strong");
      title.textContent = item.title || "Untitled";
      const content = document.createTextNode(
        `: ${
          item.content.length > 25
            ? item.content.slice(0, 25) + "..."
            : item.content
        }`
      );

      // Store full content in a data attribute for the popup
      link.setAttribute("data-full-content", item.content);

      link.appendChild(title);
      link.appendChild(content);
      span.appendChild(link);
      this.ticker.appendChild(span);
    });

    // Add #2 and #3
    const item2 = document.createElement("span");
    item2.className = "ticker-item";
    item2.textContent = "Item #2: Custom static entry.";
    this.ticker.appendChild(item2);

    const item3 = document.createElement("span");
    item3.className = "ticker-item";
    item3.textContent = "Item #3: Another static entry.";
    this.ticker.appendChild(item3);

    this._applyAnimationSpeed();
    this._addInteractionListeners();
  }

  _applyAnimationSpeed() {
    const width = this.container.offsetWidth;
    const speedFactor = Math.max(width / 300, 1);
    const duration =
      (this.config.baseSpeed * this.config.speedMultiplier) / speedFactor;

    this.ticker.style.animationDuration = `${duration}s`;
    this.ticker.style.animationDirection = this.config.rtl
      ? "reverse"
      : "normal";
  }

  _addInteractionListeners() {
    // Mouse hover
    this.ticker.addEventListener("mouseover", (event) => {
      const target = event.target.closest(".ticker-item a");
      if (target) {
        this.pauseTicker();
        this._showPopup(target);
      }
    });

    // Touch support
    this.ticker.addEventListener("touchstart", (event) => {
      const target = event.target.closest(".ticker-item a");
      if (target) {
        event.preventDefault(); // Prevent immediate click
        this.pauseTicker();
        this._showPopup(target);
      }
    });

    // Focus handling for keyboard navigation
    this.ticker.addEventListener("focusin", (event) => {
      const target = event.target.closest(".ticker-item a");
      if (target) {
        this.pauseTicker();
        this._showPopup(target);
      }
    });
  }

  _showPopup(target) {
    // Clear any existing popups
    this._removeAllPopups();

    // Get data from the target
    const title = target.querySelector("strong").textContent;
    const fullContent = target.getAttribute("data-full-content");
    const url = target.href.replace(/^https?:\/\//, ""); // Remove 'https://' or 'http://'

    // Create popup
    const popup = document.createElement("div");
    popup.className = "ticker-popup";
    popup.setAttribute("role", "tooltip");
    popup.setAttribute("tabindex", "0"); // Make focusable for accessibility

    // Structure the content with title, content, and URL
    const titleElement = document.createElement("h3");
    titleElement.className = "ticker-popup-title";
    titleElement.textContent = title;

    const contentElement = document.createElement("div");
    contentElement.className = "ticker-popup-content";
    contentElement.textContent = fullContent;

    const urlElement = document.createElement("div");
    urlElement.className = "ticker-popup-link";
    urlElement.textContent = url; // Display the actual URL without 'https://'

    // Add content to popup
    popup.appendChild(titleElement);
    popup.appendChild(contentElement);
    popup.appendChild(urlElement);

    // First append to DOM to get dimensions
    document.body.appendChild(popup);

    // Position the popup based on the ticker's position
    const rect = target.getBoundingClientRect();
    const isTickerAtTop = document.body.classList.contains("ticker-top");

    // Calculate initial position
    let popupLeft = rect.left + rect.width / 2 - popup.offsetWidth / 2;

    // Ensure the popup stays within the viewport
    const viewportWidth = window.innerWidth;
    if (popupLeft < 10) {
      popupLeft = 10; // Add padding from the left edge
    } else if (popupLeft + popup.offsetWidth > viewportWidth - 10) {
      popupLeft = viewportWidth - popup.offsetWidth - 10; // Add padding from the right edge
    }

    if (isTickerAtTop) {
      // Place popup below the ticker with at least 50px space
      popup.style.top = `${rect.bottom + window.scrollY + 50}px`;
    } else {
      // Place popup above the ticker with at least 50px space
      popup.style.top = `${
        rect.top + window.scrollY - popup.offsetHeight - 50
      }px`;
    }

    popup.style.left = `${popupLeft}px`;

    // Add the "show" class to make the popup visible with transition
    requestAnimationFrame(() => popup.classList.add("show"));

    // Remove popup on mouse leave or blur
    const removePopup = () => {
      this._removePopup(popup);
      this.resumeTicker();
    };

    target.addEventListener("mouseleave", removePopup, { once: true });
    target.addEventListener("blur", removePopup, { once: true });

    // Auto-remove after some time on touch devices
    if ("ontouchstart" in window) {
      setTimeout(removePopup, 3000);
    }
  }

  _removePopup(popup) {
    if (!popup) return;
    popup.classList.remove("show");
    setTimeout(() => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    }, 300); // Match CSS transition time
  }

  _removeAllPopups() {
    const popups = document.querySelectorAll(".ticker-popup");
    popups.forEach((popup) => this._removePopup(popup));
  }

  pauseTicker() {
    this.ticker.classList.add("paused");
    this.isPaused = true;
  }

  resumeTicker() {
    this.ticker.classList.remove("paused");
    this.isPaused = false;
  }

  togglePause() {
    if (this.isPaused) {
      this.resumeTicker();
    } else {
      this.pauseTicker();
    }

    // Update pause button state if it exists
    const pauseButton = document.getElementById("ticker-pause");
    if (pauseButton) {
      pauseButton.setAttribute("aria-pressed", this.isPaused);
      pauseButton.textContent = this.isPaused ? "Play" : "Pause";
    }
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this._applyTheme();
    this._applyAnimationSpeed();
    this._applyStyles(); // Reapply styles if updated
    return this;
  }
}

// Initialize the ticker when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Get configuration from globals or use defaults
  const ticker = new Ticker({
    dataUrl: typeof TICKER_URL !== "undefined" ? TICKER_URL : undefined,
    baseSpeed: typeof BASE_SPEED !== "undefined" ? BASE_SPEED : undefined,
    speedMultiplier:
      typeof SPEED_MULTIPLIER !== "undefined" ? SPEED_MULTIPLIER : undefined,
    rtl: typeof RTL !== "undefined" ? RTL : undefined,
    darkMode: typeof DARK_MODE !== "undefined" ? DARK_MODE : undefined,
    position:
      typeof TICKER_POSITION !== "undefined" ? TICKER_POSITION : undefined,
  });

  // Make ticker accessible globally if needed
  window.tickerApp = ticker;
});

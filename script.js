/**
 * Ticker class to manage a responsive, configurable news ticker.
 */
class Ticker {
  /**
   * Initializes the Ticker instance.
   * @param {Object} options - Optional configuration overrides.
   */
  constructor(options = {}) {
    console.log("Initializing Ticker...");
    this.config = {}; // Configuration will be loaded dynamically
    this.container = document.getElementById("ticker-container");
    this.ticker = document.getElementById("ticker");
    this.wrapper = document.getElementById("ticker-wrapper");
    this.errorBox = document.getElementById("ticker-error");
    this.isPaused = false;
    this.retryCount = 0;
    this.resizeTimer = null;

    // Load configuration and initialize the ticker
    this._loadConfig(options).then(() => {
      console.log("Configuration loaded:", this.config);
      this._applyTheme();
      this._bindEvents();
      this.fetchData();
      this._applyStyles();
    });
  }

  /**
   * Loads configuration from `config.json` and merges it with provided options.
   * @param {Object} options - Optional configuration overrides.
   * @returns {Promise<void>}
   */
  async _loadConfig(options) {
    try {
      console.log("Loading configuration from config.json...");
      const response = await fetch("config.json");
      const externalConfig = await response.json();
      this.config = { ...externalConfig, ...options }; // Merge external config with options
      console.log("Configuration successfully loaded.");
      if (!this.config.dataUrl) {
        this.config.dataUrl = "ticker-data.json"; // Default value
      }
    } catch (error) {
      console.error("Failed to load configuration:", error);
      this.config = { ...options }; // Fallback to provided options
      if (!this.config.dataUrl) {
        this.config.dataUrl = "ticker-data.json"; // Default value
      }
    }
  }

  /**
   * Applies the theme (dark or light mode) and ticker position (top or bottom).
   */
  _applyTheme() {
    console.log(
      "Applying theme:",
      this.config.darkMode ? "Dark Mode" : "Light Mode"
    );
    document.body.classList.add(
      this.config.darkMode ? "dark-mode" : "light-mode"
    );
    document.body.classList.add(
      this.config.position === "top" ? "ticker-top" : "ticker-bottom"
    );
  }

  /**
   * Dynamically applies styles to the document using CSS variables.
   */
  _applyStyles() {
    console.log("Applying styles...");
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
    document.documentElement.style.setProperty(
      "--ticker-padding",
      this.config.tickerPadding
    );
    document.documentElement.style.setProperty(
      "--ticker-height",
      this.config.tickerHeight
    );
    document.documentElement.style.setProperty(
      "--ticker-item-margin",
      this.config.tickerItemMargin
    );
    document.documentElement.style.setProperty(
      "--focus-outline-color",
      this.config.focusOutlineColor
    );
  }

  /**
   * Binds event listeners for resize, keyboard, and pause button interactions.
   */
  _bindEvents() {
    console.log("Binding events...");
    window.addEventListener("resize", () => {
      console.log("Window resized.");
      if (this.resizeTimer) clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        if (!this.isPaused) this._applyAnimationSpeed();
      }, 250);
    });

    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" && document.activeElement === this.ticker) {
        e.preventDefault();
        console.log("Spacebar pressed. Toggling pause.");
        this.togglePause();
      }
    });

    const pauseButton = document.getElementById("ticker-pause");
    if (pauseButton) {
      pauseButton.addEventListener("click", () => {
        console.log("Pause button clicked.");
        this.togglePause();
      });
    }
  }

  /**
   * Fetches ticker data from the configured `dataUrl`.
   */
  fetchData() {
    console.log("Fetching data from:", this.config.dataUrl);
    this.showError(null);

    fetch(this.config.dataUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load ticker data.");
        return res.json();
      })
      .then((data) => {
        console.log("Data fetched successfully:", data);
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
        console.error("Error fetching data:", err);
        if (this.retryCount < this.config.retryAttempts) {
          this.retryCount++;
          console.log(`Retrying fetch... Attempt ${this.retryCount}`);
          setTimeout(() => this.fetchData(), this.config.retryDelay);
          this.showError(
            `Loading ticker data... (Attempt ${this.retryCount}/${this.config.retryAttempts})`
          );
        } else {
          this.showError(err.message);
        }
      });
  }

  /**
   * Displays an error message in the ticker error box.
   * @param {string|null} message - The error message to display, or `null` to hide the error box.
   */
  showError(message) {
    if (!message) {
      this.errorBox.style.display = "none";
      return;
    }
    this.errorBox.textContent = message;
    this.errorBox.style.display = "block";
  }

  /**
   * Hides the error box.
   */
  hideError() {
    this.errorBox.style.display = "none";
  }

  /**
   * Shows the ticker with optional content.
   * @param {string} content - Content to display in the ticker.
   */
  showTicker(content) {
    this.wrapper.style.display = "block";
    this.wrapper.setAttribute("aria-hidden", "false");
    if (content) this.ticker.textContent = content;
  }

  /**
   * Hides the ticker.
   */
  hideTicker() {
    this.wrapper.style.display = "none";
    this.wrapper.setAttribute("aria-hidden", "true");
  }

  /**
   * Initializes the ticker with the provided items.
   * @param {Array<Object>} items - Array of ticker items.
   */
  initTicker(items) {
    console.log("Initializing ticker with items:", items);
    this.showTicker("");

    const fullItems = [...items, ...items]; // Duplicate items for seamless scrolling
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

      const title = document.createElement("strong");
      title.textContent = item.title || "Untitled";

      // Only add dots if the content is truncated at the 50th character
      const isTruncated = item.content.length > 50;
      const contentText = isTruncated
        ? item.content.slice(0, 50) + "..." // Append dots directly without space
        : item.content;
      const content = document.createTextNode(contentText);

      link.setAttribute("data-full-content", item.content);

      link.appendChild(title);
      link.appendChild(content);
      span.appendChild(link);
      this.ticker.appendChild(span);
    });

    console.log("Ticker items added to DOM.");
    this._applyAnimationSpeed();
    this._addInteractionListeners();
  }

  /**
   * Applies animation speed based on a default fast speed and scales it using the `speed` configuration.
   */
  _applyAnimationSpeed() {
    const speed = this.config.speed || 1; // Default to 1 (fastest) if not set
    const baseDuration = 10; // Default fast duration in seconds
    const scaledDuration = baseDuration * speed; // Scale duration based on speed

    console.log(
      `Applying animation speed. Speed: ${speed}, Duration: ${scaledDuration}s`
    );

    this.ticker.style.animationDuration = `${scaledDuration}s`;
    this.ticker.style.animationDirection = this.config.rtl
      ? "reverse"
      : "normal";
  }

  /**
   * Adds interaction listeners for mouse, touch, and keyboard events.
   */
  _addInteractionListeners() {
    console.log("Adding interaction listeners...");
    this.ticker.addEventListener("mouseover", (event) => {
      const target = event.target.closest(".ticker-item a");
      if (target) {
        console.log("Mouseover on ticker item:", target.textContent);
        this.pauseTicker();
        this._showPopup(target);
      }
    });

    this.ticker.addEventListener("touchstart", (event) => {
      const target = event.target.closest(".ticker-item a");
      if (target) {
        event.preventDefault();
        console.log("Touchstart on ticker item:", target.textContent);
        this.pauseTicker();
        this._showPopup(target);
      }
    });

    this.ticker.addEventListener("focusin", (event) => {
      const target = event.target.closest(".ticker-item a");
      if (target) {
        console.log("Focusin on ticker item:", target.textContent);
        this.pauseTicker();
        this._showPopup(target);
      }
    });
  }

  /**
   * Shows a popup with detailed information about a ticker item.
   * @param {HTMLElement} target - The ticker item link element.
   */
  _showPopup(target) {
    console.log("Showing popup for:", target.textContent);
    this._removeAllPopups();

    const title = target.querySelector("strong").textContent;
    const fullContent = target.getAttribute("data-full-content");
    const url = target.href.replace(/^https?:\/\//, "");

    const popup = document.createElement("div");
    popup.className = "ticker-popup";
    popup.setAttribute("role", "tooltip");
    popup.setAttribute("tabindex", "0");

    const titleElement = document.createElement("h3");
    titleElement.className = "ticker-popup-title";
    titleElement.textContent = title;

    const contentElement = document.createElement("div");
    contentElement.className = "ticker-popup-content";
    contentElement.textContent = fullContent;

    const urlElement = document.createElement("div");
    urlElement.className = "ticker-popup-link";
    urlElement.textContent = url;

    popup.appendChild(titleElement);
    popup.appendChild(contentElement);
    popup.appendChild(urlElement);

    document.body.appendChild(popup);

    console.log("Popup added to DOM.");
    const rect = target.getBoundingClientRect();
    const isTickerAtTop = document.body.classList.contains("ticker-top");

    let popupLeft = rect.left + rect.width / 2 - popup.offsetWidth / 2;

    const viewportWidth = window.innerWidth;
    if (popupLeft < 10) {
      popupLeft = 10;
    } else if (popupLeft + popup.offsetWidth > viewportWidth - 10) {
      popupLeft = viewportWidth - popup.offsetWidth - 10;
    }

    if (isTickerAtTop) {
      popup.style.top = `${rect.bottom + window.scrollY + 50}px`;
    } else {
      popup.style.top = `${
        rect.top + window.scrollY - popup.offsetHeight - 50
      }px`;
    }

    popup.style.left = `${popupLeft}px`;

    requestAnimationFrame(() => popup.classList.add("show"));

    const removePopup = () => {
      console.log("Removing popup.");
      this._removePopup(popup);
      this.resumeTicker();
    };

    target.addEventListener("mouseleave", removePopup, { once: true });
    target.addEventListener("blur", removePopup, { once: true });

    if ("ontouchstart" in window) {
      setTimeout(removePopup, 3000);
    }
  }

  /**
   * Removes a specific popup element.
   * @param {HTMLElement} popup - The popup element to remove.
   */
  _removePopup(popup) {
    if (!popup) return;
    popup.classList.remove("show");
    setTimeout(() => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    }, 300);
  }

  /**
   * Removes all popups from the DOM.
   */
  _removeAllPopups() {
    const popups = document.querySelectorAll(".ticker-popup");
    popups.forEach((popup) => this._removePopup(popup));
  }

  /**
   * Pauses the ticker animation.
   */
  pauseTicker() {
    console.log("Pausing ticker.");
    this.ticker.classList.add("paused");
    this.isPaused = true;
  }

  /**
   * Resumes the ticker animation.
   */
  resumeTicker() {
    console.log("Resuming ticker.");
    this.ticker.classList.remove("paused");
    this.isPaused = false;
  }

  /**
   * Toggles the ticker animation between paused and running states.
   */
  togglePause() {
    if (this.isPaused) {
      this.resumeTicker();
    } else {
      this.pauseTicker();
    }

    const pauseButton = document.getElementById("ticker-pause");
    if (pauseButton) {
      pauseButton.setAttribute("aria-pressed", this.isPaused);
      pauseButton.textContent = this.isPaused ? "Play" : "Pause";
    }
  }

  /**
   * Updates the ticker configuration and reapplies styles and animations.
   * @param {Object} newConfig - New configuration options to merge.
   * @returns {Ticker} The updated Ticker instance.
   */
  updateConfig(newConfig) {
    console.log("Updating configuration:", newConfig);
    this.config = { ...this.config, ...newConfig };
    this._applyTheme();
    this._applyAnimationSpeed();
    this._applyStyles();
    return this;
  }
}

// Initialize the ticker when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded. Initializing Ticker...");
  const ticker = new Ticker();
  window.tickerApp = ticker; // Make ticker accessible globally if needed
});

# Responsive News Ticker

This project is a **proof-of-concept** for a responsive news ticker that can be used in future websites. It demonstrates how to fetch, display, and interact with dynamic content in a visually appealing and accessible way.

> **Inspiration**: This project was inspired by the news ticker at the bottom of the [Washington Post](https://washingtonpost.com) homepage.

## Features

- **Dynamic Content**: Fetches news items from a JSON file (`ticker-data.json`) and displays them in a scrolling ticker.
- **Responsive Design**: Adapts to different screen sizes and ensures the ticker is always visible.
- **Speech Bubble Popups**: Displays detailed information about each news item in a speech bubble when hovered or focused.
- **Configurable Options**:
  - Ticker speed and direction.
  - Dark mode and light mode support.
  - Speech bubble font sizes and background color.
- **Accessibility**: Includes ARIA roles and keyboard navigation support.

## Demo

https://v0-ticker.netlify.app/

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd webdev/v0-icjia-ticker
   ```

2. Start a local server to serve the project files. For example, using Python:

   ```bash
   python3 -m http.server
   ```

3. Open your browser and navigate to `http://localhost:8000` to view the ticker.

   > **Note**: The project requires a server to fetch the JSON file. Opening `index.html` directly in the browser will result in a CORS error. 
   > CORS (Cross-Origin Resource Sharing) is a security feature implemented by web browsers to prevent unauthorized access to resources from a different origin (domain, protocol, or port). When you open `index.html` directly by clicking on it, the browser treats the file as being served from the `file://` protocol. This causes a CORS error when the JavaScript code tries to fetch the `ticker-data.json` file because the browser blocks the request for security reasons.

To avoid this issue, you must serve the project files through a local server (e.g., using Python, Node.js, or any other server) so that the browser treats the files as being served from the same origin.

## Configuration

You can customize the ticker by modifying the `Ticker` class in `script.js`. The following options are available:

- `dataUrl`: URL of the JSON file containing the news items (default: `"ticker-data.json"`).
- `baseSpeed`: Base speed of the ticker (default: `16`).
- `speedMultiplier`: Multiplier for ticker speed (default: `14`).
- `rtl`: Set to `true` for right-to-left scrolling (default: `false`).
- `darkMode`: Enable or disable dark mode (default: `true`).
- `position`: Position of the ticker (`"top"` or `"bottom"`, default: `"bottom"`).
- `retryAttempts`: Number of retry attempts for fetching data (default: `3`).
- `retryDelay`: Delay in milliseconds between retry attempts (default: `2000`).
- `bubbleTitleFontSize`: Font size for the speech bubble title (default: `"14px"`).
- `bubbleContentFontSize`: Font size for the speech bubble content (default: `"12px"`).
- `bubbleBackgroundColor`: Background color for the speech bubble (default: `"#fff"`).
- `tickerBackgroundColor`: Background color for the ticker (default: `"#222"`).
- `tickerTextColor`: Text color for the ticker (default: `"#fff"`).

## File Structure

```
/home/<username>/webdev/v0-icjia-ticker
├── index.html         # Main HTML file
├── style.css          # Styles for the ticker and speech bubble
├── script.js          # JavaScript logic for the ticker
├── ticker-data.json   # JSON file containing news items
├── LICENSE.md         # MIT License
└── README.md          # Project documentation
```

## Future Enhancements

- Add support for fetching data from an API.
- Include more advanced animations and transitions.
- Improve accessibility for screen readers.

## License

This project is licensed under the [MIT License](LICENSE.md).

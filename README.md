# Responsive News Ticker

This project is a **proof-of-concept** for a responsive news ticker that can be used in future websites. It demonstrates how to fetch, display, and interact with dynamic content in a visually appealing and accessible way.

## Features

- **Dynamic Content**: Fetches news items from a JSON file (`ticker-data.json`) and displays them in a scrolling ticker.
- **Responsive Design**: Adapts to different screen sizes and ensures the ticker is always visible.
- **Speech Bubble Popups**: Displays detailed information about each news item in a speech bubble when hovered or focused.
- **Configurable Options**:
  - Ticker speed and direction.
  - Dark mode and light mode support.
  - Speech bubble font sizes and background color.
- **Accessibility**: Includes ARIA roles and keyboard navigation support.

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

## Configuration

You can customize the ticker by modifying the `Ticker` class in `script.js`. The following options are available:

- `dataUrl`: URL of the JSON file containing the news items (default: `ticker-data.json`).
- `baseSpeed`: Base speed of the ticker (default: `16`).
- `speedMultiplier`: Multiplier for ticker speed (default: `14`).
- `rtl`: Set to `true` for right-to-left scrolling (default: `false`).
- `darkMode`: Enable or disable dark mode (default: `true`).
- `position`: Position of the ticker (`"top"` or `"bottom"`, default: `"bottom"`).
- `bubbleTitleFontSize`: Font size for the speech bubble title (default: `"14px"`).
- `bubbleContentFontSize`: Font size for the speech bubble content (default: `"12px"`).
- `bubbleBackgroundColor`: Background color for the speech bubble (default: `"#fff"`).

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

## Usage

1. Add your news items to `ticker-data.json` in the following format:

   ```json
   {
     "items": [
       {
         "title": "Breaking News",
         "content": "This is a detailed description of the news item.",
         "url": "https://example.com/news"
       }
     ]
   }
   ```

2. Start a local server and open the project in your browser to see the ticker in action.

## Future Enhancements

- Add support for fetching data from an API.
- Include more advanced animations and transitions.
- Improve accessibility for screen readers.

## License

This project is licensed under the [MIT License](LICENSE.md).

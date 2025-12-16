# CSS Inspect Chrome Extension

*Disclaimer: This is a vibecoded project (For Chromium based browsers).*

A lightweight Chrome extension for inspecting CSS properties, box models, and typography in real-time.

While the extension is functional, I plan to make further changes and refinements in the future. I built this quickly for one of my use cases, and I’m sharing it as open source so anyone can clone the repository, use it, or build on top of it.


## Features

*   **Live Inspection:** Hover over any element to see computed styles immediately.
* **Freezes the Info Card:** Freeze the info card (Alt + Click) so you can select text inside it.
* **Copy CSS:** Copy the element's styles to clipboard (Ctrl + Shift + Click).
* **Close Inspector:** Close the inspector (Esc).

## Installation

Since this extension is not published on the Chrome Web Store, you must install it manually in Developer Mode.

1.  **Clone or Download:**
    Clone this repository to your local machine or download the source code as a ZIP file and extract it.

2.  **Open Extensions Management:**
    Open Google Chrome and navigate to the following URL:
    `chrome://extensions/`

3.  **Enable Developer Mode:**
    In the top-right corner of the Extensions page, toggle the switch for **Developer mode** to ON.

4.  **Load Unpacked Extension:**
    Click the **Load unpacked** button that appears in the top-left area. Select the folder containing the extension files (the folder where `manifest.json` is located).

5.  **Pin the Extension:**
    Click the puzzle piece icon in your Chrome toolbar and click the **Pin** icon next to "CSS Inspect" to keep it accessible.
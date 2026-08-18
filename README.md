# CSS Inspect

> Disclaimer: This is a (90% LLMs + 10% me) vibecoded project (For Chromium based browsers).

A lightweight, high-performance Chrome DevTools extension for inspecting CSS properties, authored variables, pseudo-states and box model geometries.

*While the extension is functional, I plan to make further changes and refinements in the future. I built this quickly for one of my use cases, and I’m sharing it as open source so anyone can clone the repository, use it, or build on top of it.*

---

## Features

* **Real-Time Live Inspection:** Hover over any DOM element to instantly view its tag hierarchy, dimensions, typography, layout properties, and box model.
* **Authored Styles & CSS Variable Resolution:** View authored stylesheet rules alongside computed values, with dynamic recursive resolution for CSS custom properties (`var(--...)`).
* **Pseudo-Class Inspection:** Toggle between `Normal`, `:hover`, `:active`, and `:focus` states. Indicators highlight when matching stylesheet rules exist.
* **Freeze & Lock Selection:** <kbd>Ctrl</kbd> + <kbd>Click</kbd> (or <kbd>Cmd</kbd> + <kbd>Click</kbd>) any element to lock the inspector on it. Click anywhere or press <kbd>Esc</kbd> to unlock.
* **DOM Hierarchy Navigation:**
  * <kbd>↑</kbd> Select Parent Element
  * <kbd>↓</kbd> Select First Child Element
  * <kbd>←</kbd> / <kbd>→</kbd> Select Previous / Next Sibling
  * Clickable DOM breadcrumb bar in header
* **Copy Code:**
  * **CSS Rules:** Matched stylesheet declarations including base, `:hover`, and `:active` blocks.
  * **React Style:** CamelCase JSX `style={{ ... }}` objects
* **Screen-Corner Docking:** Toggle HUD placement across all 4 screen corners (Top-Left, Top-Right, Bottom-Left, Bottom-Right).

---

## Shortcuts

| Action | Shortcut |
| :--- | :--- |
| **Lock / Unlock Element** | <kbd>Ctrl</kbd> + <kbd>Click</kbd> (or <kbd>Cmd</kbd> + <kbd>Click</kbd>) |
| **Parent / Child Element** | <kbd>↑</kbd> / <kbd>↓</kbd> |
| **Sibling Element** | <kbd>←</kbd> / <kbd>→</kbd> |
| **Unlock / Close** | <kbd>Esc</kbd> |

---

## Installation

Clone this repo somehwere in your system. 

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select the repository you just cloned.
4. Pin **CSS Inspect** to your toolbar or use <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd>.
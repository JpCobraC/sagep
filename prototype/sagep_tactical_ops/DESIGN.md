# Design System Specification: Tactical Intelligence & Operational Depth

## 1. Overview & Creative North Star: "The Digital Vanguard"
The Creative North Star for this design system is **"The Digital Vanguard."** In a high-stakes police management environment, the UI must feel like a precision instrument—authoritative, calm, and hyper-functional. 

We move beyond the "standard dashboard" by treating the interface as a tactical heads-up display (HUD). This is achieved through **Intentional Asymmetry** (using sidebar widths and data densities to guide the eye), **Tonal Depth** (layering navy hues rather than using lines), and **Typographic Authority** (mixing clean sans-serifs with mono-spaced data). The goal is a "Zero-G" layout where elements feel suspended in a dark, cohesive digital ether.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep operational navies, utilizing high-contrast accents to highlight critical data points.

### The "No-Line" Rule
To maintain a premium, high-tech feel, **1px solid borders for sectioning are strictly prohibited.** Boundaries must be defined by:
1.  **Tonal Shifts:** Placing a `surface-container-high` card against a `surface` background.
2.  **Luminous Depth:** Using subtle inner glows or background color transitions.

### Surface Hierarchy & Nesting
The UI is a series of stacked, semi-transparent layers. Use the following hierarchy to define importance:
*   **Background (`#0c1321`):** The base canvas.
*   **Surface-Container-Lowest (`#070e1b`):** Recessed areas (e.g., search bars, inset utility panels).
*   **Surface-Container (`#19202d`):** Primary workspace containers.
*   **Surface-Container-Highest (`#2e3543`):** Floating modals or active state panels.

### The "Glass & Gradient" Rule
For top-level navigation and floating "Quick Action" bars, use **Glassmorphism**:
*   **Background:** `surface-variant` at 40% opacity.
*   **Effect:** `backdrop-blur: 12px`.
*   **Signature Texture:** Use a linear gradient (`primary` to `primary-container`) for high-impact titles and primary CTAs to inject "visual soul" into the tactical environment.

---

## 3. Typography: The Command Hierarchy
The typography system balances the approachability of **Inter** with the technical precision of **JetBrains Mono**.

| Level | Token | Font | Purpose |
| :--- | :--- | :--- | :--- |
| **Display** | `display-lg/md` | Inter (Bold) | Hero stats and critical incident counts. |
| **Headline** | `headline-md` | Inter (Semi-Bold) | Section headers; utilizes subtle text gradients. |
| **Title** | `title-sm` | Inter (Medium) | Card titles and navigational labels. |
| **Body** | `body-md` | Inter (Regular) | Narrative reports and officer logs. |
| **Data/ID** | `label-md` | JetBrains Mono | Case numbers, timestamps, and coordinates. |

*   **Tactical Note:** Use JetBrains Mono for all numerical data. This ensures "tabular lining," where numbers align vertically, making it easier for officers to scan IDs and timestamps rapidly.

---

## 4. Elevation & Depth
In this system, elevation is a product of light and opacity, not just shadow.

*   **The Layering Principle:** Instead of shadows, use **Surface-Container Tiers**. A `surface-container-low` panel sitting on a `surface` background creates a natural, sophisticated lift.
*   **Ambient Shadows:** For floating elements (Modals/Popovers), use an extra-diffused shadow: `shadow-[0_20px_50px_rgba(0,0,0,0.5)]`. The shadow should feel like a soft atmospheric occlusion, not a hard drop.
*   **The "Ghost Border" Fallback:** When separation is vital for accessibility, use a **Ghost Border**: `outline-variant` at 15% opacity. This provides a "hint" of a boundary without cluttering the tactical aesthetic.

---

## 5. Components: Tactical Implementation

### Buttons (The Action Triggers)
*   **Primary:** High-vibrancy `primary` background. Apply a 10% vertical gradient. Border-radius: `md` (0.375rem).
*   **Secondary (Tactical):** `surface-container-highest` background with a `ghost-border`. 
*   **Tertiary:** Transparent background, `primary` text, uppercase `label-md` for a "low-profile" look.

### Input Fields (Data Entry)
*   **Style:** `surface-container-lowest` background. 
*   **State:** On focus, the ghost border becomes `primary` at 50% opacity with a subtle `primary` outer glow (2px blur).
*   **Typography:** User input uses `body-md`, while labels use `label-sm` in `on-surface-variant`.

### Cards & Lists (The Dossier Style)
*   **Rule:** **Forbid divider lines.** 
*   **Implementation:** Use `8px` of vertical whitespace (Spacing Scale) and a subtle shift from `surface-container` to `surface-container-low` to distinguish between list items.
*   **Tactical Element:** Every card containing a case or officer should feature a 2px vertical "accent stripe" on the left edge using `primary` (Active), `secondary` (Pending), or `error` (Urgent) tokens.

### Tactical Chips
*   **Status Chips:** Use a `surface-variant` background with a small circular "LED" indicator colored with `tertiary` (Confirmations) or `secondary` (Alerts).

---

## 6. Do's and Don'ts

### Do:
*   **DO** use JetBrains Mono for all timestamps and IDs.
*   **DO** lean into "Breathing Room." High-stakes data requires whitespace to prevent cognitive overload.
*   **DO** use `backdrop-blur` on navigation overlays to maintain a sense of context.
*   **DO** use intentional asymmetry in dashboard layouts to prioritize the "Active Incident" panel.

### Don't:
*   **DON'T** use pure black (#000) or pure white (#FFF). Use the defined `surface` and `on-surface` tokens to maintain the navy-tonal depth.
*   **DON'T** use 100% opaque borders. They break the "Vanguard" HUD illusion.
*   **DON'T** use standard system fonts. Stick strictly to the Inter/JetBrains Mono pairing.
*   **DON'T** clutter the UI with icons. Use icons sparingly as "functional anchors" rather than "decorative flourishes."

---

## 7. Tailwind CSS v4 Configuration Snippet
# Design System Philosophy: The Precision Architect

This design system is built on the concept of **Precision Architecting**. We are moving away from the "standard startup" look to create a high-end, editorial-grade interface that balances the structural rigor of Linear with the approachability of a local unicorn. 

Our mission is to convey trust through flawless alignment, innovation through glassmorphism, and a friendly personality through generous, soft geometry. We don't use lines to separate ideas; we use space and tonal depth to define them.

---

## 1. Creative North Star: "Sophisticated Utility"
The "Sophisticated Utility" approach rejects the cluttered, line-heavy interfaces of the past. Instead, we use:
*   **Intentional Asymmetry:** Breaking the grid occasionally to draw the eye to key CTAs.
*   **Tonal Layering:** Using color shifts rather than borders to create hierarchy.
*   **Editorial Scaling:** High-contrast typography that makes every page feel like a premium publication.

---

## 2. Color & Tonal Architecture

Our palette is anchored by a Deep Emerald Green, symbolizing growth and trust in the Indonesian market.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders are prohibited for sectioning or containment. Boundaries must be defined solely through background color shifts or subtle tonal transitions. 
*   Use `surface` (#faf8ff) for the base background.
*   Use `surface-container-low` (#f2f3ff) for secondary sections.
*   Use `surface-container-highest` (#dae2fd) for deeply nested content or utility sidebars.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—stacked sheets of fine paper or frosted glass.
1.  **Level 0 (Base):** `surface`
2.  **Level 1 (Sectioning):** `surface-container-low`
3.  **Level 2 (Cards/Interaction):** `surface-container-lowest` (#ffffff) — This creates a "lifted" effect when placed on a darker surface.

### The "Glass & Gradient" Rule
To achieve a signature look, floating elements (Modals, Hover Menus) must use **Glassmorphism**.
*   **Background:** `surface-container-lowest` at 80% opacity.
*   **Effect:** `backdrop-blur: 20px`.
*   **Gradients:** CTAs should utilize a subtle linear gradient: `primary` (#006d38) to `primary_container` (#00aa5b) at a 135-degree angle. This provides a "soul" to the primary actions.

---

## 3. Typography: The Editorial Voice

We utilize a dual-typeface system to balance authority with modern utility.

*   **Display & Headlines (Plus Jakarta Sans):** Chosen for its modern, friendly, yet professional Indonesian heritage. Use `display-lg` (3.5rem) with tight letter spacing (-0.02em) for hero sections to create an "Editorial" impact.
*   **Body & Labels (Inter):** The industry standard for legibility. Use `body-md` (0.875rem) for the majority of UI text to maintain a high-density, "utility" feel similar to Linear or Stripe.

**Hierarchy Tip:** Always skip a size when creating contrast (e.g., pair a `headline-md` with a `body-sm`). This creates the "breathing room" required for a premium feel.

---

## 4. Elevation & Depth: Ambient Tonalism

We do not use shadows to create "pop"; we use them to simulate "presence."

*   **The Layering Principle:** Depth is achieved by stacking. A `surface-container-lowest` card sitting on a `surface-container-low` background provides a natural, soft lift without needing a drop shadow.
*   **Ambient Shadows:** For "floating" elements like Popovers or Modals, use: `box-shadow: 0 4px 20px rgba(19, 27, 46, 0.05)`. Note the use of `on-surface` (#131b2e) as the shadow tint rather than pure black.
*   **The "Ghost Border":** If a boundary is strictly required for accessibility, use the `outline-variant` token (#bccabc) at **15% opacity**. This creates a suggestion of a border rather than a hard line.

---

## 5. Component Logic

### Buttons (High-Impact)
*   **Primary:** Gradient of `primary` to `primary_container`. Corner radius: `DEFAULT` (1rem/16px).
*   **Secondary:** `secondary_container` background with `on_secondary_container` text. No border.
*   **Tertiary:** Ghost style. `primary` text color, background appears only on hover at 8% opacity.

### Input Fields
*   **Style:** `surface-container-lowest` background with a `Ghost Border`.
*   **States:** On focus, the border transitions to 100% opacity `primary` (#006d38) with a 4px soft glow using the primary color at 10% opacity.

### Cards & Lists
*   **Forbidden:** 1px horizontal dividers.
*   **Execution:** Separate list items using 8px of vertical white space or by alternating background colors between `surface` and `surface-container-low`.
*   **Rounding:** All cards must use `md` (1.5rem) or `lg` (2rem) corner radius to lean into the "Friendly" personality.

### Signature Component: The "Trust Badge"
For the BANTU context, use a "Trust Badge" chip: `primary_fixed` background with `on_primary_fixed` text, using a `full` (9999px) radius and a small 4px emerald pulse animation to indicate "Verified" status.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use extreme whitespace. If you think there is enough padding, add 16px more.
*   **Do** use Plus Jakarta Sans for any text larger than 1.5rem.
*   **Do** use `surface-container-lowest` (pure white) for the primary content area to maximize readability.
*   **Do** use "Ghost Borders" for complex data tables where background shifts aren't enough.

### Don't:
*   **Don't** use `#000000` for text. Use `on_surface` (#131b2e) for high contrast and `on_surface_variant` (#3d4a3f) for secondary text.
*   **Don't** use standard 4px or 8px corners. Our identity is defined by the soft `16px+` (1rem+) curves.
*   **Don't** use traditional "Material" ripples. Use soft opacity fades (0.1s ease-in-out) for hover states.
*   **Don't** ever use a solid grey divider line. It breaks the "Sophisticated Utility" flow.
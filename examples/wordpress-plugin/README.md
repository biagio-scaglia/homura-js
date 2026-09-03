# Homura Time Travel & Form Recovery (WordPress Plugin)

[![WordPress Plugin](https://img.shields.io/badge/WordPress.org-Plugin%20Directory-21759b?logo=wordpress&logoColor=white)](https://wordpress.org/plugins/homura-time-travel-form-recovery/)
[![Version](https://img.shields.io/badge/version-v1.2.12-7c3aed)](https://wordpress.org/plugins/homura-time-travel-form-recovery/)
[![License](https://img.shields.io/badge/license-GPLv2-3b0764)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-7.4%2B-blue)](https://www.php.net/)
[![WordPress](https://img.shields.io/badge/WordPress-5.8%20--%207.1-21759b)](https://wordpress.org/)

Bring Git-like local state history, multidevice QR handoff, sensory Ghost Assist, zero-knowledge WebCrypto vault, and non-destructive DAG time-travel to **WordPress**, **WooCommerce**, and **Static Websites**.

🔗 **Official WordPress.org Plugin Directory**: [https://wordpress.org/plugins/homura-time-travel-form-recovery/](https://wordpress.org/plugins/homura-time-travel-form-recovery/)

---

## 🌟 What's New in v1.4.0

* 📱 **Multidevice Time-Travel ("Passaggio di Testimone" `[homura_handoff]`)**: Generate dynamic client-side SVG QR codes allowing visitors to scan on desktop and immediately continue typing on mobile with the identical history timeline without registering an account.
* 👻 **Behavioral "Ghost Assist" (Sensory UX `[homura_ghost_assist]`)**: Proactively detects mass accidental deletions (>50% of paragraph) and rage-clicks, displaying a non-intrusive recovery toast with 1-click restore.
* 🔒 **Privacy-First Zero-Knowledge Local Vault (`crypto="aes-gcm"`)**: Native 256-bit AES-GCM encryption using browser WebCrypto API. Raw LocalStorage bytes are encrypted and unreadable by rogue third-party browser extensions.
* 📝 **Visual Copywriting Git Diff & Scrubber (`[homura_visual_diff]`)**: Real-time word-level difference inspector with historical slider for long textareas, articles, and forum posts.
* 🧬 **State Diff Engine (`[homura_diff]`)**: Visual comparison of form changes between the current DOM inputs and any saved draft.
* 🛡️ **WooCommerce AJAX Conflict Recovery**: Automatically detects when WooCommerce checkout recalculations (`update_order_review`, cart totals) wipe input values and instantly restores them without disrupting user flow.
* 🔐 **Zero-Leak Sensitive Field Policy**: Strict exclusion of passwords, CVVs, credit cards, payment nonces, and elements with `data-homura-sensitive="true"` (PCI-DSS & GDPR safe).
* 📦 **Smart Recovery Banner (`[homura_recovery_banner]`)**: Interactive prompt banner allowing visitors to restore drafts, inspect visual differences, or dismiss previous sessions.
* 🔄 **Form Schema Versioning & Migration**: Protects user drafts from breaking when form fields are added, renamed, or removed by webmasters.

---

## 🚀 Key Features

1. **Zero Data Loss / Form Crash Recovery**: Real-time client-side state tracking. If visitors accidentally close the tab or reload the page, their progress is instantly preserved and restored.
2. **Instant Undo & Redo**: Time-travel buttons for any form via shortcodes or HTML attributes.
3. **Auto-Hooks for Popular Form Engines & WooCommerce**:
   * **WooCommerce Checkout** (`.woocommerce-checkout`)
   * **Contact Form 7** (`.wpcf7 form`)
   * **WPForms** (`.wpforms-form`)
   * **Gravity Forms** (`.gform_wrapper`)
   * **Elementor Forms** (`.elementor-form`)
   * **Fluent Forms** (`.fluentform`)
   * **Ninja Forms** (`.nf-form-content form`)
   * **Formidable Forms** (`.frm-show-form`)
   * **WS Form** (`.wsf-form`)
4. **100% Client-Side Privacy**: All data resides strictly in visitor browser storage (LocalStorage/SessionStorage). Zero external server requests or remote tracking.
5. **Performance First**: Deferred script loading, passive event listeners, idle callbacks, zero render blocking.

---

## 📦 Installation

### Method 1: WordPress Admin (Recommended)
1. Go to **Plugins -> Add New** in your WordPress dashboard.
2. Search for **"Homura Time Travel"**.
3. Click **Install Now** and then **Activate**.

### Method 2: Manual Upload
1. Download the plugin zip from the [WordPress.org Plugin Directory](https://wordpress.org/plugins/homura-time-travel-form-recovery/).
2. Upload the folder to `/wp-content/plugins/` and activate it in the WordPress Admin.

---

## 🛠️ Complete Shortcodes Reference

| Shortcode | Parameters | Description |
| :--- | :--- | :--- |
| `[homura_form]` | `id`, `persist="localstorage"`, `debounce="200"`, `smart_recovery="false"` | Wraps any custom form with Homura state engine. |
| `[homura_undo]` | `form`, `label="↩ Undo"`, `class` | Renders a live Undo button. |
| `[homura_redo]` | `form`, `label="↪ Redo"`, `class` | Renders a live Redo button. |
| `[homura_status]` | `form`, `class` | Displays live saving / editing / restored status badge. |
| `[homura_breadcrumbs]` | `form`, `class` | Renders clickable timeline history breadcrumbs. |
| `[homura_recovery_banner]`| `form`, `message`, `restore_label`, `diff_label`, `dismiss_label` | Renders the interactive Smart Recovery Banner. |
| `[homura_diff]` | `form`, `label="🔍 View Changes"`, `class` | Opens modal showing visual diffs between DOM and draft. |
| `[homura_clear]` / `[homura_reset]` | `form`, `label="🗑️ Clear Draft"`, `class` | Purges saved storage draft and clears timeline. |
| `[homura_debug_export]` | `form`, `label="🛠️ Export Debug JSON"`, `class` | Downloads PII-masked debug payload for troubleshooting. |
| `[homura_wizard]` | `id`, `persist="localstorage"` | Wraps a multi-step form wizard with history navigation. |

---

## 💡 Usage Examples

### 1. Smart Recovery Form with Diff & Undo/Redo

```text
[homura_form id="lead_quote" persist="localstorage" smart_recovery="true"]
  [homura_recovery_banner form="lead_quote"]
  [homura_status form="lead_quote"]
  [homura_breadcrumbs form="lead_quote"]

  <p>
    <label>Name</label>
    <input type="text" name="customer_name" required />
  </p>
  <p>
    <label>Email</label>
    <input type="email" name="customer_email" required />
  </p>
  <p>
    <label>Project Details</label>
    <textarea name="project_notes"></textarea>
  </p>

  <div class="form-actions">
    [homura_undo form="lead_quote" label="↩ Undo"]
    [homura_redo form="lead_quote" label="↪ Redo"]
    [homura_diff form="lead_quote" label="🔍 Inspect Changes"]
    [homura_clear form="lead_quote" label="🗑️ Reset"]
  </div>
[/homura_form]
```

### 2. Multi-Step Form Wizard

```text
[homura_wizard id="checkout_wizard" persist="localstorage"]
  <div data-homura-step="1">
    <h3>Step 1: Contact Details</h3>
    <input type="text" name="billing_first_name" />
    <button type="button" data-homura-next>Next ➔</button>
  </div>
  <div data-homura-step="2">
    <h3>Step 2: Shipping Preference</h3>
    <input type="text" name="shipping_method" />
    <button type="button" data-homura-prev>⬅ Back</button>
    <button type="button" data-homura-next>Next ➔</button>
  </div>
  <div data-homura-step="3">
    <h3>Step 3: Review</h3>
    <button type="button" data-homura-prev>⬅ Back</button>
    <input type="submit" value="Complete Order" />
  </div>
[/homura_wizard]
```

---

## ⚡ Static Site / HTML Usage (Zero Build Tools)

Add Homura to any non-WordPress site (Webflow, Shopify, Squarespace, Static HTML) via CDN:

```html
<!-- Load HomuraJS Standalone Bundle from CDN -->
<script src="https://unpkg.com/@biagioscaglia/homurajs/dist/index.global.js"></script>

<!-- Add declarative data-homura attributes -->
<form data-homura-form="contact_form" data-homura-persist="localstorage" data-homura-smart-recovery="true">
  <span data-homura-status="contact_form"></span>
  <input type="text" name="name" placeholder="Name" />
  <input type="email" name="email" placeholder="Email" />
  
  <!-- Sensitive fields are automatically ignored -->
  <input type="password" name="password" />

  <button type="button" data-homura-undo>↩ Undo</button>
  <button type="button" data-homura-redo>↪ Redo</button>
  <button type="submit">Send</button>
</form>
```

---

## 📄 License

GPLv2 or later © [Biagio Scaglia](https://github.com/biagio-scaglia) & HomuraJS Team

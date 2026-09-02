# Homura Time Travel & Form Recovery (WordPress Plugin) 🔌

[![WordPress Plugin](https://img.shields.io/badge/WordPress.org-Plugin%20Directory-21759b?logo=wordpress&logoColor=white)](https://wordpress.org/plugins/homura-time-travel-form-recovery/)
[![Version](https://img.shields.io/badge/version-v1.2.5-7c3aed)](https://wordpress.org/plugins/homura-time-travel-form-recovery/)
[![License](https://img.shields.io/badge/license-GPLv2-3b0764)](LICENSE)

Bring time-travel debugging, non-destructive DAG state history, and zero-loss form recovery to **WordPress**, **WooCommerce**, and **Static Websites**.

🔗 **Official WordPress.org Plugin Directory**: [https://wordpress.org/plugins/homura-time-travel-form-recovery/](https://wordpress.org/plugins/homura-time-travel-form-recovery/)

---

## 🌟 Features

1. **Zero Data Loss / Form Crash Recovery**: Automatically saves user input into a local state DAG in real time. If the user accidentally closes the tab or refreshes the page, their progress is instantly restored.
2. **Instant Undo & Redo**: Adds time-travel undo and redo buttons to any form with simple shortcodes or HTML attributes.
3. **Auto-Hooks for Popular Form Engines**: Automatically detects and protects WooCommerce Checkout, Contact Form 7, WPForms, Gravity Forms, Elementor Forms, Fluent Forms, and Ninja Forms.
4. **Performance Optimized**: Deferred script loading, passive event listeners, zero render blocking.
5. **No Build Tools Required**: Works out of the box with zero external configuration.

---

## 📦 Installation

### Method 1: WordPress Admin (Recommended)
1. Go to **Plugins -> Add New** in your WordPress dashboard.
2. Search for **"Homura Time Travel"**.
3. Click **Install Now** and then **Activate**.

### Method 2: Manual Upload
1. Download the zip from [WordPress.org Plugin Directory](https://wordpress.org/plugins/homura-time-travel-form-recovery/).
2. Upload to `/wp-content/plugins/` and activate.

---

## 🚀 Shortcodes Usage

Use the shortcodes anywhere on pages, posts, or forms:

```text
[homura_form id="quote_request" persist="localstorage"]
  [homura_status form="quote_request"]
  [homura_breadcrumbs form="quote_request"]

  <!-- Your normal form fields here -->
  <input type="text" name="client_name" placeholder="Name" />
  <textarea name="project_details"></textarea>

  [homura_undo form="quote_request" label="↩ Undo"]
  [homura_redo form="quote_request" label="↪ Redo"]
  [homura_clear form="quote_request" label="🗑️ Clear Draft"]
[/homura_form]
```

---

## ⚡ Static Site / HTML Usage (Zero JS)

Include a single `<script>` in any HTML file (Webflow, Squarespace, Shopify, Static HTML):

```html
<!-- Load HomuraJS Standalone Bundle from CDN -->
<script src="https://unpkg.com/@biagioscaglia/homurajs/dist/index.global.js"></script>

<!-- Add data-homura-form and data-homura-undo / data-homura-redo attributes -->
<form data-homura-form="lead_form" data-homura-persist="localstorage">
  <input type="text" name="username" placeholder="Username" />
  <input type="email" name="email" placeholder="Email Address" />

  <button type="button" data-homura-undo>↩ Undo</button>
  <button type="button" data-homura-redo>↪ Redo</button>
</form>
```

---

## 📄 License

GPLv2 or later © Biagio Scaglia & HomuraJS Team

# HomuraJS WordPress Plugin & Static Site Integration 🔌

Bring time-travel debugging, non-destructive DAG state history, and zero-loss form recovery to **WordPress**, **WooCommerce**, and **Static Websites**.

---

## 🌟 Features

1. **Zero Data Loss / Form Crash Recovery**: Automatically saves user input into a local state DAG. If the user accidentally closes the tab or refreshes the page, their progress is instantly restored.
2. **Instant Undo / Redo**: Adds time-travel undo and redo buttons to any form with simple shortcodes or HTML attributes.
3. **No Build Tools Required**: Loads directly via CDN script tag (`unpkg` / `jsdelivr`).

---

## 📦 WordPress Installation

1. Copy the `homurajs-time-travel` folder into your WordPress `wp-content/plugins/` directory.
2. Go to **WordPress Admin -> Plugins** and click **Activate**.
3. Use the shortcodes anywhere on pages, posts, or forms:

```text
[homura_form id="quote_request" persist="localstorage"]
  <!-- Your normal form fields here -->
  <input type="text" name="client_name" placeholder="Name" />
  <textarea name="project_details"></textarea>

  [homura_undo form="quote_request" label="↩ Step Back"]
  [homura_redo form="quote_request" label="↪ Step Forward"]
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

MIT © Biagio Scaglia & HomuraJS Team

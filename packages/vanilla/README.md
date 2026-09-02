# @homura-js/vanilla 🍦

> Lightweight reactive DOM bindings and zero-JS declarative form crash-recovery engine for HomuraJS.

[![NPM Version](https://img.shields.io/npm/v/@homura-js/vanilla?color=7c3aed)](https://www.npmjs.com/package/@homura-js/vanilla)
[![License: MIT](https://img.shields.io/badge/License-MIT-3b0764.svg)](https://opensource.org/licenses/MIT)

`@homura-js/vanilla` provides zero-dependency DOM bindings for the HomuraJS Time Travel State Engine. It allows you to bind JavaScript state to DOM elements reactively and turn any HTML form into a resilient time-travel form with undo/redo, auto-recovery, schema migration, multi-step wizards, and automatic PII masking.

---

## Features

- **Reactive DOM Bindings (`bindState`)**: One-way reactive binding between HomuraJS state paths and DOM elements.
- **Smart Form Recovery (`bindForm`)**: Automatically tracks form inputs into an immutable DAG history with undo/redo and LocalStorage / SessionStorage persistence.
- **Zero-JS Declarative Auto-Init (`autoInitForms`)**: Add `data-homura-*` attributes to HTML forms without writing JavaScript.
- **AJAX & SPA Conflict Protection**: Seamlessly detect and restore form fields wiped by dynamic re-renders (`verifyIntegrityAndRestore`).
- **Smart Recovery Banner**: Offer users an interactive banner to restore saved drafts before overwriting DOM values.
- **Visual State Diff Inspection**: Extract user-friendly diffs between DOM values and historical states (`getDiffFromDom`).
- **Privacy & Security First**: Automatic filtering of sensitive fields (passwords, CVVs, nonces, credit cards) and PII masking (`maskPIIValue`, `exportDebugSnapshot`).
- **Multi-Step Form Wizard Support**: Built-in step navigation (`nextStep`, `prevStep`, `setStep`) with historical branching.

---

## Installation

```bash
npm install @homura-js/vanilla @homura-js/core
# or
pnpm add @homura-js/vanilla @homura-js/core
# or
yarn add @homura-js/vanilla @homura-js/core
```

---

## 1. Reactive DOM Binding (`bindState`)

Bind reactive state values directly to DOM selectors or elements:

```ts
import { createHomura, bindState } from '@homura-js/vanilla';

interface AppState {
  count: number;
  user: { name: string };
}

const homura = createHomura<AppState>({
  initialState: {
    count: 0,
    user: { name: 'Mario' }
  }
});

// Single binding
const binding = bindState(homura, {
  selector: s => s.count,
  target: '#counter-display'
});

// Array of bindings
bindState(homura, [
  { selector: s => s.count, target: '#counter-display' },
  { selector: s => s.user.name, target: '#user-display', transform: name => `Hello, ${name}!` }
]);

// Cleanup when done
binding.destroy();
```

---

## 2. Smart Form Binding (`bindForm`)

Bind any HTML form to an immutable time-travel controller:

```ts
import { bindForm } from '@homura-js/vanilla';

const formElement = document.querySelector<HTMLFormElement>('#checkout-form')!;

const controller = bindForm(formElement, {
  persist: 'localstorage',        // 'localstorage' | 'sessionstorage' | 'none'
  storageKey: 'checkout_draft',   // Custom storage key
  debounceMs: 200,                // Input debounce delay in ms
  smartRecovery: true,            // Show prompt banner instead of blind overwrite
  schemaVersion: '1.2',           // Schema version for migration
  excludeFields: ['custom_token'] // Custom sensitive fields / regex
});

// Controller API
controller.undo();                // Revert to previous form state
controller.redo();                // Advance back
controller.reset();               // Reset form and clear storage
controller.getDiffFromDom();      // Compare current DOM inputs against target state
controller.verifyIntegrityAndRestore(); // Re-populate fields if wiped by external script
controller.exportDebugSnapshot(); // Export safe, PII-masked JSON payload for debugging
controller.destroy();             // Remove event listeners and cleanup
```

---

## 3. Declarative HTML Forms (`autoInitForms`)

Initialize all forms marked with `data-homura-form` automatically:

```html
<form data-homura-form="lead_form" data-homura-persist="localstorage" data-homura-smart-recovery="true">
  <!-- Live status badge -->
  <span data-homura-status="lead_form"></span>

  <!-- Clickable timeline breadcrumbs -->
  <div data-homura-breadcrumbs="lead_form"></div>

  <input type="text" name="name" placeholder="Full Name" />
  <input type="email" name="email" placeholder="Email Address" />

  <!-- Sensitive inputs are automatically excluded from storage and snapshots -->
  <input type="password" name="password" />
  <input type="text" name="secret_code" data-homura-sensitive="true" />

  <!-- Undo & Redo buttons -->
  <button type="button" data-homura-undo="lead_form">Undo</button>
  <button type="button" data-homura-redo="lead_form">Redo</button>
</form>

<script type="module">
  import { autoInitForms } from '@homura-js/vanilla';
  autoInitForms();
</script>
```

---

## 4. Helper Utilities

`@homura-js/vanilla` exposes standalone helper functions for form processing:

```ts
import {
  extractFormData,
  populateFormData,
  isFieldSensitive,
  maskPIIValue
} from '@homura-js/vanilla';

// Extract key-value object from form while filtering sensitive fields
const data = extractFormData(formElement);

// Populate form inputs from a state object
populateFormData(formElement, { name: 'Mario', email: 'mario@example.com' });

// Check if an input field is sensitive
const isSecret = isFieldSensitive(inputElement);

// Mask PII values for safe logging / export
const safeEmail = maskPIIValue('email', 'contact@homurajs.dev'); // "c***@h***.dev"
```

---

## TypeScript API Reference

### Exported Functions
- `createHomura(config)`: Re-exported from `@homura-js/core`.
- `bindState(homura, config)`: Binds Homura state to DOM elements.
- `bindForm(form, options)`: Binds an HTML form to a state controller.
- `autoInitForms()`: Scans the DOM and initializes all `[data-homura-form]` elements.
- `extractFormData(form, customExclusions?)`: Extracts sanitized key-value data from a form.
- `populateFormData(form, state, customExclusions?)`: Populates DOM form inputs from state.
- `isFieldSensitive(el, customExclusions?)`: Checks if a form element holds sensitive data.
- `maskPIIValue(key, val)`: Masks emails, phone numbers, and names for privacy.

### Exported Types
- `StateBinding`, `DOMTarget`
- `FormBindingOptions<T>`, `FormBindingController<T>`, `FormDiffItem`
- `Homura<T>`, `HomuraConfig<T>`, `HistoryEntry<T>`

---

## License

MIT © [Biagio Scaglia](https://github.com/biagio-scaglia) & HomuraJS Team

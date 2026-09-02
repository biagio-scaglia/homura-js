=== Homura Time Travel & Form Recovery ===
Contributors: biagioscaglia
Donate link: https://github.com/biagio-scaglia/homura-js
Tags: time-travel, undo-redo, form-recovery, woocommerce, contact-form-7
Requires at least: 5.8
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.2.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Real-time Directed Acyclic Graph (DAG) state history, form crash recovery, and non-destructive undo/redo for WordPress & WooCommerce forms.

== Description ==

**Homura Time Travel & Form Recovery** brings "Git for application state" and bulletproof crash recovery to WordPress forms and WooCommerce checkout.

### 🌟 Key Features

* **Zero Data Loss / Form Crash Recovery**: Automatically captures keystrokes and selections into local browser storage. If a visitor accidentally closes the tab or refreshes the page, their entire form progress is restored.
* **Instant Undo & Redo**: Adds time-travel undo and redo buttons to any WordPress form with simple shortcodes or HTML attributes.
* **Auto-Hook for WooCommerce & Form Plugins**: Automatically detects and protects:
  * WooCommerce Checkout (`.woocommerce-checkout`)
  * Contact Form 7 (`.wpcf7 form`)
  * WPForms (`.wpforms-form`)
  * Gravity Forms (`.gform_wrapper`)
  * Elementor Forms (`.elementor-form`)
  * Fluent Forms (`.fluentform`)
  * Ninja Forms (`.nf-form-content form`)
  * Formidable Forms (`.frm-show-form`)
  * WS Form (`.wsf-form`)
* **Multi-Step Form Wizard**: Seamless support for multi-step questionnaires with state preservation across steps.
* **Performance First**: Deferred script execution (`wp_script_add_data`), passive event listeners, zero render blocking, and zero external tracking.
* **100% Free & Open Source**: GPLv2 licensed, zero remote executable code, zero third-party dependencies.

== Installation ==

1. Upload the `homura-time-travel-form-recovery` folder to the `/wp-content/plugins/` directory, or install via WordPress Plugin Admin.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Use the shortcodes in any page, post, or form.

== Frequently Asked Questions ==

= Does this plugin work with WooCommerce? =
Yes! It automatically detects the WooCommerce checkout form and saves billing/shipping fields locally so customers never lose their data on accidental refresh.

= Does it send data to any external server? =
No. All state tracking and time-travel history happens entirely on the client's browser (LocalStorage/SessionStorage). No data is sent to external servers.

= How do I add Undo and Redo buttons to my form? =
Use the shortcodes `[homura_undo form="my_form_id"]` and `[homura_redo form="my_form_id"]`.

= How can users clear a saved draft? =
Use the shortcode `[homura_clear form="my_form_id"]` or `[homura_reset form="my_form_id"]`.

== Screenshots ==

1. Time-travel controls and real-time form crash recovery.
2. History breadcrumbs and status indicators.

== Changelog ==

= 1.2.4 =
* Performance: Added deferred script loading strategy for WordPress 6.3+ (zero render blocking).
* Performance: Optimized event listener execution using passive event listeners and idle callbacks.
* Performance: Added `homura_should_enqueue_scripts` filter for selective conditional loading.
* Feature: Added auto-hooks for Fluent Forms, Ninja Forms, Formidable Forms, WS Form, and Gravity Forms.
* Feature: Added `[homura_clear]` / `[homura_reset]` shortcodes for one-click draft resetting.
* Feature: Added custom `class` attribute support across all shortcode wrappers.
* Compatibility: Full i18n translation loading and text domain registration.

= 1.2.3 =
* Initial release on WordPress.org Plugin Directory.
* Added auto-hooks for WooCommerce, Contact Form 7, WPForms, and Elementor.
* Added multi-step form wizard, status badges, and breadcrumb shortcodes.

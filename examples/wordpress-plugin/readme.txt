=== Homura Time Travel & Form State Engine ===
Contributors: biagioscaglia
Donate link: https://github.com/biagio-scaglia/homura-js
Tags: time-travel, undo-redo, form-recovery, woocommerce, contact-form-7
Requires at least: 5.8
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.3.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Git-like local state history, AJAX conflict recovery, and non-destructive time-travel for WordPress & WooCommerce forms.

== Description ==

**Homura Time Travel & Form State Engine** brings "Git for application state" and bulletproof state preservation to WordPress forms and WooCommerce checkout.

Rather than acting as a simple, destructive key-value autosave, Homura acts as an agnostic **client-side state history layer** built on top of your existing form builders. It tracks an immutable timeline of states, allowing users to undo/redo changes, recover from browser crashes or accidental refreshes, and protects against unexpected AJAX DOM wipes.

### 🌟 Key Features

* **🧬 State Diff Engine**: Inspect exactly what changed between the current form DOM and any saved draft with visual diff inspection.
* **🛡️ WooCommerce AJAX Conflict Recovery**: Automatically detects when WooCommerce checkout recalculations (`update_order_review`, cart totals) wipe input values and instantly restores them without disrupting user flow.
* **🔐 Zero-Leak Sensitive Field Policy**: Passwords, CVVs, credit card numbers, payment nonces, and inputs tagged with `data-homura-sensitive="true"` or `data-homura-persist="false"` are strictly excluded from state storage and LocalStorage.
* **📦 Smart Recovery & Time-Travel**: Prompt users with a non-intrusive recovery banner (`[homura_recovery_banner]`) allowing them to restore all, review differences, or dismiss previous drafts.
* **🔄 Form Schema Versioning & Migration**: Seamlessly handles forms edited or upgraded by webmasters without breaking or corrupting visitor drafts.
* **🧩 Conditional Field Memory**: Preserves user input for conditional fields when they are toggled or temporarily hidden by the form builder.
* **🕵️ Privacy-Aware Debug Export**: One-click sanitized export with masked PII (e.g. `m***@gmail.com`) for troubleshooting and support.
* **Auto-Hook for Form Builders & WooCommerce**:
  * WooCommerce Checkout (`.woocommerce-checkout`)
  * Contact Form 7 (`.wpcf7 form`)
  * WPForms (`.wpforms-form`)
  * Gravity Forms (`.gform_wrapper`)
  * Elementor Forms (`.elementor-form`)
  * Fluent Forms (`.fluentform`)
  * Ninja Forms (`.nf-form-content form`)
  * Formidable Forms (`.frm-show-form`)
  * WS Form (`.wsf-form`)
* **Performance First**: Deferred script execution (`wp_script_add_data`), passive event listeners, zero render blocking, and zero external tracking.
* **100% Client-Side & Local-First**: No data is sent to external servers or remote databases.

== Installation ==

1. Upload the `homura-time-travel-form-recovery` folder to the `/wp-content/plugins/` directory, or install via WordPress Plugin Admin.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Use the shortcodes in any page, post, or form.

== Frequently Asked Questions ==

= Does this plugin work with WooCommerce? =
Yes! It automatically detects the WooCommerce checkout form, protects against AJAX DOM resets, and preserves billing/shipping fields locally without saving sensitive credit card details or CVVs.

= Does it send data to any external server? =
No. All state tracking and time-travel history happens entirely on the client's browser (LocalStorage/SessionStorage). No data is sent to external servers.

= Are passwords and credit cards saved? =
No. Homura includes a strict Sensitive Field Policy that automatically filters out password fields, payment nonces, CVVs, credit card numbers, and any fields marked with `data-homura-sensitive="true"`.

= How do I add Undo and Redo buttons to my form? =
Use the shortcodes `[homura_undo form="my_form_id"]` and `[homura_redo form="my_form_id"]`.

= How can users clear a saved draft? =
Use the shortcode `[homura_clear form="my_form_id"]` or `[homura_reset form="my_form_id"]`.

= How do I display the Smart Recovery Banner? =
Use the shortcode `[homura_recovery_banner form="my_form_id"]` above your form.

== Screenshots ==

1. Time-travel controls and real-time form crash recovery.
2. State Diff modal showing changes between DOM and saved drafts.
3. History breadcrumbs and status indicators.

== Changelog ==

= 1.3.0 =
* Feature: Added State Diff Engine (`[homura_diff]` & DOM diffing) for visual comparison of form changes.
* Feature: Added WooCommerce AJAX Conflict Recovery & DOM-State Integrity Monitor to protect against checkout refreshes.
* Feature: Added Sensitive Field Policy (PCI-DSS/GDPR safe; auto-excludes passwords, CVVs, nonces, and `data-homura-sensitive`).
* Feature: Added Smart Recovery Banner (`[homura_recovery_banner]`) with Restore, Review Diff, and Dismiss options.
* Feature: Added Form Schema Versioning & Migration support (`homura_form_schema_version`).
* Feature: Added Sanitized Debug Export (`[homura_debug_export]`) with masked PII for safe dev diagnostics.
* Feature: Added Conditional Field Memory to preserve hidden conditional field values across toggles.
* Performance: Optimized passive listeners and state synchronization.

= 1.2.5 =
* Fix: Fixed `[homura_clear]` / `[homura_reset]` click handler to immediately purge LocalStorage draft, reset form inputs, and clear history timeline.
* Performance: Optimized draft reset synchronization without unnecessary page reload.

= 1.2.4 =
* Performance: Added deferred script loading strategy for WordPress 6.3+ (zero render blocking).
* Performance: Optimized event listener execution using passive event listeners and idle callbacks.
* Performance: Added `homura_should_enqueue_scripts` filter for selective conditional loading.
* Feature: Added auto-hooks for Fluent Forms, Ninja Forms, Formidable Forms, WS Form, and Gravity Forms.
* Feature: Added `[homura_clear]` / `[homura_reset]` shortcodes for one-click draft resetting.

= 1.2.3 =
* Initial release on WordPress.org Plugin Directory.
* Added auto-hooks for WooCommerce, Contact Form 7, WPForms, and Elementor.
* Added multi-step form wizard, status badges, and breadcrumb shortcodes.

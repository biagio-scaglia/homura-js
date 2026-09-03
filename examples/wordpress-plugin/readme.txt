=== Homura Time Travel & Form State Engine ===
Contributors: biagioscaglia
Donate link: https://github.com/biagio-scaglia/homura-js
Tags: time-travel, undo-redo, form-recovery, woocommerce, contact-form-7
Requires at least: 5.8
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.4.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Git-like local state history, multidevice QR handoff, sensory Ghost Assist, zero-knowledge WebCrypto vault, and non-destructive time-travel for WordPress & WooCommerce forms.

== Description ==

**Homura Time Travel & Form State Engine** brings "Git for application state" and bulletproof state preservation to WordPress forms and WooCommerce checkout.

Rather than acting as a simple, destructive key-value autosave, Homura acts as an agnostic **client-side state history layer** built on top of your existing form builders. It tracks an immutable timeline of states, allowing users to undo/redo changes, recover from browser crashes or accidental refreshes, and seamlessly transfer their form progress across devices via QR codes.

### 🌟 Revolutionary Features (v1.4.0)

* **📱 Multidevice Time-Travel ("Passaggio di Testimone")**: Generate dynamic QR codes (`[homura_handoff]`) allowing users to scan on desktop and immediately continue typing on mobile with the identical history timeline without registering an account.
* **👻 Behavioral "Ghost Assist" (Sensory UX)**: Proactively detects mass accidental deletions (>50% of paragraph) and rage-clicks, displaying a non-intrusive recovery toast with 1-click restore.
* **🔒 Privacy-First Zero-Knowledge Local Vault**: Native 256-bit AES-GCM encryption using browser WebCrypto API (`crypto="aes-gcm"`). Raw LocalStorage bytes are unreadable by third-party extensions.
* **📝 Visual Copywriting Git Diff & Scrubber**: Real-time word-level difference inspector (`[homura_visual_diff]`) with historical slider for long textareas and articles.
* **🧬 State Diff Engine**: Inspect exactly what changed between the current form DOM and any saved draft with visual diff inspection.
* **🛡️ WooCommerce AJAX Conflict Recovery**: Automatically detects when WooCommerce checkout recalculations (`update_order_review`, cart totals) wipe input values and instantly restores them without disrupting user flow.
* **🔐 Zero-Leak Sensitive Field Policy**: Passwords, CVVs, credit card numbers, payment nonces, and inputs tagged with `data-homura-sensitive="true"` or `data-homura-persist="false"` are strictly excluded from state storage and LocalStorage.
* **📦 Smart Recovery & Time-Travel**: Prompt users with a non-intrusive recovery banner (`[homura_recovery_banner]`) allowing them to restore all, review differences, or dismiss previous drafts.
* **🔄 Form Schema Versioning & Migration**: Seamlessly handles forms edited or upgraded by webmasters without breaking or corrupting visitor drafts.
* **Auto-Hook for Top Form Builders & WooCommerce**:
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

= How does Multidevice QR Handoff work? =
Add `[homura_handoff form="my_form"]` to your form. Clicking it generates an encrypted, compressed URL token embedded in an SVG QR code. Users scan it with their phone camera to instantly load the exact state and DAG history on mobile.

= How does Ghost Assist protect against accidental deletions? =
Homura monitors keystroke velocity and deletion volume. If an author or visitor accidentally selects all and deletes a 500-word paragraph, a Ghost Assist toast immediately appears offering a 1-click restore to the state before deletion.

= Is data encrypted in LocalStorage? =
Yes! When `crypto="aes-gcm"` is enabled, state data is encrypted with 256-bit AES-GCM using native browser `window.crypto.subtle`.

= Does this plugin work with WooCommerce? =
Yes! It automatically detects the WooCommerce checkout form, protects against AJAX DOM resets, and preserves billing/shipping fields locally without saving sensitive credit card details or CVVs.

== Screenshots ==

1. Visual Time-Travel undo/redo and live status badge.
2. Multidevice QR Code handoff modal.
3. Sensory Ghost Assist accidental deletion prompt.
4. Visual Copywriting Git Diff and history scrubber.

== Changelog ==

= 1.4.0 =
* Added Multidevice Time-Travel QR Code Handoff (`[homura_handoff]`).
* Added Sensory Behavioral Rage & Mass Erasure Detection ("Ghost Assist").
* Added Zero-Knowledge Privacy Vault with native WebCrypto AES-GCM 256-bit encryption (`crypto="aes-gcm"`).
* Added Visual Copywriting Git Diff & history scrubber (`[homura_visual_diff]`).
* Added `[homura_ghost_assist]` shortcode.

= 1.3.0 =
* Added State Diff Engine and visual diff modal.
* Added WooCommerce AJAX Conflict Recovery.
* Added Zero-Leak Sensitive Field Policy.

= 1.2.5 =
* Fixed [homura_clear] click reset handler and DOM purge.

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

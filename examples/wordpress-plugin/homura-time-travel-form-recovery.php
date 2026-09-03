<?php
/**
 * Plugin Name:       Homura Time Travel & Form Recovery
 * Plugin URI:        https://biagio-scaglia.github.io/homura-js/
 * Description:       High-performance DAG time-travel history engine, multidevice QR handoff, sensory Ghost Assist, zero-knowledge WebCrypto vault, visual copywriting diff, and non-destructive undo/redo for WordPress & WooCommerce forms.
 * Version:           1.4.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Biagio Scaglia
 * Author URI:        https://github.com/biagio-scaglia
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       homura-time-travel-form-recovery
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

class HomuraJSTimeTravelPlugin {
    const VERSION = '1.4.0';

    /**
     * Allowed values for the persist shortcode attribute.
     *
     * @var array
     */
    private static $allowed_persist = array('localstorage', 'sessionstorage', 'none');

    public function __construct() {
        add_action('init', array($this, 'load_textdomain'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));

        // Shortcodes
        add_shortcode('homura_undo', array($this, 'render_undo_button'));
        add_shortcode('homura_redo', array($this, 'render_redo_button'));
        add_shortcode('homura_status', array($this, 'render_status_badge'));
        add_shortcode('homura_breadcrumbs', array($this, 'render_breadcrumbs'));
        add_shortcode('homura_recovery_banner', array($this, 'render_recovery_banner'));
        add_shortcode('homura_diff', array($this, 'render_diff_button'));
        add_shortcode('homura_debug_export', array($this, 'render_debug_export_button'));
        add_shortcode('homura_handoff', array($this, 'render_handoff_button'));
        add_shortcode('homura_ghost_assist', array($this, 'render_ghost_assist_tag'));
        add_shortcode('homura_visual_diff', array($this, 'render_visual_diff_button'));
        add_shortcode('homura_form', array($this, 'render_homura_form_wrapper'));
        add_shortcode('homura_wizard', array($this, 'render_homura_wizard_wrapper'));
        add_shortcode('homura_clear', array($this, 'render_clear_button'));
        add_shortcode('homura_reset', array($this, 'render_clear_button'));
    }

    /**
     * Load plugin translations.
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            'homura-time-travel-form-recovery',
            false,
            dirname(plugin_basename(__FILE__)) . '/languages'
        );
    }

    /**
     * Enqueue HomuraJS Standalone Bundle with performance optimizations and WooCommerce AJAX hooks.
     */
    public function enqueue_scripts() {
        // Filter allowing granular conditional loading on specific pages
        if (!apply_filters('homura_should_enqueue_scripts', true)) {
            return;
        }

        wp_enqueue_script(
            'homurajs-bundle',
            esc_url(plugins_url('assets/js/homura.min.js', __FILE__)),
            array(),
            self::VERSION,
            true
        );

        // Modern Deferred Script Loading (WP 6.3+ Core Web Vitals optimization)
        if (function_exists('wp_script_add_data')) {
            wp_script_add_data('homurajs-bundle', 'strategy', 'defer');
        }

        // Sensitive field names filterable by webmaster
        $custom_sensitive_fields = apply_filters('homura_sensitive_field_names', array(
            'billing_password',
            'account_password',
            'stripe_token',
            'card_nonce'
        ));

        $schema_version = apply_filters('homura_form_schema_version', '1.3');
        $enable_ajax_integrity = apply_filters('homura_auto_restore_on_ajax', true) ? 'true' : 'false';

        // Auto-Hook & WooCommerce AJAX Conflict Interception Script
        $auto_hook_script = sprintf(
            <<<'JS'
(function() {
    var customSensitive = %s;
    var schemaVersion = %s;
    var enableAjaxIntegrity = %s;
    var activeControllers = [];

    function initHomuraHooks() {
        var selectors = [
            { sel: 'form.woocommerce-checkout', prefix: 'woocommerce_checkout' },
            { sel: '.wpcf7 form', prefix: 'wpcf7' },
            { sel: '.wpforms-form', prefix: 'wpforms' },
            { sel: '.elementor-form', prefix: 'elementor' },
            { sel: '.gform_wrapper form, form[id^="gform_"]', prefix: 'gravity_form' },
            { sel: '.fluentform, form[data-form_id]', prefix: 'fluent_form' },
            { sel: '.nf-form-content form', prefix: 'ninja_form' },
            { sel: '.frm-show-form', prefix: 'formidable_form' },
            { sel: '.wsf-form', prefix: 'ws_form' }
        ];

        selectors.forEach(function(item) {
            var forms = document.querySelectorAll(item.sel);
            forms.forEach(function(form, idx) {
                if (!form.hasAttribute('data-homura-form')) {
                    var formId = form.getAttribute('id') || form.getAttribute('name') || (item.prefix + '_' + idx);
                    form.setAttribute('data-homura-form', formId);
                    if (!form.hasAttribute('data-homura-persist')) {
                        form.setAttribute('data-homura-persist', 'localstorage');
                    }
                    if (!form.hasAttribute('data-homura-schema-version')) {
                        form.setAttribute('data-homura-schema-version', schemaVersion);
                    }
                }
            });
        });

        if (window.Homura && typeof window.Homura.autoInitForms === 'function') {
            activeControllers = window.Homura.autoInitForms();
        }
    }

    // WooCommerce & Generic AJAX Conflict Monitor Interceptor
    function setupAjaxConflictMonitor() {
        if (!enableAjaxIntegrity) return;

        function runIntegrityCheck() {
            if (activeControllers && activeControllers.length > 0) {
                activeControllers.forEach(function(ctrl) {
                    if (ctrl && typeof ctrl.verifyIntegrityAndRestore === 'function') {
                        ctrl.verifyIntegrityAndRestore();
                    }
                });
            }
        }

        // jQuery events for WooCommerce checkout
        if (typeof window.jQuery !== 'undefined') {
            window.jQuery(document.body).on('updated_checkout updated_cart_totals checkout_error', function() {
                setTimeout(runIntegrityCheck, 50);
            });
            window.jQuery(document).ajaxComplete(function(event, xhr, settings) {
                if (settings && settings.url && (settings.url.indexOf('wc-ajax') !== -1 || settings.url.indexOf('admin-ajax.php') !== -1)) {
                    setTimeout(runIntegrityCheck, 80);
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initHomuraHooks();
            setupAjaxConflictMonitor();
        }, { passive: true, once: true });
    } else {
        if (window.requestIdleCallback) {
            requestIdleCallback(function() {
                initHomuraHooks();
                setupAjaxConflictMonitor();
            });
        } else {
            setTimeout(function() {
                initHomuraHooks();
                setupAjaxConflictMonitor();
            }, 10);
        }
    }
})();
JS,
            json_encode($custom_sensitive_fields),
            json_encode($schema_version),
            $enable_ajax_integrity
        );

        wp_add_inline_script('homurajs-bundle', $auto_hook_script);

        // Modern accessible stylesheet for Time-Travel UI, Recovery Banner, and Diff Modal
        wp_add_inline_style('wp-block-library', '
            .homura-undo-btn, .homura-redo-btn, .homura-clear-btn, .homura-diff-btn, .homura-export-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 14px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid rgba(168, 85, 247, 0.4);
                background: #120921;
                color: #f5f3ff;
            }
            .homura-undo-btn:hover:not(:disabled), .homura-redo-btn:hover:not(:disabled), .homura-diff-btn:hover, .homura-export-btn:hover {
                background: #23113d;
                border-color: #a855f7;
            }
            .homura-clear-btn {
                border-color: rgba(239, 68, 68, 0.4);
                background: #1a0808;
                color: #fecaca;
            }
            .homura-clear-btn:hover:not(:disabled) {
                background: #2b0e0e;
                border-color: #ef4444;
            }
            .homura-undo-btn:disabled, .homura-redo-btn:disabled, .homura-clear-btn:disabled {
                opacity: 0.4;
                cursor: not-allowed;
                border-color: rgba(255, 255, 255, 0.1);
            }
            .homura-status-badge {
                display: inline-flex;
                align-items: center;
                font-size: 12px;
                color: #c4b5fd;
                padding: 4px 10px;
                background: rgba(168, 85, 247, 0.1);
                border: 1px solid rgba(168, 85, 247, 0.2);
                border-radius: 4px;
                margin: 4px 0;
            }
            .homura-breadcrumbs {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin: 8px 0;
            }
            .homura-breadcrumb-item {
                font-size: 11px;
                padding: 3px 8px;
                background: #190c2e;
                border: 1px solid rgba(168, 85, 247, 0.3);
                border-radius: 4px;
                color: #e9d5ff;
                cursor: pointer;
                transition: background 0.15s ease;
            }
            .homura-breadcrumb-item:hover {
                background: #29144d;
            }
            .homura-breadcrumb-item.active {
                background: #a855f7;
                color: #fff;
            }
            /* Smart Recovery Banner */
            .homura-recovery-banner {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 12px;
                padding: 12px 16px;
                margin: 12px 0 16px 0;
                border-radius: 8px;
                background: #180d2d;
                border: 1px solid #7c3aed;
                color: #ede9fe;
                box-shadow: 0 4px 14px rgba(0,0,0,0.3);
            }
            .homura-banner-text {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
            }
            .homura-banner-actions {
                display: flex;
                gap: 8px;
                align-items: center;
            }
            .homura-btn-restore {
                background: #7c3aed;
                color: #fff;
                border: none;
                padding: 6px 14px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
            }
            .homura-btn-restore:hover {
                background: #6d28d9;
            }
            .homura-btn-diff, .homura-btn-dismiss {
                background: rgba(255, 255, 255, 0.08);
                color: #ddd6fe;
                border: 1px solid rgba(255, 255, 255, 0.2);
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
            }
            .homura-btn-diff:hover, .homura-btn-dismiss:hover {
                background: rgba(255, 255, 255, 0.16);
            }
            /* Diff Modal */
            .homura-diff-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .homura-diff-backdrop {
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
            }
            .homura-diff-content {
                position: relative;
                z-index: 1;
                background: #120921;
                border: 1px solid #a855f7;
                border-radius: 10px;
                padding: 24px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                color: #f5f3ff;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            }
            .homura-diff-table {
                width: 100%;
                border-collapse: collapse;
                margin: 16px 0;
                font-size: 13px;
            }
            .homura-diff-table th, .homura-diff-table td {
                padding: 8px 10px;
                border-bottom: 1px solid rgba(168, 85, 247, 0.2);
                text-align: left;
            }
            .homura-diff-old {
                color: #f87171;
            }
            .homura-diff-new {
                color: #4ade80;
            }
            .homura-diff-footer {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 16px;
            }
            .homura-btn-modal-restore {
                background: #a855f7;
                color: #fff;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
            }
            .homura-btn-modal-close {
                background: rgba(255, 255, 255, 0.1);
                color: #e9d5ff;
                border: 1px solid rgba(255, 255, 255, 0.2);
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
            }
        ');
    }

    /**
     * Sanitize the persist attribute against a whitelist of allowed values.
     *
     * @param string $value The persist value to sanitize.
     * @return string Sanitized persist value, defaults to 'localstorage'.
     */
    private function sanitize_persist($value) {
        $value = strtolower(sanitize_key($value));
        return in_array($value, self::$allowed_persist, true) ? $value : 'localstorage';
    }

    /**
     * Shortcode [homura_undo form="checkout"]
     */
    public function render_undo_button($atts) {
        $a = shortcode_atts(array(
            'form'  => '',
            'label' => __('↩ Undo', 'homura-time-travel-form-recovery'),
            'class' => '',
        ), $atts);

        $form_attr = $a['form']
            ? ' data-homura-undo="' . esc_attr(sanitize_key($a['form'])) . '"'
            : ' data-homura-undo=""';

        $classes = 'homura-undo-btn' . ($a['class'] ? ' ' . esc_attr(sanitize_html_class($a['class'])) : '');

        return '<button type="button" class="' . $classes . '"' . $form_attr . '>' . esc_html($a['label']) . '</button>';
    }

    /**
     * Shortcode [homura_redo form="checkout"]
     */
    public function render_redo_button($atts) {
        $a = shortcode_atts(array(
            'form'  => '',
            'label' => __('↪ Redo', 'homura-time-travel-form-recovery'),
            'class' => '',
        ), $atts);

        $form_attr = $a['form']
            ? ' data-homura-redo="' . esc_attr(sanitize_key($a['form'])) . '"'
            : ' data-homura-redo=""';

        $classes = 'homura-redo-btn' . ($a['class'] ? ' ' . esc_attr(sanitize_html_class($a['class'])) : '');

        return '<button type="button" class="' . $classes . '"' . $form_attr . '>' . esc_html($a['label']) . '</button>';
    }

    /**
     * Shortcode [homura_clear form="checkout"] / [homura_reset form="checkout"]
     */
    public function render_clear_button($atts) {
        $a = shortcode_atts(array(
            'form'  => '',
            'label' => __('🗑️ Clear Draft', 'homura-time-travel-form-recovery'),
            'class' => '',
        ), $atts);

        $form_attr = $a['form']
            ? ' data-homura-clear="' . esc_attr(sanitize_key($a['form'])) . '"'
            : ' data-homura-clear=""';

        $classes = 'homura-clear-btn' . ($a['class'] ? ' ' . esc_attr(sanitize_html_class($a['class'])) : '');

        return '<button type="button" class="' . $classes . '"' . $form_attr . '>' . esc_html($a['label']) . '</button>';
    }

    /**
     * Shortcode [homura_diff form="checkout"]
     */
    public function render_diff_button($atts) {
        $a = shortcode_atts(array(
            'form'  => '',
            'label' => __('🧬 Review Diff', 'homura-time-travel-form-recovery'),
            'class' => '',
        ), $atts);

        $form_attr = $a['form']
            ? ' data-homura-diff-btn="' . esc_attr(sanitize_key($a['form'])) . '"'
            : ' data-homura-diff-btn=""';

        $classes = 'homura-diff-btn' . ($a['class'] ? ' ' . esc_attr(sanitize_html_class($a['class'])) : '');

        return '<button type="button" class="' . $classes . '"' . $form_attr . '>' . esc_html($a['label']) . '</button>';
    }

    /**
     * Shortcode [homura_debug_export form="checkout"]
     */
    public function render_debug_export_button($atts) {
        $a = shortcode_atts(array(
            'form'  => '',
            'label' => __('🕵️ Copy Sanitized Debug Snapshot', 'homura-time-travel-form-recovery'),
            'class' => '',
        ), $atts);

        $form_attr = $a['form']
            ? ' data-homura-export-btn="' . esc_attr(sanitize_key($a['form'])) . '"'
            : ' data-homura-export-btn=""';

        $classes = 'homura-export-btn' . ($a['class'] ? ' ' . esc_attr(sanitize_html_class($a['class'])) : '');

        return '<button type="button" class="' . $classes . '"' . $form_attr . '>' . esc_html($a['label']) . '</button>';
    }

    /**
     * Shortcode [homura_status form="checkout"]
     */
    public function render_status_badge($atts) {
        $a = shortcode_atts(array(
            'form'    => '',
            'default' => __('💾 Ready', 'homura-time-travel-form-recovery'),
            'class'   => '',
        ), $atts);

        $form_attr = $a['form']
            ? ' data-homura-status="' . esc_attr(sanitize_key($a['form'])) . '"'
            : ' data-homura-status=""';

        $classes = 'homura-status-badge' . ($a['class'] ? ' ' . esc_attr(sanitize_html_class($a['class'])) : '');

        return '<span class="' . $classes . '"' . $form_attr . '>' . esc_html($a['default']) . '</span>';
    }

    /**
     * Shortcode [homura_breadcrumbs form="checkout"]
     */
    public function render_breadcrumbs($atts) {
        $a = shortcode_atts(array(
            'form'  => '',
            'class' => '',
        ), $atts);

        $form_attr = $a['form']
            ? ' data-homura-breadcrumbs="' . esc_attr(sanitize_key($a['form'])) . '"'
            : ' data-homura-breadcrumbs=""';

        $classes = 'homura-breadcrumbs' . ($a['class'] ? ' ' . esc_attr(sanitize_html_class($a['class'])) : '');

        return '<div class="' . $classes . '"' . $form_attr . '></div>';
    }

    /**
     * Shortcode [homura_recovery_banner form="checkout"]
     */
    public function render_recovery_banner($atts) {
        $a = shortcode_atts(array(
            'form'  => '',
            'class' => '',
        ), $atts);

        $form_attr = $a['form']
            ? ' data-homura-banner="' . esc_attr(sanitize_key($a['form'])) . '"'
            : ' data-homura-banner=""';

        $classes = 'homura-recovery-banner' . ($a['class'] ? ' ' . esc_attr(sanitize_html_class($a['class'])) : '');

        return '
        <div class="' . $classes . '"' . $form_attr . ' style="display: none;">
            <div class="homura-banner-text">
                <strong>📦 Saved Draft Available</strong>
                <span>We found previous form progress from your session.</span>
            </div>
            <div class="homura-banner-actions">
                <button type="button" class="homura-btn-restore" data-homura-restore>Restore Draft</button>
                <button type="button" class="homura-btn-diff" data-homura-diff>Review Diff</button>
                <button type="button" class="homura-btn-dismiss" data-homura-dismiss>Dismiss</button>
            </div>
        </div>';
    }

    /**
     * Shortcode [homura_handoff form="checkout" label="📱 Continue on Mobile"]
     */
    public function render_handoff_button($atts) {
        $a = shortcode_atts(array(
            'form'  => '',
            'label' => __('📱 Continue on Mobile', 'homura-time-travel-form-recovery'),
            'class' => '',
        ), $atts);

        $form_attr = $a['form']
            ? ' data-homura-handoff="' . esc_attr(sanitize_key($a['form'])) . '"'
            : ' data-homura-handoff=""';

        $classes = 'homura-handoff-btn' . ($a['class'] ? ' ' . esc_attr(sanitize_html_class($a['class'])) : '');

        return '<button type="button" class="' . $classes . '"' . $form_attr . '>' . esc_html($a['label']) . '</button>';
    }

    /**
     * Shortcode [homura_visual_diff form="post_content" field="post_content" label="📝 Visual Diff"]
     */
    public function render_visual_diff_button($atts) {
        $a = shortcode_atts(array(
            'form'  => '',
            'field' => 'content',
            'label' => __('📝 Visual Diff', 'homura-time-travel-form-recovery'),
            'class' => '',
        ), $atts);

        $form_attr = $a['form']
            ? ' data-homura-visual-diff="' . esc_attr(sanitize_key($a['field'])) . '" data-form="' . esc_attr(sanitize_key($a['form'])) . '"'
            : ' data-homura-visual-diff="' . esc_attr(sanitize_key($a['field'])) . '"';

        $classes = 'homura-visual-diff-btn' . ($a['class'] ? ' ' . esc_attr(sanitize_html_class($a['class'])) : '');

        return '<button type="button" class="' . $classes . '"' . $form_attr . '>' . esc_html($a['label']) . '</button>';
    }

    /**
     * Shortcode [homura_ghost_assist form="checkout"]
     */
    public function render_ghost_assist_tag($atts) {
        $a = shortcode_atts(array(
            'form' => '',
        ), $atts);

        $form_attr = $a['form']
            ? ' data-homura-ghost-assist="' . esc_attr(sanitize_key($a['form'])) . '"'
            : ' data-homura-ghost-assist="true"';

        return '<span class="homura-ghost-assist-indicator"' . $form_attr . ' style="display:none;"></span>';
    }

    /**
     * Shortcode [homura_form id="lead-form"] ... [/homura_form]
     */
    public function render_homura_form_wrapper($atts, $content = null) {
        $a = shortcode_atts(array(
            'id'             => 'wp_homura_form',
            'persist'        => 'localstorage',
            'debounce'       => '200',
            'smart_recovery' => 'false',
            'schema_version' => '1.4',
            'crypto'         => 'none',
            'ghost_assist'   => 'true'
        ), $atts);

        $crypto_attr = ($a['crypto'] === 'aes-gcm' || $a['crypto'] === 'true') ? ' data-homura-crypto="aes-gcm"' : '';
        $ghost_attr = $a['ghost_assist'] === 'false' ? ' data-homura-ghost-assist="false"' : ' data-homura-ghost-assist="true"';

        return sprintf(
            '<div data-homura-form="%s" data-homura-persist="%s" data-homura-debounce="%s" data-homura-smart-recovery="%s" data-homura-schema-version="%s"%s%s>%s</div>',
            esc_attr(sanitize_key($a['id'])),
            esc_attr($this->sanitize_persist($a['persist'])),
            esc_attr(absint($a['debounce'])),
            esc_attr($a['smart_recovery'] === 'true' ? 'true' : 'false'),
            esc_attr(sanitize_text_field($a['schema_version'])),
            $crypto_attr,
            $ghost_attr,
            wp_kses_post(do_shortcode($content))
        );
    }

    /**
     * Shortcode [homura_wizard id="quote_wizard"] ... [/homura_wizard]
     */
    public function render_homura_wizard_wrapper($atts, $content = null) {
        $a = shortcode_atts(array(
            'id'             => 'wp_homura_wizard',
            'persist'        => 'localstorage',
            'debounce'       => '200',
            'smart_recovery' => 'false',
            'schema_version' => '1.4',
            'crypto'         => 'none',
            'ghost_assist'   => 'true'
        ), $atts);

        $crypto_attr = ($a['crypto'] === 'aes-gcm' || $a['crypto'] === 'true') ? ' data-homura-crypto="aes-gcm"' : '';
        $ghost_attr = $a['ghost_assist'] === 'false' ? ' data-homura-ghost-assist="false"' : ' data-homura-ghost-assist="true"';

        return sprintf(
            '<div data-homura-wizard="%s" data-homura-persist="%s" data-homura-debounce="%s" data-homura-smart-recovery="%s" data-homura-schema-version="%s"%s%s>%s</div>',
            esc_attr(sanitize_key($a['id'])),
            esc_attr($this->sanitize_persist($a['persist'])),
            esc_attr(absint($a['debounce'])),
            esc_attr($a['smart_recovery'] === 'true' ? 'true' : 'false'),
            esc_attr(sanitize_text_field($a['schema_version'])),
            $crypto_attr,
            $ghost_attr,
            wp_kses_post(do_shortcode($content))
        );
    }
}

/**
 * Initialize the Homura Time Travel plugin.
 *
 * @return HomuraJSTimeTravelPlugin Plugin instance.
 */
function homura_time_travel_init() {
    static $instance = null;
    if (null === $instance) {
        $instance = new HomuraJSTimeTravelPlugin();
    }
    return $instance;
}
homura_time_travel_init();

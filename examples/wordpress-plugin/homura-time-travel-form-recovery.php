<?php
/**
 * Plugin Name:       Homura Time Travel & Form Recovery
 * Plugin URI:        https://biagio-scaglia.github.io/homura-js/
 * Description:       High-performance DAG time-travel history engine, form crash recovery, and non-destructive undo/redo for WordPress & WooCommerce forms.
 * Version:           1.2.5
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
    const VERSION = '1.2.5';

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
     * Enqueue HomuraJS Standalone Bundle with performance optimizations.
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

        // Lightweight Auto-Hook & Passive Event Listener Optimization
        $auto_hook_script = <<<'JS'
(function() {
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
                }
            });
        });

        if (window.Homura && typeof window.Homura.autoInitForms === 'function') {
            window.Homura.autoInitForms();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHomuraHooks, { passive: true, once: true });
    } else {
        if (window.requestIdleCallback) {
            requestIdleCallback(initHomuraHooks);
        } else {
            setTimeout(initHomuraHooks, 10);
        }
    }
})();
JS;
        wp_add_inline_script('homurajs-bundle', $auto_hook_script);

        // Optimized inline stylesheet with accessible styles
        wp_add_inline_style('wp-block-library', '
            .homura-undo-btn, .homura-redo-btn, .homura-clear-btn {
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
            .homura-undo-btn:hover:not(:disabled), .homura-redo-btn:hover:not(:disabled) {
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
     * Shortcode [homura_form id="lead-form"] ... [/homura_form]
     */
    public function render_homura_form_wrapper($atts, $content = null) {
        $a = shortcode_atts(array(
            'id'       => 'wp_homura_form',
            'persist'  => 'localstorage',
            'debounce' => '200',
        ), $atts);

        return sprintf(
            '<div data-homura-form="%s" data-homura-persist="%s" data-homura-debounce="%s">%s</div>',
            esc_attr(sanitize_key($a['id'])),
            esc_attr($this->sanitize_persist($a['persist'])),
            esc_attr(absint($a['debounce'])),
            wp_kses_post(do_shortcode($content))
        );
    }

    /**
     * Shortcode [homura_wizard id="quote_wizard"] ... [/homura_wizard]
     */
    public function render_homura_wizard_wrapper($atts, $content = null) {
        $a = shortcode_atts(array(
            'id'       => 'wp_homura_wizard',
            'persist'  => 'localstorage',
            'debounce' => '200',
        ), $atts);

        return sprintf(
            '<div data-homura-wizard="%s" data-homura-persist="%s" data-homura-debounce="%s">%s</div>',
            esc_attr(sanitize_key($a['id'])),
            esc_attr($this->sanitize_persist($a['persist'])),
            esc_attr(absint($a['debounce'])),
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

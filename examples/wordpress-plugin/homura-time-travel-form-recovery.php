<?php
/**
 * Plugin Name: Homura Time Travel & Form Recovery
 * Plugin URI: https://biagio-scaglia.github.io/homura-js/
 * Description: Real-time DAG time-travel history engine, form crash recovery, and non-destructive undo/redo for WordPress & WooCommerce forms.
 * Version: 1.2.3
 * Author: Biagio Scaglia
 * Author URI: https://github.com/biagio-scaglia
 * License: MIT
 * License URI: https://opensource.org/licenses/MIT
 * Text Domain: homura-time-travel-form-recovery
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class HomuraJSTimeTravelPlugin {
    const VERSION = '1.2.3';

    public function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('homura_undo', array($this, 'render_undo_button'));
        add_shortcode('homura_redo', array($this, 'render_redo_button'));
        add_shortcode('homura_status', array($this, 'render_status_badge'));
        add_shortcode('homura_breadcrumbs', array($this, 'render_breadcrumbs'));
        add_shortcode('homura_form', array($this, 'render_homura_form_wrapper'));
        add_shortcode('homura_wizard', array($this, 'render_homura_wizard_wrapper'));
    }

    /**
     * Enqueue HomuraJS Standalone Bundle from local assets
     */
    public function enqueue_scripts() {
        wp_enqueue_script(
            'homurajs-bundle',
            plugins_url('assets/js/homura.min.js', __FILE__),
            array(),
            self::VERSION,
            true
        );

        // Auto-Hook into WooCommerce & Top Form Plugins
        $autoHookScript = "
        document.addEventListener('DOMContentLoaded', function() {
            // Auto-detect WooCommerce Checkout
            var wooCheckout = document.querySelector('form.woocommerce-checkout');
            if (wooCheckout && !wooCheckout.hasAttribute('data-homura-form')) {
                wooCheckout.setAttribute('data-homura-form', 'woocommerce_checkout');
                wooCheckout.setAttribute('data-homura-persist', 'localstorage');
            }

            // Auto-detect Contact Form 7
            document.querySelectorAll('.wpcf7 form').forEach(function(cf7, idx) {
                if (!cf7.hasAttribute('data-homura-form')) {
                    cf7.setAttribute('data-homura-form', 'wpcf7_' + idx);
                    cf7.setAttribute('data-homura-persist', 'localstorage');
                }
            });

            // Auto-detect WPForms
            document.querySelectorAll('.wpforms-form').forEach(function(wpf, idx) {
                if (!wpf.hasAttribute('data-homura-form')) {
                    wpf.setAttribute('data-homura-form', 'wpforms_' + idx);
                    wpf.setAttribute('data-homura-persist', 'localstorage');
                }
            });

            // Auto-detect Elementor Forms
            document.querySelectorAll('.elementor-form').forEach(function(ef, idx) {
                if (!ef.hasAttribute('data-homura-form')) {
                    ef.setAttribute('data-homura-form', 'elementor_' + idx);
                    ef.setAttribute('data-homura-persist', 'localstorage');
                }
            });

            // Re-run auto initialization
            if (window.Homura && window.Homura.autoInitForms) {
                window.Homura.autoInitForms();
            }
        });
        ";
        wp_add_inline_script('homurajs-bundle', $autoHookScript);

        // Custom stylesheet for controls, status badges, and breadcrumbs
        wp_add_inline_style('wp-block-library', '
            .homura-undo-btn, .homura-redo-btn {
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
            .homura-undo-btn:disabled, .homura-redo-btn:disabled {
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
            }
            .homura-breadcrumb-item.active {
                background: #a855f7;
                color: #fff;
            }
        ');
    }

    /**
     * Shortcode [homura_undo form="checkout"]
     */
    public function render_undo_button($atts) {
        $a = shortcode_atts(array(
            'form' => '',
            'label' => '↩ Undo'
        ), $atts);

        $formAttr = $a['form'] ? ' data-homura-undo="' . esc_attr($a['form']) . '"' : ' data-homura-undo=""';
        return '<button type="button" class="homura-undo-btn"' . $formAttr . '>' . esc_html($a['label']) . '</button>';
    }

    /**
     * Shortcode [homura_redo form="checkout"]
     */
    public function render_redo_button($atts) {
        $a = shortcode_atts(array(
            'form' => '',
            'label' => '↪ Redo'
        ), $atts);

        $formAttr = $a['form'] ? ' data-homura-redo="' . esc_attr($a['form']) . '"' : ' data-homura-redo=""';
        return '<button type="button" class="homura-redo-btn"' . $formAttr . '>' . esc_html($a['label']) . '</button>';
    }

    /**
     * Shortcode [homura_status form="checkout"]
     */
    public function render_status_badge($atts) {
        $a = shortcode_atts(array(
            'form' => '',
            'default' => '💾 Ready'
        ), $atts);

        $formAttr = $a['form'] ? ' data-homura-status="' . esc_attr($a['form']) . '"' : ' data-homura-status=""';
        return '<span class="homura-status-badge"' . $formAttr . '>' . esc_html($a['default']) . '</span>';
    }

    /**
     * Shortcode [homura_breadcrumbs form="checkout"]
     */
    public function render_breadcrumbs($atts) {
        $a = shortcode_atts(array(
            'form' => ''
        ), $atts);

        $formAttr = $a['form'] ? ' data-homura-breadcrumbs="' . esc_attr($a['form']) . '"' : ' data-homura-breadcrumbs=""';
        return '<div class="homura-breadcrumbs"' . $formAttr . '></div>';
    }

    /**
     * Shortcode [homura_form id="lead-form"] ... [/homura_form]
     */
    public function render_homura_form_wrapper($atts, $content = null) {
        $a = shortcode_atts(array(
            'id' => 'wp_homura_form',
            'persist' => 'localstorage',
            'debounce' => '200'
        ), $atts);

        return sprintf(
            '<div data-homura-form="%s" data-homura-persist="%s" data-homura-debounce="%s">%s</div>',
            esc_attr($a['id']),
            esc_attr($a['persist']),
            esc_attr($a['debounce']),
            do_shortcode($content)
        );
    }

    /**
     * Shortcode [homura_wizard id="quote_wizard"] ... [/homura_wizard]
     */
    public function render_homura_wizard_wrapper($atts, $content = null) {
        $a = shortcode_atts(array(
            'id' => 'wp_homura_wizard',
            'persist' => 'localstorage',
            'debounce' => '200'
        ), $atts);

        return sprintf(
            '<div data-homura-wizard="%s" data-homura-persist="%s" data-homura-debounce="%s">%s</div>',
            esc_attr($a['id']),
            esc_attr($a['persist']),
            esc_attr($a['debounce']),
            do_shortcode($content)
        );
    }
}

new HomuraJSTimeTravelPlugin();

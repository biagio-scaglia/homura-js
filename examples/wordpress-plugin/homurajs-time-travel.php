<?php
/**
 * Plugin Name: HomuraJS — Time Travel State & Form Recovery
 * Plugin URI: https://github.com/biagio-scaglia/homura-js
 * Description: Real-time time-travel history engine, form auto-recovery, and non-destructive undo/redo for WordPress & WooCommerce forms.
 * Version: 1.2.2
 * Author: Biagio Scaglia & HomuraJS Team
 * Author URI: https://github.com/biagio-scaglia
 * License: MIT
 * Text Domain: homurajs-time-travel
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class HomuraJSTimeTravelPlugin {
    const VERSION = '1.2.2';

    public function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('homura_undo', array($this, 'render_undo_button'));
        add_shortcode('homura_redo', array($this, 'render_redo_button'));
        add_shortcode('homura_form', array($this, 'render_homura_form_wrapper'));
    }

    /**
     * Enqueue HomuraJS Standalone Bundle from unpkg or local assets
     */
    public function enqueue_scripts() {
        wp_enqueue_script(
            'homurajs-bundle',
            'https://unpkg.com/@biagioscaglia/homurajs@' . self::VERSION . '/dist/index.global.js',
            array(),
            self::VERSION,
            true
        );

        // Optional custom stylesheet for undo/redo controls
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
}

new HomuraJSTimeTravelPlugin();

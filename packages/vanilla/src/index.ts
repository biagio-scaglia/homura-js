/**
 * @homura-js/vanilla
 * Vanilla JavaScript & Reactive DOM bindings for HomuraJS
 */

export { createHomura } from '@homura-js/core';
export type { Homura, HomuraConfig, HistoryEntry } from '@homura-js/core';

export { bindState } from './bind';
export type { StateBinding, DOMTarget } from './bind';

export { bindForm, autoInitForms } from './form';
export type { FormBindingOptions, FormBindingController } from './form';

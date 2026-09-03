/**
 * @homura-js/vanilla
 * Vanilla JavaScript & Reactive DOM bindings for HomuraJS
 */

export { createHomura } from '@homura-js/core';
export type { Homura, HomuraConfig, HistoryEntry } from '@homura-js/core';

export { bindState } from './bind';
export type { StateBinding, DOMTarget } from './bind';

export {
  bindForm,
  autoInitForms,
  extractFormData,
  populateFormData,
  isFieldSensitive,
  maskPIIValue
} from './form';
export type {
  FormBindingOptions,
  FormBindingController,
  FormDiffItem
} from './form';

export {
  encryptPayload,
  decryptPayload
} from './crypto';

export {
  compressToUrlToken,
  decompressFromUrlToken,
  generateQrSvg,
  buildHandoffUrl,
  extractHandoffFromLocation
} from './qr';

export {
  GhostAssistMonitor
} from './ghost';
export type {
  GhostAssistOptions
} from './ghost';

export {
  computeWordDiff,
  createVisualDiffViewer
} from './textdiff';
export type {
  TextDiffResult
} from './textdiff';

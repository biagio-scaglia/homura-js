import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  encryptPayload,
  decryptPayload,
  compressToUrlToken,
  decompressFromUrlToken,
  generateQrSvg,
  computeWordDiff,
  GhostAssistMonitor,
  bindForm
} from '../src';

describe('HomuraJS Next-Gen Revolutionary Features', () => {
  describe('1. WebCrypto Zero-Knowledge Local Vault', () => {
    it('encrypts and decrypts state payloads accurately', async () => {
      const plaintext = JSON.stringify({ user: 'Elena', role: 'Architect', count: 42 });
      const encrypted = await encryptPayload(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toContain('Elena');
      expect(encrypted).not.toContain('Architect');

      const decrypted = await decryptPayload(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('handles non-encrypted fallback strings cleanly', async () => {
      const plain = '{"key":"value"}';
      const result = await decryptPayload(plain);
      expect(result).toBe(plain);
    });
  });

  describe('2. Multidevice Handoff & QR Code Generator', () => {
    it('compresses and decompresses URL handoff tokens safely', () => {
      const original = JSON.stringify({ form: 'checkout', items: [1, 2, 3] });
      const token = compressToUrlToken(original);
      expect(token).toBeDefined();
      expect(token).not.toContain(' ');

      const recovered = decompressFromUrlToken(token);
      expect(recovered).toBe(original);
    });

    it('generates valid SVG QR code markup without external libraries', () => {
      const svg = generateQrSvg('https://example.com/#homura_handoff=abc123xyz', 200);
      expect(svg).toContain('<svg');
      expect(svg).toContain('viewBox="0 0 200 200"');
      expect(svg).toContain('<rect');
      expect(svg).toContain('</svg>');
    });
  });

  describe('3. Visual Copywriting Git Diff Engine', () => {
    it('detects word additions and deletions', () => {
      const oldText = 'The quick brown fox';
      const newText = 'The fast brown fox jumps';

      const diff = computeWordDiff(oldText, newText);
      expect(diff.addedCount).toBeGreaterThan(0);
      expect(diff.removedCount).toBeGreaterThan(0);
      expect(diff.html).toContain('<ins');
      expect(diff.html).toContain('<del');
      expect(diff.html).toContain('fast');
      expect(diff.html).toContain('quick');
    });

    it('handles empty strings gracefully', () => {
      const diff = computeWordDiff('', 'Hello World');
      expect(diff.addedCount).toBe(2);
      expect(diff.html).toContain('Hello');
    });
  });

  describe('4. Sensory Behavioral Rage & Erasure Monitor ("Ghost Assist")', () => {
    let form: HTMLFormElement;

    beforeEach(() => {
      document.body.innerHTML = '';
      form = document.createElement('form');
      form.innerHTML = `
        <textarea name="bio"></textarea>
        <button type="submit">Submit</button>
      `;
      document.body.appendChild(form);
    });

    it('initializes and cleans up without memory leaks', () => {
      const restoreSpy = vi.fn();
      const ghost = new GhostAssistMonitor(form, {
        onRestoreSnapshot: restoreSpy
      });

      ghost.triggerGhostAssist('Accidental deletion?', 'Test message');
      expect(document.querySelector('.homura-ghost-assist-toast')).not.toBeNull();

      ghost.destroy();
      expect(document.querySelector('.homura-ghost-assist-toast')).toBeNull();
    });
  });

  describe('5. Form Binding Integration with Handoff and Diff Buttons', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <form data-homura-form="quote_form" data-homura-crypto="aes-gcm">
          <input type="text" name="client_name" value="Acme Corp" />
          <textarea name="scope">Initial scope draft</textarea>
          <button type="button" data-homura-handoff="quote_form">📱 Mobile Handoff</button>
          <button type="button" data-homura-visual-diff="scope">📝 Diff Scope</button>
        </form>
      `;
    });

    it('binds handoff and diff buttons automatically', () => {
      const controller = bindForm('form[data-homura-form="quote_form"]', {
        crypto: 'aes-gcm'
      });

      expect(controller).toBeDefined();
      expect(typeof controller.openHandoffModal).toBe('function');
      expect(typeof controller.openVisualDiff).toBe('function');

      controller.destroy();
    });
  });
});

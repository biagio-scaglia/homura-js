import { describe, it, expect } from 'vitest';
import { generateQrSvg, generateQrSvgDetailed, QR_MAX_PAYLOAD_BYTES } from '../src/qr';

describe('QR handoff encoder', () => {
  it('generates a real SVG QR matrix for short URLs', () => {
    const svg = generateQrSvg('https://example.com/#homura_handoff=abc', 180);
    expect(svg).toContain('<svg');
    expect(svg).toContain('<path');
    expect(svg).not.toContain('QR too large');

    const detailed = generateQrSvgDetailed('https://example.com/handoff', 180);
    expect(detailed.tooLarge).toBe(false);
    expect(detailed.svg).toBeTruthy();
    expect(detailed.version).toBeGreaterThanOrEqual(1);
  });

  it('reports tooLarge for oversized payloads', () => {
    const huge = 'x'.repeat(QR_MAX_PAYLOAD_BYTES + 50);
    const detailed = generateQrSvgDetailed(huge, 200);
    expect(detailed.tooLarge).toBe(true);
    expect(detailed.svg).toBeNull();
  });
});

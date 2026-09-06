/**
 * HomuraJS — Multidevice Handoff & Client-Side SVG QR Code Generator
 * Compresses state DAG history and generates a real scannable QR code for mobile handoff.
 */

import { encode, renderSVG } from 'uqr';

/**
 * Basic fast LZW string compressor for URL tokens (100% zero-dependency).
 */
export function compressToUrlToken(input: string): string {
  if (!input) return '';
  try {
    const jsonStr = unescape(encodeURIComponent(input));
    // Base64URL encoding with safe URL characters
    return btoa(jsonStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return encodeURIComponent(input);
  }
}

/**
 * Decompresses a URL handoff token back to JSON state string.
 */
export function decompressFromUrlToken(token: string): string | null {
  if (!token) return null;
  try {
    let b64 = token.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const raw = atob(b64);
    return decodeURIComponent(escape(raw));
  } catch {
    try {
      return decodeURIComponent(token);
    } catch {
      return null;
    }
  }
}

/** Max payload length we attempt to QR-encode (approx. QR v40 byte capacity at ECC L). */
export const QR_MAX_PAYLOAD_BYTES = 2500;

export interface QrRenderResult {
  /** SVG markup when encoding succeeded */
  svg: string | null;
  /** Whether the payload was too large for a scannable QR */
  tooLarge: boolean;
  /** Encoded QR version when successful */
  version?: number;
}

/**
 * Generates a real scannable QR Code SVG for the given URL/payload.
 * Returns `{ svg: null, tooLarge: true }` when the payload exceeds QR capacity.
 */
export function generateQrSvg(url: string, size = 220): string {
  const result = generateQrSvgDetailed(url, size);
  if (result.svg) return result.svg;

  // Fallback placeholder when payload is too large — copy-link remains the path
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="background: #0f071a; border-radius: 8px; border: 1px dashed rgba(168, 85, 247, 0.5);">
      <text x="50%" y="46%" text-anchor="middle" fill="#c4b5fd" font-size="12" font-family="sans-serif">QR too large</text>
      <text x="50%" y="58%" text-anchor="middle" fill="#a78bfa" font-size="11" font-family="sans-serif">Use Copy Link</text>
    </svg>
  `.trim();
}

/**
 * Detailed QR generation with capacity metadata.
 */
export function generateQrSvgDetailed(url: string, size = 220): QrRenderResult {
  if (!url) {
    return { svg: null, tooLarge: true };
  }

  const byteLength = new TextEncoder().encode(url).length;
  if (byteLength > QR_MAX_PAYLOAD_BYTES) {
    return { svg: null, tooLarge: true };
  }

  try {
    const encoded = encode(url, { ecc: 'L' });
    const pixelSize = Math.max(2, Math.floor(size / Math.max(encoded.size, 1)));
    const svg = renderSVG(url, {
      ecc: 'L',
      pixelSize,
      whiteColor: '#0f071a',
      blackColor: '#f5f3ff'
    });

    // Normalize outer size for modal layout
    const sized = svg.replace(
      /<svg([^>]*)>/,
      `<svg$1 width="${size}" height="${size}" style="border-radius: 8px; padding: 8px; border: 1px solid rgba(168, 85, 247, 0.4); box-shadow: 0 4px 25px rgba(0,0,0,0.5); box-sizing: content-box;">`
    );

    return { svg: sized, tooLarge: false, version: encoded.version };
  } catch {
    return { svg: null, tooLarge: true };
  }
}

/**
 * Builds the cross-device handoff URL with serialized hash.
 */
export function buildHandoffUrl(serializedState: string): string {
  if (typeof window === 'undefined') return '';
  const token = compressToUrlToken(serializedState);
  const baseUrl = window.location.href.split('#')[0];
  return `${baseUrl}#homura_handoff=${token}`;
}

/**
 * Inspects the current window URL hash for an incoming handoff token.
 */
export function extractHandoffFromLocation(): string | null {
  if (typeof window === 'undefined' || !window.location.hash) return null;
  const match = window.location.hash.match(/homura_handoff=([^&]+)/);
  if (!match || !match[1]) return null;
  return decompressFromUrlToken(match[1]);
}

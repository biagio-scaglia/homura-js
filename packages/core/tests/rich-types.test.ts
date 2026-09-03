import { describe, it, expect } from 'vitest';
import { serializeRichState, deserializeRichState, LocalStorageAdapter } from '../src';

describe('Rich Type Serialization & Deserialization', () => {
  it('encodes and restores Date, Set, Map, RegExp, BigInt, and Uint8Array', () => {
    const original = {
      timestamp: new Date('2026-09-03T09:00:00.000Z'),
      tags: new Set(['react', 'vue', 'homura']),
      registry: new Map<string, any>([
        ['user_1', { name: 'Alice', active: true }],
        ['user_2', { name: 'Bob', active: false }]
      ]),
      pattern: /^homura-[a-z0-9]+/i,
      largeNumber: BigInt(9007199254740991),
      bytes: new Uint8Array([1, 2, 3, 4, 5])
    };

    const serialized = serializeRichState(original);
    const jsonString = JSON.stringify(serialized);
    const parsed = JSON.parse(jsonString);
    const restored = deserializeRichState(parsed) as typeof original;

    expect(restored.timestamp).toBeInstanceOf(Date);
    expect(restored.timestamp.toISOString()).toBe('2026-09-03T09:00:00.000Z');

    expect(restored.tags).toBeInstanceOf(Set);
    expect(restored.tags.has('react')).toBe(true);
    expect(restored.tags.has('homura')).toBe(true);

    expect(restored.registry).toBeInstanceOf(Map);
    expect(restored.registry.get('user_1')).toEqual({ name: 'Alice', active: true });

    expect(restored.pattern).toBeInstanceOf(RegExp);
    expect(restored.pattern.test('homura-abc123')).toBe(true);

    expect(typeof restored.largeNumber).toBe('bigint');
    expect(restored.largeNumber).toBe(BigInt(9007199254740991));

    expect(restored.bytes).toBeInstanceOf(Uint8Array);
    expect(Array.from(restored.bytes)).toEqual([1, 2, 3, 4, 5]);
  });
});

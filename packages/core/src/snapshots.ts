import { HistoryEntry, Snapshot } from './types';
import { HomuraSnapshotError } from './errors';
import { generateId } from './history';
import { deepClone } from './immutability';

/**
 * Snapshot registry for capturing, listing, and restoring milestones.
 */
export class SnapshotManager<T> {
  private snapshots = new Map<string, Snapshot<T>>();

  /**
   * Creates a new snapshot for a given history entry.
   */
  public createSnapshot(
    entry: HistoryEntry<T>,
    name?: string,
    metadata?: Record<string, unknown>
  ): Snapshot<T> {
    const id = generateId('snap');
    const snapshotName = name && name.trim() ? name.trim() : `Snapshot #${this.snapshots.size + 1}`;

    const snapshot: Snapshot<T> = {
      id,
      name: snapshotName,
      timestamp: Date.now(),
      state: deepClone(entry.state),
      historyEntryId: entry.id,
      metadata: metadata ? { ...metadata } : undefined
    };

    this.snapshots.set(id, snapshot);
    return snapshot;
  }

  /**
   * Returns all snapshots sorted by timestamp.
   */
  public getSnapshots(): Snapshot<T>[] {
    return Array.from(this.snapshots.values()).sort(
      (a, b) => a.timestamp - b.timestamp
    );
  }

  /**
   * Returns a snapshot by ID or name.
   */
  public getSnapshot(idOrName: string): Snapshot<T> | undefined {
    const byId = this.snapshots.get(idOrName);
    if (byId) return byId;

    return Array.from(this.snapshots.values()).find(
      s => s.name === idOrName
    );
  }

  /**
   * Deletes a snapshot by ID.
   */
  public deleteSnapshot(id: string): void {
    if (!this.snapshots.has(id)) {
      throw new HomuraSnapshotError(`Snapshot "${id}" does not exist`, id);
    }
    this.snapshots.delete(id);
  }

  /**
   * Clears all snapshots.
   */
  public clear(): void {
    this.snapshots.clear();
  }

  /**
   * Exports snapshots map for serialization.
   */
  public exportData(): Record<string, Snapshot<T>> {
    const result: Record<string, Snapshot<T>> = {};
    for (const [k, v] of this.snapshots.entries()) {
      result[k] = deepClone(v);
    }
    return result;
  }

  /**
   * Imports snapshots from serialized data.
   */
  public importData(data: Record<string, Snapshot<T>>): void {
    this.snapshots.clear();
    for (const [k, v] of Object.entries(data)) {
      this.snapshots.set(k, deepClone(v));
    }
  }
}

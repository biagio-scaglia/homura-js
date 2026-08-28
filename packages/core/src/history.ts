import { Branch, HistoryEntry, SerializedHomura } from './types';
import { HomuraHistoryError } from './errors';
import { deepClone } from './immutability';

/**
 * Generates a unique, collision-resistant ID.
 */
export function generateId(prefix: string = 'ent'): string {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${time}_${rand}`;
}

/**
 * Directed Acyclic Graph (DAG) state history engine.
 */
export class HistoryGraph<T> {
  private entries = new Map<string, HistoryEntry<T>>();
  private branches = new Map<string, Branch>();
  private rootEntryId: string;
  private currentEntryId: string;
  private currentBranchId: string;
  private maxHistory: number;
  private autoBranchOnDivergence: boolean;
  private branchCounter = 1;

  constructor(
    initialState: T,
    options: {
      maxHistory?: number;
      autoBranchOnDivergence?: boolean;
      initialLabel?: string;
    } = {}
  ) {
    this.maxHistory = options.maxHistory ?? 1000;
    this.autoBranchOnDivergence = options.autoBranchOnDivergence ?? true;

    const rootId = generateId('root');
    const defaultBranchId = 'main';

    const rootEntry: HistoryEntry<T> = {
      id: rootId,
      parentId: null,
      childrenIds: [],
      branchId: defaultBranchId,
      timestamp: Date.now(),
      label: options.initialLabel ?? 'Initial state',
      state: deepClone(initialState),
      metadata: { initial: true }
    };

    const mainBranch: Branch = {
      id: defaultBranchId,
      name: 'main',
      createdAt: Date.now(),
      rootEntryId: rootId,
      headEntryId: rootId
    };

    this.entries.set(rootId, rootEntry);
    this.branches.set(defaultBranchId, mainBranch);
    this.rootEntryId = rootId;
    this.currentEntryId = rootId;
    this.currentBranchId = defaultBranchId;
  }

  /**
   * Returns current active history entry.
   */
  public getCurrentEntry(): HistoryEntry<T> {
    const entry = this.entries.get(this.currentEntryId);
    if (!entry) {
      throw new HomuraHistoryError(`Current entry "${this.currentEntryId}" not found in history`);
    }
    return entry;
  }

  /**
   * Returns current active branch.
   */
  public getCurrentBranch(): Branch {
    const branch = this.branches.get(this.currentBranchId);
    if (!branch) {
      throw new HomuraHistoryError(`Current branch "${this.currentBranchId}" not found`);
    }
    return branch;
  }

  /**
   * Returns an entry by ID.
   */
  public getEntry(id: string): HistoryEntry<T> | undefined {
    return this.entries.get(id);
  }

  /**
   * Returns all entries as an array.
   */
  public getAllEntries(): HistoryEntry<T>[] {
    return Array.from(this.entries.values()).sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Returns all branches as an array.
   */
  public getBranches(): Branch[] {
    return Array.from(this.branches.values());
  }

  /**
   * Returns the linear timeline leading from root up to the given or active entry/branch.
   */
  public getTimeline(targetEntryId?: string): HistoryEntry<T>[] {
    const endId = targetEntryId ?? this.currentEntryId;
    const timeline: HistoryEntry<T>[] = [];
    let current = this.entries.get(endId);

    while (current) {
      timeline.unshift(current);
      if (!current.parentId) break;
      current = this.entries.get(current.parentId);
    }

    return timeline;
  }

  /**
   * Adds a new state entry to the history graph.
   * Handles branching automatically if diverging from an ancestor node.
   */
  public addEntry(
    state: T,
    label: string = 'Update state',
    metadata?: Record<string, unknown>
  ): { entry: HistoryEntry<T>; newBranchCreated?: Branch } {
    const currentEntry = this.getCurrentEntry();
    const currentBranch = this.getCurrentBranch();

    let targetBranchId = this.currentBranchId;
    let newBranchCreated: Branch | undefined;

    // Check if we are diverging from a historical node (not at head of branch)
    const isAtBranchHead = currentEntry.id === currentBranch.headEntryId;

    if (!isAtBranchHead && this.autoBranchOnDivergence) {
      // Create a new branch
      this.branchCounter++;
      const branchId = `branch-${this.branchCounter}`;
      const branchName = `branch-${this.branchCounter}`;

      const newBranch: Branch = {
        id: branchId,
        name: branchName,
        createdAt: Date.now(),
        rootEntryId: currentEntry.id,
        headEntryId: '' // will be set below
      };

      this.branches.set(branchId, newBranch);
      this.currentBranchId = branchId;
      targetBranchId = branchId;
      newBranchCreated = newBranch;
    }

    const newId = generateId('ent');
    const newEntry: HistoryEntry<T> = {
      id: newId,
      parentId: currentEntry.id,
      childrenIds: [],
      branchId: targetBranchId,
      timestamp: Date.now(),
      label,
      state: deepClone(state),
      metadata: metadata ? { ...metadata } : undefined
    };

    // Update parent's children
    currentEntry.childrenIds.push(newId);

    // Save new entry
    this.entries.set(newId, newEntry);
    this.currentEntryId = newId;

    // Update branch head
    const activeBranch = this.branches.get(targetBranchId)!;
    activeBranch.headEntryId = newId;

    // Prune if exceeds max history
    if (this.maxHistory > 0 && this.entries.size > this.maxHistory) {
      this.prune(this.maxHistory);
    }

    return { entry: newEntry, newBranchCreated };
  }

  /**
   * Undoes one step to the parent entry.
   */
  public undo(): HistoryEntry<T> | null {
    const current = this.getCurrentEntry();
    if (!current.parentId) {
      return null;
    }

    const parent = this.entries.get(current.parentId);
    if (!parent) {
      return null;
    }

    this.currentEntryId = parent.id;
    // If parent belongs to a different branch, switch active branch
    if (parent.branchId !== this.currentBranchId && this.branches.has(parent.branchId)) {
      this.currentBranchId = parent.branchId;
    }

    return parent;
  }

  /**
   * Redoes one step forward to a child node.
   */
  public redo(): HistoryEntry<T> | null {
    const current = this.getCurrentEntry();
    if (current.childrenIds.length === 0) {
      return null;
    }

    // Try finding child in current branch first
    let nextChildId = current.childrenIds.find(id => {
      const child = this.entries.get(id);
      return child && child.branchId === this.currentBranchId;
    });

    // Otherwise take the latest child
    if (!nextChildId) {
      nextChildId = current.childrenIds[current.childrenIds.length - 1]!;
    }

    const nextEntry = this.entries.get(nextChildId);
    if (!nextEntry) return null;

    this.currentEntryId = nextEntry.id;
    if (nextEntry.branchId !== this.currentBranchId && this.branches.has(nextEntry.branchId)) {
      this.currentBranchId = nextEntry.branchId;
    }

    return nextEntry;
  }

  /**
   * Rewinds N steps backwards in history.
   */
  public rewind(steps: number): HistoryEntry<T> | null {
    if (steps <= 0) return this.getCurrentEntry();

    let current: HistoryEntry<T> | null = this.getCurrentEntry();
    let count = 0;

    while (current && count < steps) {
      if (!current.parentId) break;
      const parent = this.entries.get(current.parentId);
      if (!parent) break;
      current = parent;
      count++;
    }

    if (current) {
      this.currentEntryId = current.id;
      if (current.branchId !== this.currentBranchId && this.branches.has(current.branchId)) {
        this.currentBranchId = current.branchId;
      }
    }

    return current;
  }

  /**
   * Fast-forwards N steps forward in history towards branch head.
   */
  public fastForward(steps: number): HistoryEntry<T> | null {
    if (steps <= 0) return this.getCurrentEntry();

    let current: HistoryEntry<T> | null = this.getCurrentEntry();
    let count = 0;

    while (current && count < steps) {
      if (current.childrenIds.length === 0) break;

      let nextChildId = current.childrenIds.find(id => {
        const child = this.entries.get(id);
        return child && child.branchId === this.currentBranchId;
      });

      if (!nextChildId) {
        nextChildId = current.childrenIds[current.childrenIds.length - 1]!;
      }

      const nextEntry = this.entries.get(nextChildId);
      if (!nextEntry) break;

      current = nextEntry;
      count++;
    }

    if (current) {
      this.currentEntryId = current.id;
      if (current.branchId !== this.currentBranchId && this.branches.has(current.branchId)) {
        this.currentBranchId = current.branchId;
      }
    }

    return current;
  }

  /**
   * Jumps directly to an entry by ID.
   */
  public jumpTo(entryId: string): HistoryEntry<T> {
    const entry = this.entries.get(entryId);
    if (!entry) {
      throw new HomuraHistoryError(`History entry "${entryId}" does not exist`, entryId);
    }

    this.currentEntryId = entry.id;
    if (entry.branchId && this.branches.has(entry.branchId)) {
      this.currentBranchId = entry.branchId;
    }

    return entry;
  }

  /**
   * Creates a new branch explicitly.
   */
  public createBranch(name: string, fromEntryId?: string): Branch {
    const targetEntryId = fromEntryId ?? this.currentEntryId;
    const targetEntry = this.entries.get(targetEntryId);
    if (!targetEntry) {
      throw new HomuraHistoryError(`Cannot create branch from non-existent entry "${targetEntryId}"`);
    }

    const branchId = generateId('branch');
    const newBranch: Branch = {
      id: branchId,
      name,
      createdAt: Date.now(),
      rootEntryId: targetEntry.id,
      headEntryId: targetEntry.id
    };

    this.branches.set(branchId, newBranch);
    this.currentBranchId = branchId;
    this.currentEntryId = targetEntry.id;

    return newBranch;
  }

  /**
   * Switches active branch.
   */
  public switchBranch(branchId: string): HistoryEntry<T> {
    const branch = this.branches.get(branchId);
    if (!branch) {
      throw new HomuraHistoryError(`Branch "${branchId}" does not exist`);
    }

    this.currentBranchId = branchId;
    const headEntry = this.entries.get(branch.headEntryId);
    if (headEntry) {
      this.currentEntryId = headEntry.id;
      return headEntry;
    }

    return this.getCurrentEntry();
  }

  /**
   * Deletes a branch.
   */
  public deleteBranch(branchId: string): void {
    if (branchId === this.currentBranchId) {
      throw new HomuraHistoryError(`Cannot delete active branch "${branchId}". Switch to another branch first.`);
    }

    if (branchId === 'main') {
      throw new HomuraHistoryError(`Cannot delete default "main" branch.`);
    }

    if (!this.branches.has(branchId)) {
      throw new HomuraHistoryError(`Branch "${branchId}" does not exist`);
    }

    this.branches.delete(branchId);
  }

  /**
   * Clears all history entries and resets to a single root node with the given state.
   */
  public clear(state: T): void {
    this.entries.clear();
    this.branches.clear();

    const rootId = generateId('root');
    const defaultBranchId = 'main';

    const rootEntry: HistoryEntry<T> = {
      id: rootId,
      parentId: null,
      childrenIds: [],
      branchId: defaultBranchId,
      timestamp: Date.now(),
      label: 'History cleared',
      state: deepClone(state),
      metadata: { cleared: true }
    };

    const mainBranch: Branch = {
      id: defaultBranchId,
      name: 'main',
      createdAt: Date.now(),
      rootEntryId: rootId,
      headEntryId: rootId
    };

    this.entries.set(rootId, rootEntry);
    this.branches.set(defaultBranchId, mainBranch);
    this.rootEntryId = rootId;
    this.currentEntryId = rootId;
    this.currentBranchId = defaultBranchId;
  }

  /**
   * Prunes oldest history entries while preserving active pointers and branch heads.
   */
  public prune(maxEntries: number): number {
    if (this.entries.size <= maxEntries) {
      return 0;
    }

    // Essential entries that must NOT be pruned
    const protectedIds = new Set<string>();
    protectedIds.add(this.currentEntryId);
    protectedIds.add(this.rootEntryId);

    for (const b of this.branches.values()) {
      protectedIds.add(b.headEntryId);
      protectedIds.add(b.rootEntryId);
    }

    // Protect timeline leading to current entry
    let cur = this.entries.get(this.currentEntryId);
    while (cur) {
      protectedIds.add(cur.id);
      if (!cur.parentId) break;
      cur = this.entries.get(cur.parentId);
    }

    // Sort entries by timestamp ascending (oldest first)
    const sorted = Array.from(this.entries.values()).sort((a, b) => a.timestamp - b.timestamp);
    let removedCount = 0;

    for (const entry of sorted) {
      if (this.entries.size <= maxEntries) break;
      if (protectedIds.has(entry.id)) continue;

      // Remove from parent's children
      if (entry.parentId) {
        const parent = this.entries.get(entry.parentId);
        if (parent) {
          parent.childrenIds = parent.childrenIds.filter(id => id !== entry.id);
        }
      }

      // Re-parent children if any
      for (const childId of entry.childrenIds) {
        const child = this.entries.get(childId);
        if (child) {
          child.parentId = entry.parentId;
        }
      }

      this.entries.delete(entry.id);
      removedCount++;
    }

    return removedCount;
  }

  /**
   * Exports raw graph for serialization.
   */
  public exportData(): {
    rootEntryId: string;
    currentEntryId: string;
    currentBranchId: string;
    entries: Record<string, HistoryEntry<T>>;
    branches: Record<string, Branch>;
  } {
    const entriesObj: Record<string, HistoryEntry<T>> = {};
    for (const [k, v] of this.entries.entries()) {
      entriesObj[k] = deepClone(v);
    }

    const branchesObj: Record<string, Branch> = {};
    for (const [k, v] of this.branches.entries()) {
      branchesObj[k] = deepClone(v);
    }

    return {
      rootEntryId: this.rootEntryId,
      currentEntryId: this.currentEntryId,
      currentBranchId: this.currentBranchId,
      entries: entriesObj,
      branches: branchesObj
    };
  }

  /**
   * Imports serialized graph data.
   */
  public importData(data: SerializedHomura<T>): void {
    if (!data.entries || !data.currentEntryId || !data.currentBranchId) {
      throw new HomuraHistoryError('Invalid serialized Homura history data');
    }

    this.entries.clear();
    for (const [k, v] of Object.entries(data.entries)) {
      this.entries.set(k, deepClone(v));
    }

    this.branches.clear();
    for (const [k, v] of Object.entries(data.branches)) {
      this.branches.set(k, deepClone(v));
    }

    this.rootEntryId = data.rootEntryId || Object.keys(data.entries)[0]!;
    this.currentEntryId = data.currentEntryId;
    this.currentBranchId = data.currentBranchId;
  }
}

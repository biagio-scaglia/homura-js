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
   * Finds the lowest common ancestor node between two entries in the DAG.
   */
  public findCommonAncestor(entryIdA: string, entryIdB: string): string | null {
    const ancestorsA = new Set<string>();
    let curA: string | null = entryIdA;
    while (curA) {
      ancestorsA.add(curA);
      const entry = this.entries.get(curA);
      curA = entry ? entry.parentId : null;
    }

    let curB: string | null = entryIdB;
    while (curB) {
      if (ancestorsA.has(curB)) {
        return curB;
      }
      const entry = this.entries.get(curB);
      curB = entry ? entry.parentId : null;
    }

    return null;
  }

  /**
   * Returns ordered array of entry IDs representing the chronological path between two entries.
   */
  public getPathBetween(fromEntryId: string, toEntryId: string): string[] {
    if (fromEntryId === toEntryId) {
      return [fromEntryId];
    }

    // Check if toEntryId is a descendant of fromEntryId
    const forwardPath: string[] = [];
    let cur: string | null = toEntryId;
    while (cur) {
      forwardPath.unshift(cur);
      if (cur === fromEntryId) {
        return forwardPath;
      }
      const ent = this.entries.get(cur);
      cur = ent ? ent.parentId : null;
    }

    // Check if fromEntryId is a descendant of toEntryId (rewind path)
    const reversePath: string[] = [];
    cur = fromEntryId;
    while (cur) {
      reversePath.push(cur);
      if (cur === toEntryId) {
        return reversePath;
      }
      const ent = this.entries.get(cur);
      cur = ent ? ent.parentId : null;
    }

    // Divergent branches: go up to common ancestor and then down to toEntryId
    const ancestorId = this.findCommonAncestor(fromEntryId, toEntryId);
    if (!ancestorId) {
      return [fromEntryId, toEntryId];
    }

    const upPath: string[] = [];
    cur = fromEntryId;
    while (cur && cur !== ancestorId) {
      upPath.push(cur);
      const ent = this.entries.get(cur);
      cur = ent ? ent.parentId : null;
    }
    upPath.push(ancestorId);

    const downPath: string[] = [];
    cur = toEntryId;
    while (cur && cur !== ancestorId) {
      downPath.unshift(cur);
      const ent = this.entries.get(cur);
      cur = ent ? ent.parentId : null;
    }

    return [...upPath, ...downPath];
  }

  /**
   * Compares two branches and returns common ancestor, ahead/behind counts.
   */
  public compareBranches(branchIdA: string, branchIdB: string): {
    branchA: string;
    branchB: string;
    commonAncestorId: string | null;
    aheadCount: number;
    behindCount: number;
    headA: HistoryEntry<T>;
    headB: HistoryEntry<T>;
  } {
    const branchA = this.branches.get(branchIdA);
    const branchB = this.branches.get(branchIdB);
    if (!branchA) throw new HomuraHistoryError(`Branch "${branchIdA}" not found`);
    if (!branchB) throw new HomuraHistoryError(`Branch "${branchIdB}" not found`);

    const headA = this.entries.get(branchA.headEntryId)!;
    const headB = this.entries.get(branchB.headEntryId)!;

    const commonAncestorId = this.findCommonAncestor(headA.id, headB.id);

    let aheadCount = 0;
    let curA: string | null = headA.id;
    while (curA && curA !== commonAncestorId) {
      aheadCount++;
      const ent = this.entries.get(curA);
      curA = ent ? ent.parentId : null;
    }

    let behindCount = 0;
    let curB: string | null = headB.id;
    while (curB && curB !== commonAncestorId) {
      behindCount++;
      const ent = this.entries.get(curB);
      curB = ent ? ent.parentId : null;
    }

    return {
      branchA: branchIdA,
      branchB: branchIdB,
      commonAncestorId,
      aheadCount,
      behindCount,
      headA,
      headB
    };
  }

  /**
   * Merges a source branch into the current active branch.
   */
  public mergeBranch(
    sourceBranchId: string,
    options: { label?: string; metadata?: Record<string, unknown>; strategy?: 'fast-forward' | 'three-way' } = {}
  ): HistoryEntry<T> {
    const targetBranch = this.getCurrentBranch();
    const sourceBranch = this.branches.get(sourceBranchId);

    if (!sourceBranch) {
      throw new HomuraHistoryError(`Source branch "${sourceBranchId}" not found for merge`);
    }
    if (sourceBranch.id === targetBranch.id) {
      throw new HomuraHistoryError(`Cannot merge branch "${sourceBranchId}" into itself`);
    }

    const targetHead = this.entries.get(targetBranch.headEntryId)!;
    const sourceHead = this.entries.get(sourceBranch.headEntryId)!;

    const label = options.label ?? `Merge branch '${sourceBranch.name}' into '${targetBranch.name}'`;
    const metadata = {
      ...options.metadata,
      merge: {
        sourceBranchId: sourceBranch.id,
        targetBranchId: targetBranch.id,
        sourceHeadId: sourceHead.id,
        targetHeadId: targetHead.id
      }
    };

    // Create merge commit node on target branch
    const mergeEntryId = generateId('merge');
    const mergeEntry: HistoryEntry<T> = {
      id: mergeEntryId,
      parentId: targetHead.id,
      childrenIds: [],
      branchId: targetBranch.id,
      timestamp: Date.now(),
      label,
      state: deepClone(sourceHead.state),
      metadata
    };

    targetHead.childrenIds.push(mergeEntryId);
    this.entries.set(mergeEntryId, mergeEntry);
    targetBranch.headEntryId = mergeEntryId;
    this.currentEntryId = mergeEntryId;

    return mergeEntry;
  }

  /**
   * Compacts history graph by removing redundant intermediate nodes while preserving topology.
   */
  public compact(options: { maxEntries?: number; preserveSnapshots?: boolean; snapshotEntryIds?: Set<string> } = {}): number {
    const maxEntries = options.maxEntries ?? this.maxHistory;
    const snapshotIds = options.snapshotEntryIds ?? new Set<string>();

    const protectedIds = new Set<string>([this.rootEntryId, this.currentEntryId]);
    for (const b of this.branches.values()) {
      protectedIds.add(b.headEntryId);
      protectedIds.add(b.rootEntryId);
    }
    for (const sId of snapshotIds) {
      protectedIds.add(sId);
    }

    let removedCount = 0;
    const all = Array.from(this.entries.values()).sort((a, b) => a.timestamp - b.timestamp);

    for (const entry of all) {
      if (this.entries.size <= maxEntries) break;
      if (protectedIds.has(entry.id)) continue;

      // Unlink node and bypass
      if (entry.parentId) {
        const parent = this.entries.get(entry.parentId);
        if (parent) {
          parent.childrenIds = parent.childrenIds.filter(id => id !== entry.id);
          for (const childId of entry.childrenIds) {
            if (!parent.childrenIds.includes(childId)) {
              parent.childrenIds.push(childId);
            }
          }
        }
      }

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

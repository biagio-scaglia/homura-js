/**
 * Base error class for all Homura errors.
 */
export class HomuraError extends Error {
  public override readonly name: string = 'HomuraError';

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error related to history traversal, invalid jumps, undos, redos, or missing entries.
 */
export class HomuraHistoryError extends HomuraError {
  public override readonly name: string = 'HomuraHistoryError';

  constructor(message: string, public readonly entryId?: string) {
    super(message);
  }
}

/**
 * Error related to snapshot operations (not found, corrupted, invalid restore).
 */
export class HomuraSnapshotError extends HomuraError {
  public override readonly name: string = 'HomuraSnapshotError';

  constructor(message: string, public readonly snapshotId?: string) {
    super(message);
  }
}

/**
 * Error related to branch operations (branch not found, active branch deletion).
 */
export class HomuraBranchError extends HomuraError {
  public override readonly name: string = 'HomuraBranchError';

  constructor(message: string, public readonly branchId?: string) {
    super(message);
  }
}

/**
 * Error related to state serialization or deserialization format issues.
 */
export class HomuraSerializationError extends HomuraError {
  public override readonly name: string = 'HomuraSerializationError';

  constructor(message: string, public readonly cause?: unknown) {
    super(message);
  }
}

/**
 * Error related to persistence adapters (save/load/clear failures).
 */
export class HomuraPersistenceError extends HomuraError {
  public override readonly name: string = 'HomuraPersistenceError';

  constructor(message: string, public readonly cause?: unknown) {
    super(message);
  }
}

/**
 * Error related to middleware execution or cancellation.
 */
export class HomuraMiddlewareError extends HomuraError {
  public override readonly name: string = 'HomuraMiddlewareError';

  constructor(message: string) {
    super(message);
  }
}

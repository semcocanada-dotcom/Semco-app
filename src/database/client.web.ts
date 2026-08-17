import * as schema from './schema';

type Row = Record<string, unknown>;

class NoopQuery<T = unknown> implements PromiseLike<T> {
  constructor(private readonly result: T) {}

  // Chainable query builder methods used throughout the app.
  select() { return this; }
  insert(_table?: unknown) { return this; }
  update(_table?: unknown) { return this; }
  delete(_table?: unknown) { return this; }
  from(_table?: unknown) { return this; }
  values(_values?: unknown) { return this; }
  set(_values?: unknown) { return this; }
  where(_condition?: unknown) { return this; }
  orderBy(..._args: unknown[]) { return this; }
  groupBy(..._args: unknown[]) { return this; }
  limit(_count?: number) { return this; }
  offset(_count?: number) { return this; }
  returning(_fields?: unknown) { return this; }
  onConflictDoNothing(_opts?: unknown) { return this; }
  onConflictDoUpdate(_opts?: unknown) { return this; }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.result).then(onfulfilled, onrejected);
  }
}

const emptyRows: Row[] = [];

export const db = {
  select: () => new NoopQuery<Row[]>(emptyRows),
  insert: () => new NoopQuery<unknown>(undefined),
  update: () => new NoopQuery<unknown>(undefined),
  delete: () => new NoopQuery<unknown>(undefined),
} as const;

export const sqlite = {
  execAsync: async () => undefined,
  getAllAsync: async <T = Row>() => [] as T[],
};

export async function initDatabase() {
  return undefined;
}

export { schema };

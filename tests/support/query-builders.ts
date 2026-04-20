import { vi } from "vitest";

export function createWhereFirstBuilder<T>(result: T) {
  const builder = {
    where: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(result),
  };

  return builder;
}

export function createSelectFirstBuilder<T>(result: T) {
  const builder = {
    where: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(result),
  };

  return builder;
}

export function createInsertBuilder<T>(result: T) {
  const builder = {
    insert: vi.fn().mockResolvedValue(result),
  };

  return builder;
}

export function createWhereSelectFirstBuilder<T>(result: T) {
  const builder = {
    where: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(result),
  };

  return builder;
}

export function createUpdateBuilder(result = 1) {
  const builder = {
    where: vi.fn().mockReturnThis(),
    update: vi.fn().mockResolvedValue(result),
  };

  return builder;
}

export function createDeleteBuilder(result = 1) {
  const builder = {
    where: vi.fn().mockReturnThis(),
    delete: vi.fn().mockResolvedValue(result),
  };

  return builder;
}

export function createOrderedRowsBuilder<T>(rows: T[]) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    whereIn: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue(rows),
  };

  return builder;
}

export function createNotesListBuilder<T>(rows: T[]) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    modify: vi.fn((callback: (query: typeof builder) => void) => {
      callback(builder);
      return builder;
    }),
    whereILike: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    whereIn: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    havingRaw: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue(rows),
  };

  return builder;
}

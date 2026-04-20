import { AppError } from "../errors/app-error";

type ObjectBody = Record<string, unknown>;

export function ensureObjectBody(value: unknown): ObjectBody {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AppError("Request body must be a valid object.", 400);
  }

  return value as ObjectBody;
}

export function ensureNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(`Field "${field}" is required.`, 400);
  }

  return value.trim();
}

export function ensureOptionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new AppError(`Field "${field}" must be a string.`, 400);
  }

  const normalizedValue = value.trim();
  return normalizedValue || undefined;
}

export function ensureStringArray(value: unknown, field: string): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new AppError(`Field "${field}" must be an array of strings.`, 400);
  }

  return value.map((item) => {
    if (typeof item !== "string" || !item.trim()) {
      throw new AppError(`Field "${field}" must contain only strings.`, 400);
    }

    return item.trim();
  });
}

export function ensurePositiveInteger(value: unknown, field: string): number {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new AppError(`Field "${field}" must be a positive integer.`, 400);
  }

  return parsedValue;
}

export function ensureOptionalQueryString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new AppError("Invalid query parameter.", 400);
  }

  const normalizedValue = value.trim();
  return normalizedValue || undefined;
}

export function ensureTagsQuery(value: unknown): string[] {
  const normalizedValue = ensureOptionalQueryString(value);

  if (!normalizedValue) {
    return [];
  }

  return normalizedValue
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

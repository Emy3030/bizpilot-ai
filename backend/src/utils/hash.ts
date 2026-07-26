import crypto from 'crypto';

/**
 * Produces a deterministic SHA-256 hash of a document's canonical data.
 * This hash is what eventually gets anchored on-chain — the underlying
 * business data (invoice/receipt contents) never leaves the database.
 */
export function hashDocument(data: Record<string, unknown>): string {
  const canonical = JSON.stringify(sortKeysDeep(data));
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value !== null && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

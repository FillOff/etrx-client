function collectMessages(value: unknown): string[] {
  if (typeof value === 'string') return value.trim() ? [value] : [];
  if (Array.isArray(value))
    return value.filter((item): item is string => typeof item === 'string');
  if (value && typeof value === 'object')
    return Object.values(value).flatMap((item) =>
      typeof item === 'string'
        ? [item]
        : Array.isArray(item)
          ? item.filter((entry): entry is string => typeof entry === 'string')
          : [],
    );
  return [];
}

export function getApiErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;
  const response = data as Record<string, unknown>;
  for (const value of [response.message, response.Errors, response.errors]) {
    const messages = collectMessages(value).filter((message) => message.trim());
    if (messages.length) return messages.join(' ');
  }
  return fallback;
}

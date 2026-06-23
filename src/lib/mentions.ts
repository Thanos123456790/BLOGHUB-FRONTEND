/** Returns the @query currently being typed right before the cursor, or null. */
export function getActiveMentionQuery(
  text: string,
  cursor: number
): { query: string; start: number } | null {
  const upToCursor = text.slice(0, cursor);
  const match = upToCursor.match(/(?:^|\s)@([a-zA-Z0-9_]*)$/);
  if (!match) return null;
  const start = upToCursor.lastIndexOf("@");
  return { query: match[1], start };
}

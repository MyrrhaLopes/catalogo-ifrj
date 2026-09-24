export function highlightTerms(text: string, query: string): string {
  if (!query.trim()) return text;

  const tokens = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (tokens.length === 0) return text;

  const pattern = new RegExp(`(${tokens.join("|")})`, "gi");
  return text.replace(pattern, "<strong>$1</strong>");
}

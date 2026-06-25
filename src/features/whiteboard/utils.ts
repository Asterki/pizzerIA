import type { Whiteboard } from "./types";
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
export function getSearchableText(wb: Whiteboard): string {
  const parts: string[] = [];

  if (wb.title) parts.push(wb.title);
  if (wb.tags) parts.push(...wb.tags);
  if (wb.authorId) parts.push(wb.authorId);

  for (const node of wb.nodes) {
    if ("label" in node && node.label) parts.push(node.label);
    if ("content" in node && typeof node.content === "string") {
      parts.push(node.content);
    }
  }

  // Chat message text
  for (const msg of wb.chat.messages) {
    for (const part of msg.content) {
      if (part.type === "text") parts.push(part.text);
      if (part.type === "markdown") parts.push(part.markdown);
      if (part.type === "code") parts.push(part.code);
    }
  }

  return normalize(parts.join(" "));
}

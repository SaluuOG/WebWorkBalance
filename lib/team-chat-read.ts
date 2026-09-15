import type { TeamChatMessage } from "./webworkbalance";

export function parseChatReadIds(value: string | null): string[] {
  try {
    const parsed: unknown = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? [...new Set(parsed.filter((id): id is string => typeof id === "string" && id.length <= 240))].slice(-600) : [];
  } catch { return []; }
}

export function mergeChatReadIds(previous: string[], ids: string[]): string[] {
  return [...new Set([...previous, ...ids])].slice(-600);
}

export function unreadChatCount(messages: TeamChatMessage[], userId: string, readIds: string[]): number {
  const read = new Set(readIds);
  return messages.filter((message) => message.authorId !== userId && !read.has(message.id)).length;
}

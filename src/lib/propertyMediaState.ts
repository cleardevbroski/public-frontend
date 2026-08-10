/** Merge completed uploads into the latest form state without stale async
 * callbacks replacing photos that finished before or after them. */
export function mergeUploadedMedia(current: string[] = [], additions: string[] = [], max = Number.POSITIVE_INFINITY): string[] {
  return [...new Set([...current, ...additions].map((value) => value.trim()).filter(Boolean))].slice(0, max);
}

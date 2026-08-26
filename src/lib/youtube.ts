const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

export function youtubeVideoId(value?: string) {
  if (!value) return "";
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let candidate = "";
    if (host === "youtu.be") candidate = url.pathname.split("/").filter(Boolean)[0] || "";
    if (["youtube.com", "m.youtube.com"].includes(host)) {
      candidate = url.searchParams.get("v") || "";
      if (!candidate) {
        const parts = url.pathname.split("/").filter(Boolean);
        if (["shorts", "embed", "live"].includes(parts[0])) candidate = parts[1] || "";
      }
    }
    return VIDEO_ID.test(candidate) ? candidate : "";
  } catch {
    return "";
  }
}

export function canonicalYoutubeUrl(value?: string) {
  const id = youtubeVideoId(value);
  return id ? `https://www.youtube.com/watch?v=${id}` : "";
}

export function youtubeThumbnail(value?: string) {
  const id = youtubeVideoId(value);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
}


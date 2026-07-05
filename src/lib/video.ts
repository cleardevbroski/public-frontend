/** Video URL helpers — supports YouTube links, Vimeo, and direct/base64 video files. */

/** Extract a YouTube video id from any common YouTube URL form. */
export function youtubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

/** Extract a Vimeo id. */
export function vimeoId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

/** A privacy-friendly embeddable URL for YouTube/Vimeo, or null if not embeddable. */
export function embedUrl(url: string): string | null {
  const yt = youtubeId(url);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt}?rel=0`;
  const vm = vimeoId(url);
  if (vm) return `https://player.vimeo.com/video/${vm}`;
  return null;
}

/** A thumbnail image for a YouTube link (used in admin previews). */
export function youtubeThumb(url: string): string | null {
  const id = youtubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function isEmbeddable(url: string): boolean {
  return embedUrl(url) !== null;
}

/** True for a base64 / blob / direct file source we can feed to <video>. */
export function isDirectVideo(url: string): boolean {
  return (
    url.startsWith("data:") ||
    url.startsWith("blob:") ||
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)
  );
}

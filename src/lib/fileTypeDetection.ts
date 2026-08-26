export type DetectedFileType = {
  mime: string;
  label: string;
  extension: string;
  declaredMime: string;
  mismatch: boolean;
};

const TYPES: Record<string, Omit<DetectedFileType, "declaredMime" | "mismatch">> = {
  "image/jpeg": { mime: "image/jpeg", label: "JPEG", extension: "jpg" },
  "image/png": { mime: "image/png", label: "PNG", extension: "png" },
  "image/webp": { mime: "image/webp", label: "WebP", extension: "webp" },
  "image/avif": { mime: "image/avif", label: "AVIF", extension: "avif" },
  "image/heic": { mime: "image/heic", label: "HEIC/HEIF", extension: "heic" },
  "application/pdf": { mime: "application/pdf", label: "PDF", extension: "pdf" },
  "video/mp4": { mime: "video/mp4", label: "MP4", extension: "mp4" },
};

function ascii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.subarray(start, end));
}

export async function detectFileType(file: File): Promise<DetectedFileType> {
  const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  let mime = "";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) mime = "image/jpeg";
  else if (bytes.length >= 8 && bytes[0] === 0x89 && ascii(bytes, 1, 4) === "PNG") mime = "image/png";
  else if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") mime = "image/webp";
  else if (bytes.length >= 5 && ascii(bytes, 0, 5) === "%PDF-") mime = "application/pdf";
  else if (bytes.length >= 12 && ascii(bytes, 4, 8) === "ftyp") {
    const brand = ascii(bytes, 8, 12).toLowerCase();
    if (["avif", "avis"].includes(brand)) mime = "image/avif";
    else if (["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1"].includes(brand)) mime = "image/heic";
    else mime = "video/mp4";
  }

  const declaredMime = String(file.type || "").toLowerCase();
  const resolved = TYPES[mime] || {
    mime: mime || declaredMime || "application/octet-stream",
    label: "unknown",
    extension: "",
  };
  return {
    ...resolved,
    declaredMime,
    mismatch: Boolean(mime && declaredMime && mime !== declaredMime && !(declaredMime === "image/jpg" && mime === "image/jpeg")),
  };
}

export function correctedFile(file: File, detected: DetectedFileType) {
  if (!detected.mime || detected.mime === file.type) return file;
  return new File([file], file.name, { type: detected.mime, lastModified: file.lastModified });
}

export function fileFingerprint(file: File) {
  return `${file.name.toLowerCase()}::${file.size}::${file.lastModified}`;
}


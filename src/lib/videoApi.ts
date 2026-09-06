export type UploadedVideo = {
  id: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
  url: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

export function getApiBase() {
  return API_BASE;
}

export async function uploadVideo(file: File): Promise<UploadedVideo> {
  const body = new FormData();
  body.append("file", file);

  const res = await fetch(`${API_BASE}/api/videos`, {
    method: "POST",
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Upload failed (${res.status})`);
  }

  return (await res.json()) as UploadedVideo;
}

export async function listVideos(): Promise<UploadedVideo[]> {
  const res = await fetch(`${API_BASE}/api/videos`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not list videos (${res.status})`);
  return (await res.json()) as UploadedVideo[];
}

export function videoFileUrl(id: string) {
  return `${API_BASE}/api/videos/${id}/file`;
}

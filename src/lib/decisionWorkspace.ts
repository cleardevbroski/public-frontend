import { addDecisionWorkspaceProperty, createDecisionWorkspace } from "./api";

const STORAGE_KEY = "cleartitle_family_workspace";
const PARTICIPANT_KEY = "cleartitle_family_participant";

export type StoredWorkspace = { id: string; ownerToken: string; shareToken: string; expiresAt: string };

export function getStoredWorkspace(): StoredWorkspace | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return value?.id && value?.ownerToken ? value : null;
  } catch { return null; }
}

export function storeWorkspace(value: StoredWorkspace) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("cleartitle:family-workspace-changed", { detail: value }));
}

export function workspaceHref(id: string, token: string) {
  return `/family-workspace/${encodeURIComponent(id)}#${encodeURIComponent(token)}`;
}

export async function ensureWorkspaceWithProperty(propertyId: string): Promise<StoredWorkspace> {
  const existing = getStoredWorkspace();
  if (existing && new Date(existing.expiresAt).getTime() > Date.now()) {
    await addDecisionWorkspaceProperty(existing.id, existing.ownerToken, propertyId);
    return existing;
  }
  const created = await createDecisionWorkspace([propertyId]);
  const workspace = { id: created.workspaceId, ownerToken: created.ownerToken, shareToken: created.shareToken, expiresAt: created.expiresAt };
  storeWorkspace(workspace);
  return workspace;
}

export function getParticipantId() {
  if (typeof window === "undefined") return "participant";
  let id = localStorage.getItem(PARTICIPANT_KEY);
  if (!id) {
    id = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(PARTICIPANT_KEY, id);
  }
  return id;
}

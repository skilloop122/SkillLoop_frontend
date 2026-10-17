import { useAuthStore } from "./authStore";

export type SessionRole = "HOST" | "ATTENDEE";

export interface JitsiLaunch {
  provider: "JITSI";
  role: SessionRole;
  roomName: string;
  url?: string;
  domain: string;
  displayName?: string;
  config?: Record<string, unknown>;
}

export type SessionLaunch = JitsiLaunch;

export type LaunchResult =
  | { success: true; data: SessionLaunch }
  | { success: false; message: string; routeMissing?: boolean };

export const DEFAULT_JITSI_DOMAIN = "meet.jit.si";

/**
 * Builds a Jitsi room locally for when the backend launch endpoint is not yet
 * available. Jitsi needs no account or server-side provisioning — any room name
 * works — so both participants derive the same room from the (cryptographically
 * random) session id. A backend launch response always takes precedence once it
 * exists, so fallback is only used when the launch response is unavailable.
 */
export function buildFallbackJitsiLaunch(sessionId: string): JitsiLaunch {
  const roomName = `SkillLoop_${sessionId.replace(/[^a-zA-Z0-9]/g, "")}`;
  return {
    provider: "JITSI",
    role: "ATTENDEE",
    roomName,
    url: `https://${DEFAULT_JITSI_DOMAIN}/${roomName}`,
    domain: DEFAULT_JITSI_DOMAIN,
  };
}

const API_BASE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "";

const launchPath = (sessionId: string) => `sessions/${sessionId}/launch`;

// Once the launch route is seen to be absent, stop probing it for the rest
// of the page session. This avoids a failed request per room open while the
// backend endpoint is still unimplemented.
let launchRouteMissing = false;

/**
 * Converts an untrusted launch response into the props required by
 * `JitsiMeeting`. In particular, `roomName` must be present: the Jitsi SDK
 * calls `.split()` on it while mounting.
 */
function parseJitsiLaunch(data: Record<string, unknown>): JitsiLaunch | null {
  if (data.provider !== "JITSI" || typeof data.roomName !== "string" || !data.roomName.trim()) {
    return null;
  }

  return {
    provider: "JITSI",
    role: data.role === "HOST" ? "HOST" : "ATTENDEE",
    roomName: data.roomName.trim(),
    domain:
      typeof data.domain === "string" && data.domain.trim()
        ? data.domain.trim()
        : DEFAULT_JITSI_DOMAIN,
    ...(typeof data.url === "string" ? { url: data.url } : {}),
    ...(typeof data.displayName === "string" ? { displayName: data.displayName } : {}),
    ...(isRecord(data.config) ? { config: data.config } : {}),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Resolves the video configuration for a session through the unified launch
 * endpoint. The route is only treated as absent when Express returns an HTML
 * "Cannot GET" page, so an authenticated 401/403 is not masked.
 */
export async function fetchSessionLaunch(
  sessionId: string,
): Promise<LaunchResult> {
  const token = useAuthStore.getState().token;
  if (!token) {
    return { success: false, message: "Please sign in to join this session." };
  }

  if (launchRouteMissing) {
    return {
      success: false,
      message: "Video launching is not available for this session yet.",
      routeMissing: true,
    };
  }

  const path = launchPath(sessionId);
  let response: Response;
  try {
    response = await fetch(API_BASE + path, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return { success: false, message: "Could not reach the video service." };
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    launchRouteMissing = true;
    return {
      success: false,
      message: "Video launching is not available for this session yet.",
      routeMissing: true,
    };
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return { success: false, message: "Failed to start the session." };
  }

  if (!response.ok) {
    const errorData = isRecord(data) ? data : {};
    return {
      success: false,
      message:
        (typeof errorData.message === "string" ? errorData.message : undefined) ||
        (typeof errorData.error === "string" ? errorData.error : undefined) ||
        "Failed to start the session.",
    };
  }

  const launch = isRecord(data) ? parseJitsiLaunch(data) : null;
  if (!launch) {
    // If the backend response is not a valid Jitsi launch, fall back to the
    // deterministic room used by both attendees.
    return { success: true, data: buildFallbackJitsiLaunch(sessionId) };
  }

  return { success: true, data: launch };
}

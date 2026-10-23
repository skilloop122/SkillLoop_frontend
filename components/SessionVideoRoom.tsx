"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { useAuthStore } from "../lib/authStore";
import {
  fetchSessionLaunch,
  buildFallbackJitsiLaunch,
  type SessionLaunch,
} from "../lib/videoLaunch";

interface SessionVideoRoomProps {
  sessionId: string;
  isHost?: boolean;
  onSessionComplete?: () => void;
}

const CALL_DURATION_MS = 15 * 60 * 1000;

type JitsiApi = {
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  executeCommand: (command: "hangup") => void;
};

// type JwtPayload = Record<string, unknown>;

/**
 * Decodes claims only for client diagnostics. It does not verify the JWT
 * signature; JaaS performs the authoritative verification when joining.
 */
// function summarizeJitsiJwt(jwt?: string) {
//   if (!jwt) return { present: false };

//   try {
//     const payloadPart = jwt.split(".")[1];
//     if (!payloadPart) throw new Error("JWT payload is missing");
//     const payload = JSON.parse(
//       atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/")),
//     ) as JwtPayload;
//     const context = typeof payload.context === "object" && payload.context !== null
//       ? payload.context as JwtPayload
//       : null;
//     const user = context && typeof context.user === "object" && context.user !== null
//       ? context.user as JwtPayload
//       : null;
//     const expiration = typeof payload.exp === "number" ? payload.exp : null;

//     return {
//       present: true,
//       audience: typeof payload.aud === "string" ? payload.aud : null,
//       issuer: typeof payload.iss === "string" ? payload.iss : null,
//       subject: typeof payload.sub === "string" ? payload.sub : null,
//       room: typeof payload.room === "string" ? payload.room : null,
//       moderator: user?.moderator === true,
//       expiresAt: expiration ? new Date(expiration * 1000).toISOString() : null,
//       expired: expiration ? expiration * 1000 <= Date.now() : null,
//     };
//   } catch {
//     return { present: true, decodable: false };
//   }
// }

function formatRemainingTime(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function SessionVideoRoom({ sessionId, isHost, onSessionComplete }: SessionVideoRoomProps) {
  const { user } = useAuthStore();
  const [launch, setLaunch] = useState<SessionLaunch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const [callStartedAt, /*setCallStartedAt*/] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState(CALL_DURATION_MS);
  const conferenceJoined = useRef(false);
  const apiRef = useRef<JitsiApi | null>(null);
  const completionRequested = useRef(false);

  useEffect(() => {
    let cancelled = false;

    fetchSessionLaunch(sessionId).then((result) => {
      if (cancelled) return;
      if (result.success) {
        // console.info("[video:join] Session launch resolved", {
        //   sessionId,
        //   provider: result.data.provider,
        //   role: result.data.role,
        //   domain: result.data.domain,
        //   roomName: result.data.roomName,
        //   jwtClaims: summarizeJitsiJwt(result.data.jwt),
        // });
        setLaunch(result.data);
      } else if (result.routeMissing) {
        // No launch endpoint yet: derive a Jitsi room locally from the session
        // id so both participants land in the same call.
        const fallbackLaunch: SessionLaunch = {
          ...buildFallbackJitsiLaunch(sessionId),
          role: isHost ? "HOST" : "ATTENDEE",
        };
        // console.warn("[video:join] Launch endpoint unavailable; using fallback room", {
        //   sessionId,
        //   role: fallbackLaunch.role,
        //   domain: fallbackLaunch.domain,
        //   roomName: fallbackLaunch.roomName,
        // });
        setLaunch(fallbackLaunch);
      } else {
        // console.error("[video:join] Session launch failed", {
        //   sessionId,
        //   message: result.message,
        // });
        setError(result.message);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [sessionId, isHost]);

  useEffect(() => {
    if (!launch) return;

    conferenceJoined.current = false;
    const recoveryTimer = window.setTimeout(() => {
      if (!conferenceJoined.current) setShowRecovery(true);
    }, 15_000);

    return () => window.clearTimeout(recoveryTimer);
  }, [launch]);

  const endSession = useCallback(() => {
    if (completionRequested.current) return;
    completionRequested.current = true;
    apiRef.current?.executeCommand("hangup");
    onSessionComplete?.();
  }, [onSessionComplete]);

  useEffect(() => {
    if (!callStartedAt) return;

    const updateRemainingTime = () => {
      const remaining = Math.max(CALL_DURATION_MS - (Date.now() - callStartedAt), 0);
      setRemainingMs(remaining);
      if (remaining === 0) {
        // console.info("[video:timer] Session time elapsed; ending call", { sessionId });
        endSession();
      }
    };

    updateRemainingTime();
    const interval = window.setInterval(updateRemainingTime, 1000);
    return () => window.clearInterval(interval);
  }, [callStartedAt, endSession, sessionId]);

  const handleIframeRef = useCallback((ref: HTMLDivElement) => {
    ref.style.height = "100%";
    ref.style.width = "100%";
    ref.style.border = "none";

    // Jitsi is rendered in a cross-origin iframe. The response-level
    // Permissions-Policy only establishes which origins may receive access;
    // the iframe must also explicitly receive that delegation. Do this here
    // instead of depending on the SDK's generated iframe attributes.
    const iframe = ref.querySelector("iframe");
    if (iframe) {
      // Do not include fullscreen here: Jitsi already adds the legacy
      // allowfullscreen attribute, and Chrome logs a warning when both are set.
      iframe.allow = "camera; microphone; display-capture; autoplay";
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-full min-h-96 flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <p className="text-sm font-medium">Preparing your video room…</p>
      </div>
    );
  }

  if (error && !launch) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />
        <h3 className="mb-2 text-lg font-bold text-slate-900">Unable to start the call</h3>
        <p className="text-sm text-slate-600">{error}</p>
      </div>
    );
  }

  if (!launch) return null;

  const directMeetingUrl = launch.url || `https://${launch.domain}/${launch.roomName}`;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* <div className="flex flex-wrap items-center justify-between gap-2 bg-sky-50 border border-sky-200 rounded-xl px-4 py-2.5 text-xs text-sky-900">
        <span>
          Showing <strong>&quot;Asking to join&quot;</strong>? On public Jitsi, a host must sign in once to unlock the room.
        </span>
        <a
          href={launch.url || `https://${launch.domain}/${launch.roomName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-sky-600 hover:text-sky-800 underline shrink-0"
        >
          Open as Host <ExternalLink size={12} />
        </a>
      </div> */}

      <div className="relative h-187.5 w-full overflow-hidden rounded-xl bg-slate-950 shadow-xl">
        {callStartedAt && (
          <div
            className={`absolute right-4 top-4 z-10 rounded-lg px-3 py-1.5 text-sm font-bold tabular-nums shadow-lg ${
              remainingMs <= 60_000
                ? "bg-red-600 text-white"
                : "bg-slate-950/85 text-white"
            }`}
            aria-live="polite"
          >
            {formatRemainingTime(remainingMs)}
          </div>
        )}
        <JitsiMeeting
          domain={launch.domain}
          roomName={launch.roomName}
          jwt={launch.jwt}
          configOverwrite={{
            ...launch.config,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
          }}
          userInfo={{
            displayName:
              launch.displayName ||
              [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
              (user?.email ? user.email.split("@")[0] : undefined) ||
              "SkilLoop Participant",
            email: user?.email ?? "",
          }}
          // onApiReady={(api: JitsiApi) => {
          //   apiRef.current = api;
          //   console.info("[video:join] Jitsi API ready", {
          //     sessionId,
          //     role: launch.role,
          //     domain: launch.domain,
          //     roomName: launch.roomName,
          //   });
          //   api.on("videoConferenceJoined", (...args) => {
          //     console.info("[video:join] Conference joined", {
          //       sessionId,
          //       role: launch.role,
          //       details: args,
          //     });
          //     conferenceJoined.current = true;
          //     setShowRecovery(false);
          //     setCallStartedAt((startedAt) => startedAt ?? Date.now());
          //   });
          //   api.on("videoConferenceLeft", (...args) => {
          //     console.info("[video:join] Conference left", { sessionId, details: args });
          //   });
          //   api.on("cameraError", (...args) => {
          //     console.error("[video:join] Camera error reported by Jitsi", {
          //       sessionId,
          //       details: args,
          //     });
          //   });
          //   api.on("micError", (...args) => {
          //     console.error("[video:join] Microphone error reported by Jitsi", {
          //       sessionId,
          //       details: args,
          //     });
          //   });
          //   api.on("errorOccurred", (...args) => {
          //     console.error("[video:join] Jitsi conference error", {
          //       sessionId,
          //       details: args,
          //     });
          //   });
          //   api.on("participantRoleChanged", (...args) => {
          //     console.info("[video:join] Participant role changed", {
          //       sessionId,
          //       details: args,
          //     });
          //   });
          //   api.on("readyToClose", (...args) => {
          //     console.info("[video:join] Jitsi requested close", {
          //       sessionId,
          //       details: args,
          //     });
          //   });
          //   api.on("suspendDetected", (...args) => {
          //     console.warn("[video:join] Jitsi detected a suspended connection", {
          //       sessionId,
          //       details: args,
          //     });
          //   });
          // }}
          onReadyToClose={endSession}
          getIFrameRef={handleIframeRef}
        />
      </div>

      {showRecovery && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <span>If the embedded call is taking longer than expected.</span>
          <a
            href={directMeetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-amber-800 underline"
          >
            Open call in a new tab <ExternalLink size={14} />
          </a>
        </div>
      )}
    </div>
  );
}

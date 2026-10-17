"use client";

import { useEffect, useState, useCallback } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { Loader2, AlertCircle } from "lucide-react";
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

export function SessionVideoRoom({ sessionId, isHost, onSessionComplete }: SessionVideoRoomProps) {
  const { user } = useAuthStore();
  const [launch, setLaunch] = useState<SessionLaunch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchSessionLaunch(sessionId).then((result) => {
      if (cancelled) return;
      if (result.success) {
        setLaunch(result.data);
      } else if (result.routeMissing) {
        // No launch endpoint yet: derive a Jitsi room locally from the session
        // id so both participants land in the same call.
        setLaunch({
          ...buildFallbackJitsiLaunch(sessionId),
          role: isHost ? "HOST" : "ATTENDEE",
        });
      } else {
        setError(result.message);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [sessionId, isHost]);

  const handleIframeRef = useCallback((ref: HTMLDivElement) => {
    ref.style.height = "100%";
    ref.style.width = "100%";
    ref.style.border = "none";
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

  return (
    <div className="h-187.5 w-full overflow-hidden rounded-xl bg-slate-950 shadow-xl">
      <JitsiMeeting
        domain={launch.domain}
        roomName={launch.roomName}
        configOverwrite={{
          ...launch.config,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
        }}
        userInfo={{
          displayName:
            launch.displayName ||
            [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
            user?.email?.split("@")[0] ||
            "SkilLoop Participant",
          email: user?.email || "",
        }}
        onReadyToClose={() => onSessionComplete?.()}
        getIFrameRef={handleIframeRef}
      />
    </div>
  );
}

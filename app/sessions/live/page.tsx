"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Video, Loader2, AlertCircle } from "lucide-react";
import { useRequestStore } from "../../../lib/requestStore";
import { useAuthStore } from "../../../lib/authStore";

function ZoomMeeting() {
  const searchParams = useSearchParams();
  const { fetchZoomSignature, fetchZoomZak } = useRequestStore();
  const { user } = useAuthStore();

  const meetingNumber = searchParams.get("meetingId") || "";
  const zoomPassword = searchParams.get("password") || "";
  const zak = searchParams.get("zak") || "";
  const role = Number(searchParams.get("role") || "0");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const noMeeting = !meetingNumber;

  useEffect(() => {
    if (noMeeting) return;

    let cancelled = false;

    async function joinMeeting() {
      try {
        const ZoomMtg = (await import("@zoom/meetingsdk")).ZoomMtg;

        ZoomMtg.setZoomJSLib("https://source.zoom.us/6.2.0/lib", "/av");
        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareWebSDK();

        const result = await fetchZoomSignature(meetingNumber, role);
        if (!result.success || !result.data) {
          throw new Error(result.message || "Failed to get meeting signature");
        }

        let hostZak = zak;
        if (role === 1) {
          const zakResult = await fetchZoomZak();
          if (zakResult.success && zakResult.data?.zak) {
            hostZak = zakResult.data.zak;
          }
        }

        if (cancelled) return;

        const { sdkKey, signature } = result.data;
        const userName =
          user?.email?.split("@")[0] || "SkilLoop Participant";

        ZoomMtg.init({
          leaveUrl: window.location.origin + "/sessions",
          patchJsMedia: true,
          success: () => {
            if (cancelled) return;
            ZoomMtg.join({
              sdkKey,
              signature,
              meetingNumber,
              passWord: zoomPassword,
              userName,
              ...(hostZak ? { zak: hostZak } : {}),
              success: () => {
                if (!cancelled) setLoading(false);
              },
              error: (err: unknown) => {
                console.error("Zoom Join Error:", err);
                if (!cancelled) {
                  setError(
                    typeof err === "object" && err && "message" in err && (err as { message?: string }).message
                      ? (err as { message: string }).message
                      : "Failed to join the meeting. Please try again.",
                  );
                  setLoading(false);
                }
              },
            });
          },
          error: (err: unknown) => {
            console.error("Zoom Init Error:", err);
            if (!cancelled) {
              setError("Failed to initialize Zoom. Please refresh and try again.");
              setLoading(false);
            }
          },
        });
      } catch (err: unknown) {
        console.error("Zoom Setup Error:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to start Zoom meeting.");
          setLoading(false);
        }
      }
    }

    joinMeeting();

    return () => {
      cancelled = true;
    };
  }, [meetingNumber, zoomPassword, zak, role, fetchZoomSignature, fetchZoomZak, user, noMeeting]);

  return (
    <div className="w-full">
      {noMeeting && (
        <div className="flex flex-col items-center justify-center h-[500px] bg-slate-50 rounded-[10px] border border-slate-200 px-4">
          <AlertCircle className="w-10 h-10 text-slate-400 mb-3" />
          <p className="text-[15px] text-slate-500 text-center mb-4">
            No meeting ID provided. Please return to the session page.
          </p>
        </div>
      )}

      {!noMeeting && loading && (
        <div className="flex flex-col items-center justify-center h-[500px] bg-slate-50 rounded-[10px] border border-slate-200">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-3" />
          <p className="text-[15px] text-slate-500">Joining meeting...</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center h-[500px] bg-red-50 rounded-[10px] border border-red-200 px-4">
          <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
          <p className="text-[15px] text-red-600 text-center mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-[8px] bg-red-500 px-6 py-2.5 text-[15px] font-medium text-white hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        id="zmmtg-root"
        className={`w-full h-[650px] rounded-[10px] border border-slate-200 ${noMeeting || loading || error ? "hidden" : ""}`}
      />
    </div>
  );
}

export default function OngoingSessionPage() {
  return (
    <div className="min-h-screen bg-white font-sans pb-8">
      <div className="w-full max-w-4xl mx-auto px-4 pt-24">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[32px] font-medium text-black leading-tight">
            Ongoing Session
          </h1>
          <div className="w-9 h-9 rounded-[6px] bg-green-50 flex items-center justify-center">
            <Video className="w-6 h-6 text-green-500" />
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center h-[500px] bg-slate-50 rounded-[10px] border border-slate-200">
              <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-3" />
              <p className="text-[15px] text-slate-500">Loading meeting...</p>
            </div>
          }
        >
          <ZoomMeeting />
        </Suspense>
      </div>
    </div>
  );
}

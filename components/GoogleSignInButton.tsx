"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGoogleOAuth } from "@react-oauth/google";
import { Loader2 } from "lucide-react";

const GIS_SRC = "https://accounts.google.com/gsi/client";
const READY_TIMEOUT_MS = 10000;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;
const DEFAULT_WIDTH = 320;

interface IdConfiguration {
  client_id: string;
  callback: (res: { credential?: string }) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface RenderButtonConfiguration {
  theme?: "outline" | "filled" | "filled_blue";
  size?: "small" | "medium" | "large";
  shape?: "rectangular" | "pill" | "circle" | "square";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  width?: number;
  logo_alignment?: "left" | "center";
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id: {
          initialize: (cfg: IdConfiguration) => void;
          renderButton: (parent: HTMLElement, cfg: RenderButtonConfiguration) => void;
        };
      };
    };
  }
}

function ensureGisScript(): void {
  if (document.querySelector(`script[src="${GIS_SRC}"]`)) return;
  const script = document.createElement("script");
  script.src = GIS_SRC;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

function waitForGis(timeoutMs = READY_TIMEOUT_MS): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      if (window.google?.accounts?.id) {
        window.clearInterval(interval);
        resolve();
      } else if (Date.now() - startedAt > timeoutMs) {
        window.clearInterval(interval);
        reject(new Error("Google sign-in took too long to load. Check your connection and try again."));
      }
    }, 100);
  });
}

interface GoogleSignInButtonProps {
  onCredential: (idToken: string) => void | Promise<void>;
  onError: (formattedMessage: string) => void;
  disabled?: boolean;
}

export default function GoogleSignInButton({ onCredential, onError, disabled }: GoogleSignInButtonProps) {
  const { clientId } = useGoogleOAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  // Status starts as "loading" (or "error" if unconfigured). When `attempt`
  // or `clientId` changes, the cleanup below resets it back to "loading" so
  // the new effect body never needs a synchronous setState call.
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    () => (clientId ? "loading" : "error")
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(
    () => (clientId ? null : "Google sign-in is not configured.")
  );
  const [attempt, setAttempt] = useState(0);

  // Keep callbacks in refs so the render effect does not re-run when the
  // parent passes fresh inline closures on every render.
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  }, [onCredential, onError]);

  const initializedClientId = useRef<string | null>(null);

  const renderGoogleButton = useCallback(() => {
    const parent = containerRef.current;
    const id = window.google?.accounts?.id;
    if (!parent || !id || !clientId) return;

    parent.innerHTML = "";

    if (initializedClientId.current !== clientId) {
      id.initialize({
        client_id: clientId,
        callback: (res) => {
          const idToken = res.credential;
          if (!idToken) {
            onErrorRef.current("Google sign-in did not return an ID token. Please try again.");
            return;
          }
          void onCredentialRef.current(idToken);
        },
        auto_select: false,
        cancel_on_tap_outside: false,
      });
      initializedClientId.current = clientId;
    }

    const measured = parent.clientWidth;
    const width = Math.min(Math.max(measured || DEFAULT_WIDTH, MIN_WIDTH), MAX_WIDTH);
    id.renderButton(parent, {
      theme: "outline",
      size: "large",
      shape: "rectangular",
      text: "continue_with",
      width,
    });
  }, [clientId]);

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    ensureGisScript();

    waitForGis()
      .then(() => {
        if (cancelled) return;
        renderGoogleButton();
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Google sign-in failed to load.");
      });

    // Reset to loading state in cleanup so the *next* effect run starts
    // clean — avoids calling setState synchronously inside the effect body.
    return () => {
      cancelled = true;
      setStatus("loading");
      setErrorMsg(null);
    };
  }, [clientId, attempt, renderGoogleButton]);

  // Keep the button sized to its container on resize/orientation change.
  useEffect(() => {
    if (status !== "ready") return;
    let frame = 0;
    const onResize = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(renderGoogleButton);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [status, renderGoogleButton]);

  return (
    <div className="w-full">
      {status === "error" ? (
        <div className="flex flex-col items-center gap-2.5">
          <p className="text-center text-xs text-red-600">{errorMsg}</p>
          <button
            type="button"
            onClick={() => setAttempt((n) => n + 1)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-1.5 rounded-[6px] text-xs transition-colors"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {status === "loading" && (
            <div className="flex items-center justify-center gap-2.5 bg-white border border-slate-200 py-3.5 rounded-xl">
              <Loader2 size={16} className="animate-spin text-slate-400" />
              <span className="text-sm text-slate-400">Google</span>
            </div>
          )}
          <div className={`relative ${status === "ready" ? "flex justify-center" : "hidden"}`}>
            <div ref={containerRef} />
            {disabled && <div className="absolute inset-0" />}
          </div>
        </>
      )}
    </div>
  );
}

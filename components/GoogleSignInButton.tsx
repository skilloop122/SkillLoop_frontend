"use client";

import React, { useState, useCallback } from "react";
import { useGoogleOAuth } from "@react-oauth/google";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id: {
          initialize: (cfg: {
            client_id: string;
            callback: (res: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (
            notification?: (n: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
            }) => void,
          ) => void;
        };
      };
    };
  }
}

const GoogleLogo = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path
      fill="#EA4335"
      d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.74 14.93 1 12 1 7.37 1 3.4 3.63 1.45 7.45l3.77 2.92C6.12 6.84 8.84 5.04 12 5.04z"
    />
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.48c-.28 1.48-1.12 2.74-2.38 3.59l3.69 2.86c2.16-1.99 3.7-4.92 3.7-8.54z"
    />
    <path
      fill="#FBBC05"
      d="M5.22 14.62c-.24-.72-.37-1.49-.37-2.28s.13-1.56.37-2.28L1.45 7.14C.52 9.07 0 11.23 0 13.5s.52 4.43 1.45 6.36l3.77-2.92c-.24-.44-.24-1.9-.24-2.32z"
    />
    <path
      fill="#34A853"
      d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.86c-1.03.69-2.34 1.1-4.27 1.1-3.16 0-5.88-1.8-6.84-5.33L1.39 15.9C3.33 19.74 7.3 23 12 23z"
    />
  </svg>
);

interface GoogleSignInButtonProps {
  onCredential: (idToken: string) => void | Promise<void>;
  onError: (formattedMessage: string) => void;
  disabled?: boolean;
}

export default function GoogleSignInButton({
  onCredential,
  onError,
  disabled,
}: GoogleSignInButtonProps) {
  const [busy, setBusy] = useState(false);
  const { clientId } = useGoogleOAuth();

  const handleClick = useCallback(() => {
    const google = window.google?.accounts?.id;
    if (!google) {
      onError("Google is not available. Please refresh and try again.");
      return;
    }
    if (!clientId) {
      onError("Google client ID is not configured.");
      return;
    }

    google.initialize({
      client_id: clientId,
      callback: (res) => {
        const idToken = res.credential;
        if (!idToken) {
          onError("Google sign-in returned no credential. Please try again.");
          setBusy(false);
          return;
        }
        // console.log(
        //   "GOOGLE AUTH SUCCESS ->",
        //   JSON.stringify({ idToken: `${idToken.slice(0, 16)}...` }),
        // );
        void onCredential(idToken);
      },
      auto_select: false,
      cancel_on_tap_outside: false,
    });

    setBusy(true);
    google.prompt((notification) => {
      setBusy(false);
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        onError("Google sign-in was dismissed. Please try again.");
      }
    });
  }, [clientId, onCredential, onError]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || busy}
      className="flex items-center justify-center gap-2.5 bg-white border border-slate-200 py-3.5 rounded-xl shadow-[0_4px_12px_rgb(0,0,0,0.03)] hover:bg-slate-50 transition-colors active:scale-95 text-slate-700 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleLogo />}
      Google
    </button>
  );
}
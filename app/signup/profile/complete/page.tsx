"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CompleteRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/signup/profile/details");
  }, [router]);

  return null;
}


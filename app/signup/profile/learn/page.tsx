"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LearnRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/signup/profile");
  }, [router]);

  return null;
}

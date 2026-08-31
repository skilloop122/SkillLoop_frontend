"use client";

import React from "react";
import Image from "next/image";

interface UserAvatarProps {
  avatarUrl?: string | null;
  firstName?: string;
  lastName?: string;
  className?: string;
}

function getInitials(firstName?: string, lastName?: string) {
  const first = firstName?.[0]?.toUpperCase() ?? "";
  const last = lastName?.[0]?.toUpperCase() ?? "";
  return first || last ? first + last : "?";
}

export function UserAvatar({ avatarUrl, firstName, lastName, className = "" }: UserAvatarProps) {
  if (avatarUrl) {
    return (
      <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
        <Image src={avatarUrl} alt={`${firstName || ""} ${lastName || ""}`.trim() || "Profile"} fill className="object-cover" />
      </div>
    );
  }
  return (
    <div className={`flex items-center justify-center bg-sky-100 text-sky-600 font-bold ${className}`}>
      <span>{getInitials(firstName, lastName)}</span>
    </div>
  );
}

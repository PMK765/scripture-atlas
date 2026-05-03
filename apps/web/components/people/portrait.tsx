"use client";

import { useState } from "react";
import {
  DEFAULT_FEMALE_PORTRAIT,
  DEFAULT_MALE_PORTRAIT,
  DEFAULT_UNKNOWN_PORTRAIT,
  getPortraitSrc,
} from "@/lib/portrait";
import { cn } from "@/lib/utils";

interface PortraitProps {
  code: string | null | undefined;
  gender: string | null | undefined;
  name: string;
  size?: number;
  className?: string;
  rounded?: "full" | "lg" | "md";
  ringColor?: string;
}

function defaultFor(gender: string | null | undefined): string {
  if (gender === "female") return DEFAULT_FEMALE_PORTRAIT;
  if (gender === "male") return DEFAULT_MALE_PORTRAIT;
  return DEFAULT_UNKNOWN_PORTRAIT;
}

export function Portrait({
  code,
  gender,
  name,
  size = 40,
  className,
  rounded = "full",
  ringColor,
}: PortraitProps) {
  const initialSrc = getPortraitSrc(code, gender);
  const fallback = defaultFor(gender);
  const [src, setSrc] = useState(initialSrc);

  const radiusClass =
    rounded === "full" ? "rounded-full" : rounded === "lg" ? "rounded-lg" : "rounded-md";

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (src !== fallback) setSrc(fallback);
      }}
      className={cn(
        "shrink-0 object-cover",
        radiusClass,
        ringColor ? "ring-2" : null,
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: "rgb(30 41 59 / 0.5)",
        ...(ringColor ? { boxShadow: `0 0 0 2px ${ringColor}` } : {}),
      }}
      draggable={false}
    />
  );
}

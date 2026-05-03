"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
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
  objectPosition?: string;
  interactive?: boolean;
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
  objectPosition = "center top",
  interactive = false,
}: PortraitProps) {
  const initialSrc = getPortraitSrc(code, gender);
  const fallback = defaultFor(gender);
  const [src, setSrc] = useState(initialSrc);

  const radiusClass =
    rounded === "full" ? "rounded-full" : rounded === "lg" ? "rounded-lg" : "rounded-md";

  const img = (
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
        interactive && "cursor-zoom-in transition-transform hover:scale-[1.02]",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: "rgb(30 41 59 / 0.5)",
        objectPosition,
        ...(ringColor ? { boxShadow: `0 0 0 2px ${ringColor}` } : {}),
      }}
      draggable={false}
    />
  );

  if (!interactive) return img;

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={`Expand portrait of ${name}`}
          className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {img}
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/70 backdrop-blur-md",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "max-h-[92vh] max-w-[92vw] focus:outline-none",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          )}
        >
          <VisuallyHidden.Root>
            <DialogPrimitive.Title>{name}</DialogPrimitive.Title>
          </VisuallyHidden.Root>
          <img
            src={src}
            alt={name}
            className="max-h-[92vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
            draggable={false}
          />
          <p className="mt-3 text-center text-sm font-medium text-white/85">{name}</p>
          <DialogPrimitive.Close
            aria-label="Close"
            className="absolute -right-3 -top-3 rounded-full bg-black/70 p-2 text-white/90 transition-colors hover:bg-black hover:text-white"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

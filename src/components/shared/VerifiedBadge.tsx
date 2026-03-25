import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  isVerified: boolean;
  /** "full" shows icon + text; "icon" shows icon only; "pill" shows a pill badge */
  variant?: "full" | "icon" | "pill";
  className?: string;
}

export function VerifiedBadge({
  isVerified,
  variant = "full",
  className,
}: VerifiedBadgeProps) {
  if (!isVerified) return null;

  if (variant === "icon") {
    return (
      <ShieldCheck
        className={cn("h-4 w-4 text-emerald-600 shrink-0", className)}
        aria-label="Verified"
      />
    );
  }

  if (variant === "pill") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700",
          className
        )}
      >
        <ShieldCheck className="h-3 w-3" />
        Verified
      </span>
    );
  }

  // full (default)
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-emerald-700 text-sm font-semibold",
        className
      )}
    >
      <ShieldCheck className="h-4 w-4 text-emerald-600" />
      TrustRent Verified
    </div>
  );
}

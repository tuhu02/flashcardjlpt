import { clsx } from "@/lib/clsx";
import type { HTMLAttributes } from "react";

const colors = {
  default: "bg-stone-100 text-stone-700",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-sky-100 text-sky-800",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  color?: keyof typeof colors;
};

export function Badge({
  className,
  color = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colors[color],
        className,
      )}
      {...props}
    />
  );
}

export function statusColor(status: string): keyof typeof colors {
  switch (status) {
    case "Hafal":
      return "success";
    case "Perlu Diulang":
      return "danger";
    case "Sedang Dipelajari":
      return "info";
    default:
      return "default";
  }
}

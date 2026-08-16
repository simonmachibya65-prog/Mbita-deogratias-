import { HTMLAttributes } from "react";

type BadgeVariant =
  | "default"
  | "active"
  | "completed"
  | "archived"
  | "upcoming"
  | "past"
  | "draft"
  | "published";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  active: "bg-accent-green/10 text-accent-green",
  completed: "bg-accent-blue/10 text-accent-blue",
  archived: "bg-gray-200 text-gray-600",
  upcoming: "bg-accent-blue/10 text-accent-blue",
  past: "bg-gray-200 text-gray-600",
  draft: "bg-accent-amber/10 text-accent-amber",
  published: "bg-accent-green/10 text-accent-green",
};

export default function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}

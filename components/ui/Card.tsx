import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated";
}

const variantClasses = {
  default: "bg-white dark:bg-navy-800 border border-border dark:border-navy-700",
  bordered: "bg-white dark:bg-navy-800 border-2 border-navy-200 dark:border-navy-700",
  elevated: "bg-white dark:bg-navy-800 shadow-md",
};

export default function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-lg p-6 transition-shadow",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

export function CardHeader({
  className = "",
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div className={["mb-4", className].join(" ")} {...props}>
      {children}
    </div>
  );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function CardTitle({
  as: Component = "h3",
  className = "",
  children,
  ...props
}: CardTitleProps) {
  return (
    <Component
      className={["text-xl font-semibold text-navy-900 dark:text-gray-100", className].join(" ")}
      {...props}
    >
      {children}
    </Component>
  );
}

type CardContentProps = HTMLAttributes<HTMLDivElement>;

export function CardContent({
  className = "",
  children,
  ...props
}: CardContentProps) {
  return (
    <div className={["text-navy-700 dark:text-gray-300", className].join(" ")} {...props}>
      {children}
    </div>
  );
}

type CardFooterProps = HTMLAttributes<HTMLDivElement>;

export function CardFooter({
  className = "",
  children,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={["mt-4 pt-4 border-t border-border dark:border-navy-700", className].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

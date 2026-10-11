import Link from "next/link";
import { cn } from "@/lib/utils";

export function Card({ className, children, id }: { className?: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className={cn("rounded-[14px] border border-border bg-surface p-5", className)}>
      {children}
    </section>
  );
}

const primaryClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-primary px-4 text-[15px] leading-[22px] font-semibold text-white hover:bg-primary-pressed disabled:cursor-not-allowed disabled:bg-[#C9D3EA]";
const secondaryClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-border bg-surface px-4 text-[15px] leading-[22px] font-semibold text-text-primary hover:bg-surface-muted";

export function PrimaryButton({
  className,
  children,
  href,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: string }) {
  const classes = cn(primaryClass, className);
  if (href) return <Link href={href} className={classes}>{children}</Link>;
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export function SecondaryButton({
  className,
  children,
  href,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: string }) {
  const classes = cn(secondaryClass, className);
  if (href) return <Link href={href} className={classes}>{children}</Link>;
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export function OutlineButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-border bg-surface px-3 text-[13px] font-medium text-text-secondary hover:text-text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
  back,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  back?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {back}
        <h1 className="text-[28px] leading-[34px] font-bold tracking-tight text-text-primary">{title}</h1>
        {subtitle ? <p className="mt-1 text-[13px] leading-[18px] text-text-secondary">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

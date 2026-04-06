// Reusable skeleton loading primitives — shimmer-pulse via .skeleton in globals.css

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return <div className={`skeleton rounded-md ${className}`} style={style} />;
}

/** KPI stat card skeleton — matches 3/4-column stat cards on dashboard & merchant */
export function KpiSkeleton() {
  return (
    <div className="p-5 rounded-xl bg-[#111] border border-white/[0.06] space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-28" />
    </div>
  );
}

/** Subscription row skeleton — matches horizontal cards on dashboard */
export function SubRowSkeleton() {
  return (
    <div className="flex items-center gap-5 p-5 rounded-xl bg-[#111] border border-white/[0.06]">
      <Skeleton className="w-11 h-11 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-36" />
        <Skeleton className="h-3 w-52" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-7 w-16 rounded-md" />
    </div>
  );
}

/** Pricing card skeleton — matches 3-column plan cards on pricing page */
export function PricingCardSkeleton() {
  return (
    <div className="rounded-xl p-8 space-y-7 bg-[#111] border border-white/[0.06]">
      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-10 w-20" />
      </div>
      <hr className="border-white/[0.06]" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-4" style={{ width: `${60 + i * 8}%` }} />
        ))}
      </div>
      <Skeleton className="h-11 w-full rounded-lg" />
    </div>
  );
}

/** Plans table row skeleton — matches merchant plans table rows */
export function TableRowSkeleton() {
  return (
    <tr className="border-b border-white/[0.04]">
      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-10" /></td>
      <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
    </tr>
  );
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="dpo-card">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="dpo-skeleton dpo-skeleton-row" />
      ))}
    </div>
  );
}

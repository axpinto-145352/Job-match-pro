"use client";

export function JobCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="skeleton h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <div className="skeleton h-5 w-48" />
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-4 w-24" />
          </div>
        </div>
        <div className="skeleton h-10 w-16 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-3/4" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="skeleton h-8 w-20 rounded-lg" />
        <div className="skeleton h-8 w-20 rounded-lg" />
        <div className="skeleton h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="skeleton h-6 w-40" />
        <div className="skeleton h-8 w-8 rounded-full" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-6 w-20 rounded-full" />
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <div className="skeleton h-5 w-24 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="skeleton h-4 w-20 mb-2" />
            <div className="skeleton h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="skeleton h-12 w-full rounded-xl" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="skeleton h-4 w-24 mb-3" />
      <div className="skeleton h-8 w-20 mb-2" />
      <div className="skeleton h-3 w-32" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <div className="border-b border-gray-100 bg-gray-50 p-4">
        <div className="flex gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-4 w-20" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-gray-50 p-4">
          <div className="flex gap-8">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="skeleton h-4 w-24" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

import React from "react";

export default function LoadingSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      {/* Header shimmer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-slate-800 rounded-lg" />
          <div className="h-5 bg-slate-800 rounded w-32" />
        </div>
        <div className="h-4 bg-slate-800 rounded w-24" />
      </div>

      {/* DemoControlBar shimmer */}
      <div className="h-16 bg-slate-900 border border-slate-800 rounded-xl" />

      {/* Product Switcher shimmer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="h-24 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="h-3 bg-slate-800 rounded w-20" />
          <div className="h-4 bg-slate-800 rounded w-48" />
          <div className="h-3 bg-slate-800/60 rounded w-64" />
        </div>
        <div className="h-24 bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="h-3 bg-slate-800 rounded w-20" />
          <div className="h-4 bg-slate-800 rounded w-48" />
          <div className="h-3 bg-slate-800/60 rounded w-64" />
        </div>
      </div>

      {/* Main 3-column layout shimmer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column */}
        <div className="lg:col-span-4 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="border border-slate-800 bg-slate-900/30 rounded-xl p-5 space-y-3">
              <div className="h-3 bg-slate-800 rounded w-24" />
              <div className="h-10 bg-slate-800/50 rounded-lg" />
              <div className="h-3 bg-slate-800/40 rounded w-32" />
            </div>
          ))}
        </div>

        {/* Center column */}
        <div className="lg:col-span-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-slate-800 bg-slate-900/20 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-slate-800 rounded w-1/2" />
                <div className="h-4 bg-slate-800 rounded-full w-12" />
              </div>
              <div className="h-3 bg-slate-800/50 rounded w-1/3" />
              <div className="flex gap-4 mt-2">
                <div className="h-3 bg-slate-800/40 rounded w-16" />
                <div className="h-3 bg-slate-800/40 rounded w-16" />
                <div className="h-3 bg-slate-800/40 rounded w-16" />
              </div>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div className="lg:col-span-3 space-y-4">
          <div className="border border-slate-800 bg-slate-900/30 rounded-xl p-5 space-y-3">
            <div className="h-3 bg-slate-800 rounded w-16" />
            <div className="h-20 bg-slate-800/30 rounded-lg" />
          </div>
          <div className="border border-slate-800 bg-slate-900/30 rounded-xl p-5 space-y-3">
            <div className="h-3 bg-slate-800 rounded w-20" />
            <div className="space-y-2">
              <div className="h-3 bg-slate-800/40 rounded w-full" />
              <div className="h-3 bg-slate-800/40 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

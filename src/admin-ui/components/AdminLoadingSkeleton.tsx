import React from 'react';

const pulse = 'animate-pulse bg-[#f5e9ec]';

export function AdminContentSkeleton() {
  return <div role="status" aria-label="Loading admin page" className="space-y-6">
    <span className="sr-only">Loading admin page…</span>
    <div className="space-y-2"><div className={`h-7 w-52 rounded-lg ${pulse}`}/><div className={`h-3 w-72 max-w-full rounded ${pulse}`}/></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({length:4},(_,i)=><div key={i} className="rounded-2xl border border-[#ecdfe4] bg-white p-5 space-y-4"><div className={`h-3 w-24 rounded ${pulse}`}/><div className={`h-7 w-28 rounded-lg ${pulse}`}/><div className={`h-2 w-32 rounded ${pulse}`}/></div>)}</div>
    <div className="rounded-2xl border border-[#ecdfe4] bg-white p-5 space-y-5"><div className="flex justify-between gap-4"><div className={`h-5 w-40 rounded ${pulse}`}/><div className={`h-8 w-24 rounded-xl ${pulse}`}/></div>{Array.from({length:5},(_,i)=><div key={i} className="flex items-center gap-4 border-t border-[#f8eef1] pt-4"><div className={`h-9 w-9 shrink-0 rounded-lg ${pulse}`}/><div className={`h-3 flex-1 rounded ${pulse}`}/><div className={`h-3 w-20 rounded ${pulse}`}/><div className={`hidden h-3 w-24 rounded sm:block ${pulse}`}/></div>)}</div>
  </div>;
}

export function AdminEntrySkeleton() {
  return <div role="status" aria-label="Loading admin panel" className="grid min-h-svh bg-[#fffafb] lg:grid-cols-[minmax(280px,38%)_1fr]">
    <span className="sr-only">Loading admin panel…</span>
    <div className="hidden bg-[#673742] p-12 lg:flex lg:flex-col lg:justify-between"><div className="h-10 w-32 animate-pulse rounded-lg bg-white/20"/><div className="space-y-4"><div className="h-8 w-3/4 animate-pulse rounded-lg bg-white/20"/><div className="h-4 w-1/2 animate-pulse rounded bg-white/20"/></div><div className="h-3 w-40 animate-pulse rounded bg-white/20"/></div>
    <div className="flex items-center justify-center p-6"><div className="w-full max-w-md rounded-3xl border border-[#ecdfe4] bg-white p-8 shadow-sm space-y-7"><div className={`mx-auto h-10 w-24 rounded-lg ${pulse}`}/><div className="space-y-3"><div className={`h-7 w-44 rounded-lg ${pulse}`}/><div className={`h-3 w-56 rounded ${pulse}`}/></div>{Array.from({length:2},(_,i)=><div key={i} className="space-y-2"><div className={`h-3 w-20 rounded ${pulse}`}/><div className={`h-12 w-full rounded-xl ${pulse}`}/></div>)}<div className="h-12 w-full animate-pulse rounded-xl bg-[#673742]/35"/></div></div>
  </div>;
}

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
  return <div role="status" aria-label="Loading admin panel" className="flex min-h-svh bg-[#fffafb] text-[#382b31]">
    <span className="sr-only">Loading admin panel…</span>
    <aside className="hidden w-60 shrink-0 border-r border-[#ecdfe4] bg-[#FFF4F6] p-4 md:flex md:flex-col">
      <div className="flex h-12 items-center gap-3 border-b border-[#ecdfe4] pb-3"><div className={`h-8 w-12 rounded ${pulse}`}/><div className="space-y-1.5"><div className={`h-3 w-16 rounded ${pulse}`}/><div className={`h-2 w-20 rounded ${pulse}`}/></div></div>
      <div className="mt-6 space-y-3">{Array.from({length:9},(_,i)=><div key={i} className={`h-9 rounded-xl ${i===0?'bg-[#673742]/10':pulse}`} />)}</div>
      <div className="mt-auto space-y-3 border-t border-[#ecdfe4] pt-4"><div className={`h-8 rounded-lg ${pulse}`}/><div className={`h-8 rounded-lg ${pulse}`}/></div>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="flex h-16 items-center justify-between border-b border-[#ecdfe4] bg-white px-5"><div className={`h-6 w-36 rounded ${pulse}`}/><div className="flex items-center gap-3"><div className={`h-9 w-9 rounded-xl ${pulse}`}/><div className={`h-9 w-9 rounded-full ${pulse}`}/></div></header>
      <main className="space-y-6 p-5 sm:p-8">
        <div className="space-y-2"><div className={`h-7 w-52 rounded-lg ${pulse}`}/><div className={`h-3 w-72 max-w-full rounded ${pulse}`}/></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({length:4},(_,i)=><div key={i} className="space-y-4 rounded-2xl border border-[#ecdfe4] bg-white p-5"><div className={`h-3 w-24 rounded ${pulse}`}/><div className={`h-7 w-28 rounded-lg ${pulse}`}/></div>)}</div>
        <div className="rounded-2xl border border-[#ecdfe4] bg-white p-5"><div className="flex items-center justify-between"><div className={`h-5 w-40 rounded ${pulse}`}/><div className={`h-9 w-24 rounded-xl ${pulse}`}/></div>{Array.from({length:5},(_,i)=><div key={i} className="flex items-center gap-4 border-t border-[#f8eef1] py-4"><div className={`h-9 w-9 shrink-0 rounded-lg ${pulse}`}/><div className={`h-3 flex-1 rounded ${pulse}`}/><div className={`h-3 w-20 rounded ${pulse}`}/><div className={`hidden h-3 w-24 rounded sm:block ${pulse}`}/></div>)}</div>
      </main>
    </div>
  </div>;
}

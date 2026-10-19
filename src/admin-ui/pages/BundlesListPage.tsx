"use client";
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Sparkles } from 'lucide-react';
import { useAdminUI } from '../context/AdminUIContext';
import { formatPrice } from '../utils/formatters';
import { getSafeImageSrc } from '../utils/images';
export const BundlesListPage: React.FC = () => {
    const { bundles, deleteBundle, setActivePage, confirm, moduleLoading, errors, reload } = useAdminUI();
    const [search, setSearch] = useState('');
    const isLoading = Boolean(moduleLoading?.['bundles'] && bundles.length === 0);
    const bundleError = errors?.['bundles'];
    const filtered = bundles.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) ||
        (b.description || '').toLowerCase().includes(search.toLowerCase()));
    const handleDelete = async (id: string, name: string) => {
        try {
            const isConfirmed = await confirm({
                title: 'Delete Bundle?',
                description: `"${name}" will be removed from curated packages.`,
                cancelLabel: 'Cancel',
                confirmLabel: 'Delete Bundle',
                destructive: true
            });
            if (isConfirmed) {
                await deleteBundle(id);
            }
        }
        catch {
        }
    };
    return (<div className="space-y-6 font-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-[#382b31]">Curated Product Bundles</h1>
          <p className="text-xs text-[#382b31]/75 font-medium">Curate discounted sets, custom skincare routines, and special boxed pairings.</p>
        </div>
        <button type="button" onClick={() => setActivePage('bundle-new')} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#673742] to-[#673742] hover:from-[#673742] hover:to-[#673742] text-white px-5 py-2.5 text-xs font-bold shadow-sm">
          <Plus className="w-4 h-4"/> Add Bundle
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-[#ecdfe4]/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input type="text" placeholder="Search bundles..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-xs text-[#382b31] placeholder:text-[#382b31]/50 rounded-xl border border-[#ecdfe4] outline-none"/>
          <Search className="w-4 h-4 text-[#382b31]/50 absolute left-3 top-2.5"/>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(bundle => {
            const discountPct = bundle.discountPercent || (bundle.originalTotalPrice && bundle.currentPrice && bundle.originalTotalPrice > bundle.currentPrice
                ? Math.round(((bundle.originalTotalPrice - bundle.currentPrice) / bundle.originalTotalPrice) * 100)
                : 0);
            const bundleCover = bundle.image || bundle.customImage || (bundle.slug === 'the-essentials' || bundle.name.toLowerCase().includes('duo') ? '/images/brightening-cream-main.webp' : '') || (bundle.products && bundle.products[0]?.product?.images?.[0]);
            return (<div key={bundle.id} className="bg-white rounded-3xl border border-[#ecdfe4] shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group">
              <div>
                <div className="relative aspect-video bg-[#FFF4F6] overflow-hidden">
                  <img src={getSafeImageSrc(bundleCover)} alt={bundle.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {discountPct > 0 && (<span className="px-2.5 py-1 bg-[#673742] text-white text-[10px] font-black uppercase rounded-lg shadow-sm">
                        Save {discountPct}%
                      </span>)}
                    {bundle.isBestseller && (<span className="px-2.5 py-1 bg-white text-[#673742] border border-[#673742]/20 text-[10px] font-black uppercase rounded-lg shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#673742]"/> Popular
                      </span>)}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${bundle.isActive ? 'bg-[#FFF4F6] text-[#673742] border-[#673742]/20' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      {bundle.isActive ? 'Active' : 'Draft'}
                    </span>
                    <span className="text-[11px] font-bold text-[#382b31]/75">
                      {bundle.products?.length || 0} Products
                    </span>
                  </div>

                  <h3 className="font-heading font-black text-base text-[#382b31] leading-snug">
                    {bundle.name}
                  </h3>
                  <p className="text-xs text-[#382b31]/80 line-clamp-2 leading-relaxed">
                    {bundle.shortDescription || bundle.description}
                  </p>

                  <div className="pt-2 flex items-baseline gap-2">
                    <span className="font-heading font-black text-lg text-[#382b31]">
                      {formatPrice(bundle.currentPrice || 0)}
                    </span>
                    {bundle.originalTotalPrice && bundle.originalTotalPrice > (bundle.currentPrice || 0) && (<span className="text-xs text-[#382b31]/60 font-medium line-through">
                        {formatPrice(bundle.originalTotalPrice)}
                      </span>)}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#FFF4F6]/50 border-t border-[#ecdfe4] flex items-center justify-end gap-2">
                <button type="button" onClick={() => setActivePage('bundle-edit', { id: bundle.id })} className="px-3 py-1.5 bg-white border border-[#ecdfe4] text-[#673742] rounded-xl text-xs font-bold hover:bg-[#FFF4F6] flex items-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5"/> Edit
                </button>
                <button type="button" onClick={() => handleDelete(bundle.id, bundle.name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete Bundle">
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            </div>);
        })}

        {isLoading && (
          <div className="col-span-full rounded-2xl border border-[#ecdfe4] bg-white px-6 py-12 text-center">
            <div className="mx-auto size-6 animate-spin rounded-full border-2 border-[#673742] border-t-transparent" />
            <p className="mt-3 text-xs font-bold text-[#382b31]/70">Loading saved bundles...</p>
          </div>
        )}

        {!isLoading && bundleError && (
          <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
            <p className="text-sm font-bold text-red-800">Unable to load bundles</p>
            <p className="mt-1 text-xs text-red-600">{bundleError}</p>
            <button
              type="button"
              onClick={() => reload()}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !bundleError && filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-[#ecdfe4] bg-white px-6 py-12 text-center">
            <p className="text-sm font-semibold text-[#382b31]">{search ? 'No bundles match this search.' : 'No bundles are saved to the connected store yet.'}</p>
            <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-[#382b31]/55">Storefront preview bundles are local examples. Save a bundle here to publish it and enable live checkout.</p>
            {!search && <button type="button" onClick={() => setActivePage('bundle-new')} className="mt-5 rounded-xl bg-[#673742] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#542c35]">Create your first bundle</button>}
          </div>
        )}
      </div>
    </div>);
};

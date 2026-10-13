"use client";
import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Edit2, Image as ImageIcon, Plus, Search, Trash2, X } from 'lucide-react';
import { useAdminUI } from '../context/AdminUIContext';
import { Category } from '../types';
import { CategoryFormModal } from '../components/categories/CategoryFormModal';
import { getSafeImageSrc } from '../utils/images';
type Filter = 'all' | 'active' | 'hidden' | 'featured';
type DeleteState = {
    category: Category;
    productCount: number;
};
export const CategoriesPage: React.FC = () => {
    const { categories, addCategory, updateCategory, deleteCategory, showToast } = useAdminUI();
    const [editing, setEditing] = useState<Category | null | undefined>(undefined);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<Filter>('all');
    const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
    const visibleCategories = useMemo(() => categories
        .filter(category => `${category.name} ${category.slug} ${category.shortDescription || ''}`.toLowerCase().includes(search.trim().toLowerCase()))
        .filter(category => filter === 'all' || (filter === 'active' ? category.isActive !== false : filter === 'hidden' ? category.isActive === false : category.isFeatured === true))
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)), [categories, filter, search]);
    const requestDelete = (category: Category) => {
        setDeleteState({ category, productCount: category.itemCount || 0 });
    };
    const confirmDelete = async () => {
        try {
            if (!deleteState)
                return;
            await deleteCategory(deleteState.category.id);
            setDeleteState(null);
        }
        catch {
        }
    };
    const move = async (category: Category, direction: -1 | 1) => {
        try {
            const ordered = [...categories].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
            const index = ordered.findIndex(item => item.id === category.id);
            const target = index + direction;
            if (target < 0 || target >= ordered.length)
                return;
            const other = ordered[target];
            await updateCategory(category.id, { displayOrder: other.displayOrder ?? target });
            await updateCategory(other.id, { displayOrder: category.displayOrder ?? index });
            showToast('Category order updated', 'info');
        }
        catch {
        }
    };
    const toggle = async (category: Category, field: 'isActive' | 'isFeatured' | 'showInNavigation') => {
        try {
            await updateCategory(category.id, { [field]: !category[field] });
        }
        catch {
        }
    };
    return (<div className="space-y-6 font-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-black text-[#382b31]">Categories</h1>
          <p className="text-xs font-medium text-[#382b31]/50">Database-driven collections used across products, filters, homepage and navigation.</p>
        </div>
        <button type="button" onClick={() => setEditing(null)} className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#673742] to-[#673742] hover:from-[#673742] hover:to-[#673742] text-white px-5 py-2.5 text-xs font-bold shadow-md">
          <Plus className="h-4 w-4"/> Add Category
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#ecdfe4] bg-white p-4 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#382b31]/40"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories…" className="w-full rounded-xl border border-[#ecdfe4] py-2.5 pl-9 pr-3 text-sm outline-none"/>
        </label>
        <div className="flex flex-wrap gap-1 rounded-xl bg-[#FFF4F6] p-1">
          {(['all', 'active', 'hidden', 'featured'] as Filter[]).map(value => (<button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-lg px-3 py-2 text-xs font-bold capitalize transition-colors ${filter === value ? 'bg-white text-[#382b31] shadow-sm' : 'text-[#382b31]/50 hover:text-[#382b31]'}`}>
              {value}
            </button>))}
        </div>
      </div>

      {visibleCategories.length ? (<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleCategories.map((category, index) => (<article key={category.id} className="rounded-3xl border border-[#ecdfe4] bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex gap-4">
                  {category.image ? (<img src={getSafeImageSrc(category.image)} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover border border-[#ecdfe4]"/>) : (<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4F6] text-slate-300">
                      <ImageIcon />
                    </div>)}
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-heading text-base font-black text-[#382b31]">{category.name}</h2>
                    <p className="truncate text-[11px] text-[#382b31]/40 font-mono">/{category.slug}</p>
                    <p className="mt-1 text-xs font-bold text-[#673742]">{category.itemCount || 0} products</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button type="button" disabled={index === 0} onClick={() => move(category, -1)} aria-label={`Move ${category.name} up`} className="rounded-lg border border-[#ecdfe4] p-1.5 disabled:opacity-30 hover:bg-[#FFF4F6]">
                      <ArrowUp className="h-3.5 w-3.5"/>
                    </button>
                    <button type="button" disabled={index === visibleCategories.length - 1} onClick={() => move(category, 1)} aria-label={`Move ${category.name} down`} className="rounded-lg border border-[#ecdfe4] p-1.5 disabled:opacity-30 hover:bg-[#FFF4F6]">
                      <ArrowDown className="h-3.5 w-3.5"/>
                    </button>
                  </div>
                </div>

                <p className="mt-4 min-h-10 text-xs leading-5 text-[#382b31]/70 line-clamp-2">
                  {category.shortDescription || category.description || 'No description added.'}
                </p>
              </div>

              <div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {([
                    ['isActive', category.isActive !== false, 'Active', 'Hidden'],
                    ['isFeatured', category.isFeatured === true, 'Featured', 'Not Featured']
                ] as const).map(([field, checked, yes, no]) => (<button key={field} type="button" onClick={() => toggle(category, field)} className={`rounded-full px-2.5 py-1 text-[10px] font-black transition-colors ${checked ? 'bg-[#FFF4F6] text-[#673742]' : 'bg-[#FFF4F6] text-[#382b31]/50'}`}>
                      {checked ? yes : no}
                    </button>))}
                </div>

                <div className="mt-4 flex justify-end gap-2 border-t border-[#ecdfe4] pt-3">
                  <button type="button" onClick={() => setEditing(category)} aria-label={`Edit ${category.name}`} className="rounded-xl p-2 text-[#673742] hover:bg-[#FFF4F6]">
                    <Edit2 className="h-4 w-4"/>
                  </button>
                  <button type="button" onClick={() => requestDelete(category)} aria-label={`Delete ${category.name}`} className="rounded-xl p-2 text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4 w-4"/>
                  </button>
                </div>
              </div>
            </article>))}
        </div>) : (<div className="rounded-3xl border border-dashed border-[#ecdfe4] bg-white p-10 text-center text-sm font-semibold text-[#382b31]/50">
          No categories match this view.
        </div>)}

      {editing !== undefined && (<CategoryFormModal category={editing} categories={categories} onClose={() => setEditing(undefined)} onSave={async (data) => {
                try {
                    if (editing)
                        await updateCategory(editing.id, data);
                    else
                        await addCategory(data);
                }
                catch {
                }
            }}/>)}

      {deleteState && (<div className="fixed inset-0 z-[108] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">
          <div role="dialog" aria-modal="true" className="my-auto w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-lg font-black text-[#382b31]">Delete this category?</h2>
                <p className="mt-2 text-sm leading-6 text-[#382b31]/70">
                  <strong>{deleteState.category.name}</strong> currently has {deleteState.productCount} associated product(s).
                </p>
              </div>
              <button type="button" onClick={() => setDeleteState(null)} className="p-1 text-[#382b31]/40">
                <X className="h-5 w-5"/>
              </button>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setDeleteState(null)} className="rounded-xl bg-[#FFF4F6] px-4 py-2.5 text-xs font-bold text-[#382b31]/80">
                Cancel
              </button>
              <button type="button" onClick={confirmDelete} className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-sm">
                Confirm Delete
              </button>
            </div>
          </div>
        </div>)}
    </div>);
};

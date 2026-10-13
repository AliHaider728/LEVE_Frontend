"use client";
import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAdminUI } from '../context/AdminUIContext';
import { Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { getSafeImageSrc } from '../utils/images';
const SortableTableRow: React.FC<{
    id: string;
    disabled: boolean;
    children: React.ReactNode;
}> = ({ id, disabled, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        ...(isDragging ? { zIndex: 50, position: 'relative' as any, backgroundColor: 'white', opacity: 0.9, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' } : {})
    };
    return (<tr ref={setNodeRef} style={style} className={`hover:bg-[#FFF4F6]/80 transition-colors ${isDragging ? 'shadow-lg' : ''}`}>
      <td className="p-4 pl-6 w-10">
        <div {...(disabled ? {} : { ...attributes, ...listeners })} className={`p-1.5 rounded-lg shrink-0 ${!disabled ? 'text-[#382b31]/40 hover:text-[#382b31]/70 hover:bg-[#FFF4F6] cursor-grab active:cursor-grabbing' : 'text-slate-200 cursor-not-allowed'}`}>
          <GripVertical className="w-4 h-4"/>
        </div>
      </td>
      {children}
    </tr>);
};
export const ProductsListPage: React.FC = () => {
    const { products, categories, updateProduct, deleteProduct, reorderProducts, setActivePage, showToast, confirm } = useAdminUI();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCatFilter, setSelectedCatFilter] = useState('all');
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
    const handleDragEnd = async (event: DragEndEvent) => {
        try {
            const { active, over } = event;
            if (!over || active.id === over.id)
                return;
            const oldIndex = products.findIndex((p) => p.id === active.id);
            const newIndex = products.findIndex((p) => p.id === over.id);
            const newProducts = arrayMove(products, oldIndex, newIndex);
            const updates = newProducts.map((p, idx) => ({ id: p.id, displayOrder: idx }));
            await reorderProducts(updates);
            showToast('Products reordered', 'success');
        }
        catch {
        }
    };
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase());
        const productCategorySlugs = p.categorySlugs?.length ? p.categorySlugs : p.categorySlug ? [p.categorySlug] : [];
        const matchesCat = selectedCatFilter === 'all' || productCategorySlugs.includes(selectedCatFilter);
        return matchesSearch && matchesCat;
    });
    const toggleVisibility = async (prod: Product) => {
        try {
            const nextState = !(prod.isVisible !== false);
            await updateProduct(prod.id, { isVisible: nextState });
        }
        catch {
        }
    };
    const handleDelete = async (id: string, prodName: string) => {
        try {
            const isConfirmed = await confirm({
                title: 'Delete this product?',
                description: `"${prodName}" will be removed from your catalog.`,
                cancelLabel: 'Cancel',
                confirmLabel: 'Delete Product',
                destructive: true
            });
            if (isConfirmed) {
                await deleteProduct(id);
            }
        }
        catch {
        }
    };
    return (<div className="space-y-6 font-heading">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-[#382b31]">Products Catalog</h1>
          <p className="text-xs text-[#382b31]/50 font-medium">Manage products, PKR pricing, inventory stock, visibility, and variations.</p>
        </div>
        <div className="flex flex-wrap gap-2">


          <button type="button" onClick={() => setActivePage('product-new')} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#673742] to-[#673742] hover:from-[#673742] hover:to-[#673742] text-white px-5 py-2.5 text-xs font-bold transition-colors shadow-sm">
            <Plus className="w-4 h-4"/>
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter controls */}
      <div className="bg-white p-4 rounded-3xl border border-[#ecdfe4]/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input type="text" placeholder="Search by product name or brand..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#ecdfe4] outline-none"/>
          <Search className="w-4 h-4 text-[#382b31]/40 absolute left-3 top-2.5"/>
        </div>

        <select value={selectedCatFilter} onChange={e => setSelectedCatFilter(e.target.value)} className="px-3 py-2 text-xs font-bold rounded-xl border border-[#ecdfe4] bg-white outline-none">
          <option value="all">All Categories</option>
          {categories.map(c => (<option key={c.id || c.slug} value={c.slug}>{c.name}</option>))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#ecdfe4]/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredProducts.map(p => p.id)} strategy={verticalListSortingStrategy}>
              <table className="w-full text-left text-xs text-[#382b31]/80">
                <thead className="bg-[#FFF4F6] text-[#382b31]/40 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4 pl-6 w-10"></th>
                    <th className="p-4">Product</th>
                    <th className="p-4">Categories</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Price (PKR)</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Store Visibility</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map(prod => {
            const canMove = !searchQuery && selectedCatFilter === 'all';
            return (<SortableTableRow key={prod.id || prod.slug} id={prod.id} disabled={!canMove}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={getSafeImageSrc(prod.images?.[0])} alt="" className="w-10 h-10 object-cover rounded-xl bg-[#FFF4F6] border border-[#ecdfe4]"/>
                            <div>
                              <span className="font-heading font-bold text-[#382b31] block truncate max-w-[120px] sm:max-w-[180px] md:max-w-[250px] lg:max-w-[300px]" title={prod.name}>
                                {prod.name}
                              </span>
                              <span className="text-[10px] text-[#382b31]/40">{prod.brand}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-[#673742]">
                          {prod.categoryNames?.[0] || prod.category || 'Uncategorized'}
                          {(prod.categoryNames?.length || 0) > 1 && (<span className="ml-1 text-[10px] text-[#382b31]/40">+{prod.categoryNames!.length - 1}</span>)}
                        </td>
                        <td className="p-4 font-mono font-medium">{prod.sku || '—'}</td>
                        <td className="p-4 font-bold text-[#382b31]">{formatPrice(prod.price)}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${prod.inStock ? 'bg-[#FFF4F6] text-[#673742]' : 'bg-rose-100 text-[#673742]'}`}>
                            {prod.trackInventory ? `${prod.stockQuantity ?? 0} in stock` : prod.inStock ? 'In stock (untracked)' : 'Out of stock'}
                          </span>
                        </td>
                        <td className="p-4">
                          <button type="button" onClick={() => toggleVisibility(prod)} className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${prod.isVisible !== false
                    ? 'bg-[#FFF4F6] text-[#673742] border border-[#ecdfe4]'
                    : 'bg-[#FFF4F6] text-[#382b31]/50 border border-[#ecdfe4]'}`}>
                            {prod.isVisible !== false ? <Eye className="w-3.5 h-3.5"/> : <EyeOff className="w-3.5 h-3.5"/>}
                            <span>{prod.isVisible !== false ? 'Visible' : 'Hidden'}</span>
                          </button>
                        </td>
                        <td className="p-4 pr-6 text-right space-x-2">
                          <button type="button" onClick={() => setActivePage('product-edit', { id: prod.id })} className="p-1.5 rounded-lg text-[#382b31]/70 hover:bg-[#FFF4F6]" title="Edit">
                            <Edit2 className="w-4 h-4 text-[#673742]"/>
                          </button>
                          <button type="button" onClick={() => handleDelete(prod.id, prod.name)} className="p-1.5 rounded-lg text-[#382b31]/70 hover:bg-[#FFF4F6]" title="Delete">
                            <Trash2 className="w-4 h-4 text-red-500"/>
                          </button>
                        </td>
                      </SortableTableRow>);
        })}
                  {filteredProducts.length === 0 && (<tr>
                      <td colSpan={8} className="p-12 text-center text-[#382b31]/40 text-sm">
                        No products match your search or filter.
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>);
};

"use client";
import { uploadImage as uploadAdminAsset } from '@/admin-ui/api';
import React, { useState } from 'react';
import { ImagePlus, Trash2, X } from 'lucide-react';
import { getSafeImageSrc } from '../../utils/images';
import { Category } from '../../types';
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
type Props = {
    category?: Category | null;
    categories: Category[];
    onClose: () => void;
    onSave: (data: Partial<Category>) => void;
    compact?: boolean;
};
export const CategoryFormModal: React.FC<Props> = ({ category, categories, onClose, onSave, compact }) => {
    const [name, setName] = useState(category?.name || '');
    const [slug, setSlug] = useState(category?.slug || '');
    const [slugEdited, setSlugEdited] = useState(Boolean(category));
    const [shortDescription, setShortDescription] = useState(category?.shortDescription || '');
    const [description, setDescription] = useState(category?.description || '');
    const [image, setImage] = useState(category?.image || '');
    const [isActive, setIsActive] = useState(category?.isActive !== false);
    const [isFeatured, setIsFeatured] = useState(category?.isFeatured === true);
    const [showInNavigation, setShowInNavigation] = useState(category?.showInNavigation !== false);
    const [navigationLabel, setNavigationLabel] = useState(category?.navigationLabel || '');
    const [displayOrder, setDisplayOrder] = useState(category?.displayOrder ?? categories.length);
    const [parentCategoryId, setParentCategoryId] = useState(category?.parentCategoryId || '');
    const [seoTitle, setSeoTitle] = useState(category?.seoTitle || '');
    const [metaDescription, setMetaDescription] = useState(category?.metaDescription || '');
    const [desktopVisible, setDesktopVisible] = useState(category?.desktopVisible !== false);
    const [mobileVisible, setMobileVisible] = useState(category?.mobileVisible !== false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const uploadImage = async (file?: File) => {
        try {
            if (!file)
                return;
            const url = await uploadAdminAsset(file);
            setImage(url);
        }
        catch {
        }
    };
    const removeSelectedImage = () => {
        setImage('');
    };
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const nextErrors: Record<string, string> = {};
        if (!name.trim())
            nextErrors.name = 'Category name is required.';
        const normalizedSlug = slugify(slug || name);
        if (!normalizedSlug)
            nextErrors.slug = 'Enter a valid category slug.';
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length)
            return;
        onSave({
            ...(category || {}),
            id: category?.id || `cat-${Date.now()}`,
            name: name.trim(),
            slug: normalizedSlug,
            shortDescription: shortDescription.trim(),
            description: description.trim(),
            image: image || '',
            itemCount: category?.itemCount || 0,
            isActive,
            isFeatured,
            showInNavigation,
            navigationLabel: navigationLabel.trim(),
            displayOrder: Math.max(0, Math.trunc(displayOrder || 0)),
            parentCategoryId: parentCategoryId || undefined,
            seoTitle: seoTitle.trim(),
            metaDescription: metaDescription.trim(),
            desktopVisible,
            mobileVisible
        });
        onClose();
    };
    const input = 'mt-1.5 w-full rounded-xl border border-[#ecdfe4] px-3 py-2.5 text-sm outline-none focus:border-[#673742] focus:ring-2 focus:ring-rose-100';
    return (<div className="fixed inset-0 z-[105] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 sm:p-5">
      <div role="dialog" aria-modal="true" className={`my-auto max-h-[calc(100vh-1.5rem)] w-full overflow-y-auto rounded-3xl bg-white shadow-2xl ${compact ? 'max-w-2xl' : 'max-w-4xl'}`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#ecdfe4] bg-white px-5 py-4">
          <div>
            <h2 className="font-heading text-lg font-black text-[#382b31]">{category ? 'Edit Category' : 'Add New Category'}</h2>
            <p className="text-xs text-[#382b31]/50">Saved to the live category database.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-[#382b31]/40 hover:bg-[#FFF4F6]">
            <X className="h-5 w-5"/>
          </button>
        </div>
        <p role="note" className="px-6 text-xs text-[#673742]">Backend endpoint not available for category teaser/SEO fields or per-category navigation/device switches. Manage navigation in Store Appearance.</p>
        <form onSubmit={submit} className="grid gap-5 p-5 md:grid-cols-2">
          <label className="text-xs font-bold text-[#382b31]/80">
            Category Name *
            <input value={name} maxLength={80} onChange={e => {
            setName(e.target.value);
            if (!slugEdited)
                setSlug(slugify(e.target.value));
        }} className={input}/>
            {errors.name && <span className="mt-1 block text-red-500">{errors.name}</span>}
          </label>
          <label className="text-xs font-bold text-[#382b31]/80">
            Slug *
            <input value={slug} maxLength={90} onChange={e => { setSlug(e.target.value); setSlugEdited(true); }} className={input}/>
            {errors.slug && <span className="mt-1 block text-red-500">{errors.slug}</span>}
          </label>
          <label className="text-xs font-bold text-[#382b31]/80 md:col-span-2">
            Short Description
            <textarea rows={2} maxLength={240} disabled title="Backend endpoint not available for this option." value={shortDescription} onChange={e => setShortDescription(e.target.value)} className={input}/>
          </label>
          {!compact && (<label className="text-xs font-bold text-[#382b31]/80 md:col-span-2">
              Description
              <textarea rows={3} maxLength={1200} value={description} onChange={e => setDescription(e.target.value)} className={input}/>
            </label>)}
          <div className="md:col-span-2">
            <span className="text-xs font-bold text-[#382b31]/80">Category Image <span className="font-medium text-[#382b31]/40">(optional, JPG/PNG/WebP, max 5 MB)</span></span>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {image ? (<img src={getSafeImageSrc(image)} alt="Category preview" className="h-20 w-20 rounded-2xl border object-cover"/>) : (<div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-dashed text-slate-300">
                  <ImagePlus />
                </div>)}
              <label className="cursor-pointer rounded-xl border border-[#ecdfe4] px-4 py-2.5 text-xs font-bold text-[#382b31]/80 hover:bg-[#FFF4F6]">
                {image ? 'Replace Image' : 'Upload Image'}
                <input type="file" accept="image/*" onChange={e => uploadImage(e.target.files?.[0])} className="sr-only"/>
              </label>
              {image && (<button type="button" onClick={removeSelectedImage} className="flex items-center gap-1 rounded-xl px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-[#FFF4F6]">
                  <Trash2 className="h-4 w-4"/> Remove
                </button>)}
            </div>
          </div>
          <label className="text-xs font-bold text-[#382b31]/80">
            Navigation Label
            <input disabled title="Backend endpoint not available for this option." value={navigationLabel} maxLength={60} onChange={e => setNavigationLabel(e.target.value)} className={input} placeholder="Defaults to category name"/>
          </label>
          <label className="text-xs font-bold text-[#382b31]/80">
            Display Order
            <input type="number" min="0" value={displayOrder} onChange={e => setDisplayOrder(Number(e.target.value))} className={input}/>
          </label>
          {!compact && (<label className="text-xs font-bold text-[#382b31]/80">
              Parent Category
              <select value={parentCategoryId} onChange={e => setParentCategoryId(e.target.value)} className={input}>
                <option value="">No parent</option>
                {categories.filter(item => item.id !== category?.id && !item.parentCategoryId).map(item => (<option key={item.id} value={item.id}>{item.name}</option>))}
              </select>
            </label>)}
          <div className="grid grid-cols-2 gap-3 md:col-span-2 sm:grid-cols-3">
            <label className="flex items-center gap-2 rounded-xl border border-[#ecdfe4] p-3 text-xs font-bold text-[#382b31]/80 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded text-[#673742]"/> Active
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-[#ecdfe4] p-3 text-xs font-bold text-[#382b31]/80 cursor-pointer">
              <input type="checkbox" disabled title="Backend endpoint not available for this option." checked={showInNavigation} onChange={e => setShowInNavigation(e.target.checked)} className="rounded text-[#673742]"/> In Navigation
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-[#ecdfe4] p-3 text-xs font-bold text-[#382b31]/80 cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="rounded text-[#673742]"/> Featured
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-[#ecdfe4] p-3 text-xs font-bold text-[#382b31]/80 cursor-pointer">
              <input type="checkbox" disabled title="Backend endpoint not available for this option." checked={desktopVisible} onChange={e => setDesktopVisible(e.target.checked)} className="rounded text-[#673742]"/> Desktop
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-[#ecdfe4] p-3 text-xs font-bold text-[#382b31]/80 cursor-pointer">
              <input type="checkbox" disabled title="Backend endpoint not available for this option." checked={mobileVisible} onChange={e => setMobileVisible(e.target.checked)} className="rounded text-[#673742]"/> Mobile
            </label>
          </div>
          {!compact && (<>
              <label className="text-xs font-bold text-[#382b31]/80">
                SEO Title
                <input disabled title="Backend endpoint not available for this option." value={seoTitle} maxLength={120} onChange={e => setSeoTitle(e.target.value)} className={input}/>
              </label>
              <label className="text-xs font-bold text-[#382b31]/80">
                Meta Description
                <textarea rows={2} disabled title="Backend endpoint not available for this option." value={metaDescription} maxLength={320} onChange={e => setMetaDescription(e.target.value)} className={input}/>
              </label>
            </>)}
          <div className="flex flex-col-reverse gap-2 border-t border-[#ecdfe4] pt-4 md:col-span-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl bg-[#FFF4F6] px-5 py-2.5 text-xs font-bold text-[#382b31]/80 hover:bg-slate-200">
              Cancel
            </button>
            <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#673742] to-[#673742] hover:from-[#673742] hover:to-[#673742] text-white px-5 py-2.5 text-xs font-bold">
              Save Category
            </button>
          </div>
        </form>
      </div>
    </div>);
};

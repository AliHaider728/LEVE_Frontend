"use client";
import { uploadImage as uploadAdminAsset } from '@/admin-ui/api';
import React, { useState, useMemo } from 'react';
import { ChevronLeft, Save, Search, Trash2, ImagePlus } from 'lucide-react';
import { useAdminUI } from '../context/AdminUIContext';
import { Bundle, Product } from '../types';
import { BundleGalleryImages } from '../components/bundles/BundleGalleryImages';
import { formatPrice } from '../utils/formatters';
import { getSafeImageSrc } from '../utils/images';
interface SelectedProduct {
    product: Product;
    quantity: number;
    variant?: string;
}
export const BundleFormPage: React.FC = () => {
    const { bundles, products, addBundle, updateBundle, activePageParams, setActivePage, showToast } = useAdminUI();
    const isEditing = Boolean(activePageParams?.id);
    const existingBundle = isEditing ? bundles.find(b => b.id === activePageParams.id) : null;
    // Form State
    const [name, setName] = useState(existingBundle?.name || '');
    const [slug, setSlug] = useState(existingBundle?.slug || '');
    const [shortDesc, setShortDesc] = useState(existingBundle?.shortDescription || '');
    const [description, setDescription] = useState(existingBundle?.description || '');
    const [isActive, setIsActive] = useState(existingBundle?.isActive !== false);
    const [isBestseller, setIsBestseller] = useState(existingBundle?.isBestseller || false);
    const [badgeText, setBadgeText] = useState(existingBundle?.badgeText || '');
    const [routineSteps, setRoutineSteps] = useState(existingBundle?.routineSteps || '');
    const [showShop, setShowShop] = useState(existingBundle?.showShop !== false);
    const [featureHome, setFeatureHome] = useState(existingBundle?.featureHome || false);
    // Selected Products
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(() => {
        if (existingBundle?.products && existingBundle.products.length > 0) {
            return existingBundle.products.map(p => ({
                product: p.product || products[0],
                quantity: p.quantity || 1,
                variant: p.variant
            }));
        }
        return [
            { product: products[0] || {} as any, quantity: 1 }
        ];
    });
    const [searchTerm, setSearchTerm] = useState('');
    // Pricing
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | 'custom'>(existingBundle?.discountType || 'percentage');
    const [discountValue, setDiscountValue] = useState<number>(existingBundle?.discountValue || existingBundle?.discountPercent || 20);
    const [customPrice, setCustomPrice] = useState<number>(existingBundle?.currentPrice || 0);
    // Images
    const [mainImage, setMainImage] = useState(existingBundle?.image || existingBundle?.customImage || (products[0]?.images?.[0] || ''));
    const [galleryImages, setGalleryImages] = useState<string[]>(existingBundle?.galleryImages || []);
    const originalTotal = useMemo(() => {
        return selectedProducts.reduce((sum, sp) => {
            const price = sp.product.price || 0;
            return sum + (price * sp.quantity);
        }, 0);
    }, [selectedProducts]);
    const finalPrice = useMemo(() => {
        if (discountType === 'percentage') {
            return Math.round(originalTotal * (1 - (discountValue / 100)));
        }
        if (discountType === 'fixed') {
            return Math.max(0, originalTotal - discountValue);
        }
        return customPrice;
    }, [originalTotal, discountType, discountValue, customPrice]);
    const availableProducts = useMemo(() => {
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !selectedProducts.some(sp => sp.product.id === p.id));
    }, [products, searchTerm, selectedProducts]);
    const addProductToBundle = (product: Product) => {
        setSelectedProducts(prev => [...prev, { product, quantity: 1 }]);
        setSearchTerm('');
    };
    const removeProduct = (idx: number) => {
        setSelectedProducts(prev => prev.filter((_, i) => i !== idx));
    };
    const updateQty = (idx: number, delta: number) => {
        setSelectedProducts(prev => prev.map((sp, i) => {
            if (i !== idx)
                return sp;
            const nextQty = Math.max(1, sp.quantity + delta);
            return { ...sp, quantity: nextQty };
        }));
    };
    const handleSave = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            if (!name.trim()) {
                showToast('Bundle name is required', 'error');
                return;
            }
            if (selectedProducts.length === 0) {
                showToast('Select at least one product for the bundle', 'error');
                return;
            }
            const payload: Partial<Bundle> = {
                name: name.trim(),
                slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                shortDescription: shortDesc.trim(),
                description: description.trim(),
                image: mainImage,
                customImage: mainImage,
                galleryImages,
                originalTotalPrice: originalTotal,
                currentPrice: finalPrice,
                discountPercent: discountType === 'percentage' ? discountValue : Math.round(((originalTotal - finalPrice) / originalTotal) * 100),
                discountType,
                discountValue,
                customPrice: discountType === 'custom' ? customPrice : undefined,
                isActive,
                isBestseller,
                badgeText: badgeText.trim(),
                routineSteps: routineSteps.trim(),
                showShop,
                featureHome,
                products: selectedProducts.map(sp => ({
                    product: sp.product,
                    quantity: sp.quantity,
                    variant: sp.variant
                }))
            };
            if (isEditing && existingBundle) {
                await updateBundle(existingBundle.id, payload);
            }
            else {
                await addBundle(payload);
            }
            setActivePage('bundles');
        }
        catch {
        }
    };
    return (<form onSubmit={handleSave} className="space-y-6 font-heading pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#ecdfe4] pb-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setActivePage('bundles')} className="p-2 rounded-xl bg-white border border-[#ecdfe4] hover:bg-[#FFF4F6] text-[#382b31]/70">
            <ChevronLeft className="w-5 h-5"/>
          </button>
          <div>
            <h1 className="font-heading font-black text-2xl text-[#382b31]">
              {isEditing ? 'Edit Curated Bundle' : 'Create New Bundle'}
            </h1>
            <p className="text-xs text-[#382b31]/50">
              Configure product pairings, routine bundle steps, and discounted pricing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setActivePage('bundles')} className="px-4 py-2.5 rounded-xl border border-[#ecdfe4] bg-white text-xs font-bold text-[#382b31]/70 hover:bg-[#FFF4F6]">
            Cancel
          </button>
          <button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#673742] to-[#673742] hover:from-[#673742] hover:to-[#673742] text-white px-5 py-2.5 text-xs font-bold shadow-sm">
            <Save className="w-4 h-4"/>
            <span>{isEditing ? 'Update Bundle' : 'Save Bundle'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Basic info */}
          <div className="bg-white p-6 rounded-3xl border border-[#ecdfe4] shadow-xs space-y-4">
            <h2 className="font-heading font-black text-base text-[#382b31]">Bundle Details</h2>

            <div>
              <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Bundle Name *</label>
              <input type="text" required value={name} onChange={e => {
            setName(e.target.value);
            if (!isEditing && !slug)
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
        }} placeholder="e.g. Glow Essentials 3-Step Routine" className="w-full text-sm font-bold rounded-xl border border-[#ecdfe4] px-3 py-2.5 outline-none focus:border-[#673742]"/>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">URL Slug</label>
                <input type="text" value={slug} onChange={e => setSlug(e.target.value)} placeholder="glow-essentials-routine" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 font-mono"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Marketing Badge Text</label>
                <input type="text" disabled title="Backend endpoint not available for this option." value={badgeText} onChange={e => setBadgeText(e.target.value)} placeholder="e.g. Save 20% or Free Gift" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2"/>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Short Summary</label>
              <input type="text" value={shortDesc} onChange={e => setShortDesc(e.target.value)} placeholder="Brief teaser displayed on cards" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2"/>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Full Description</label>
              <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed routine description and regimen recommendations..." className="w-full text-xs rounded-xl border border-[#ecdfe4] p-3"/>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Routine Application Steps</label>
              <textarea rows={3} disabled title="Backend endpoint not available for this option." value={routineSteps} onChange={e => setRoutineSteps(e.target.value)} placeholder="Step 1: Cleanse with foam cleanser...&#10;Step 2: Hydrate with toner..." className="w-full text-xs rounded-xl border border-[#ecdfe4] p-3 font-mono text-[11px]"/>
            </div>
          </div>

          <p role="note" className="text-xs text-[#673742]">Backend endpoint not available for marketing badges, routine application steps, or separate Shop/Home placement. These options are disabled.</p>
          {/* Section 2: Products in this Bundle */}
          <div className="bg-white p-6 rounded-3xl border border-[#ecdfe4] shadow-xs space-y-4">
            <h2 className="font-heading font-black text-base text-[#382b31]">
              Included Products ({selectedProducts.length})
            </h2>

            {/* Selected Products list */}
            <div className="divide-y divide-[#ecdfe4]/60 border border-[#ecdfe4] rounded-2xl overflow-hidden">
              {selectedProducts.map((sp, idx) => (<div key={sp.product.id || idx} className="p-3.5 bg-white flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={getSafeImageSrc(sp.product.images?.[0])} alt="" className="w-12 h-12 object-cover rounded-xl border border-[#ecdfe4]"/>
                    <div>
                      <span className="font-bold text-xs text-[#382b31] block">{sp.product.name}</span>
                      <span className="text-[11px] text-[#673742] font-semibold block">{formatPrice(sp.product.price)} each</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-[#ecdfe4] rounded-xl overflow-hidden bg-[#FFF4F6]">
                      <button type="button" onClick={() => updateQty(idx, -1)} className="px-2 py-1 text-xs font-bold hover:bg-white">
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-[#382b31]">{sp.quantity}</span>
                      <button type="button" onClick={() => updateQty(idx, 1)} className="px-2 py-1 text-xs font-bold hover:bg-white">
                        +
                      </button>
                    </div>

                    <button type="button" onClick={() => removeProduct(idx)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                </div>))}
            </div>

            {/* Product Search & Add */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-[#382b31]/80 mb-2">Search & Add Product to Bundle</label>
              <div className="relative mb-2">
                <input type="text" placeholder="Type to search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#ecdfe4] outline-none"/>
                <Search className="w-4 h-4 text-[#382b31]/40 absolute left-3 top-2.5"/>
              </div>

              {searchTerm && (<div className="max-h-40 overflow-y-auto border border-[#ecdfe4] rounded-2xl p-2 bg-[#FFF4F6] space-y-1">
                  {availableProducts.map(p => (<button key={p.id} type="button" onClick={() => addProductToBundle(p)} className="w-full text-left p-2 rounded-xl bg-white hover:bg-[#FFF4F6] flex items-center justify-between text-xs font-semibold">
                      <span>{p.name}</span>
                      <span className="font-bold text-[#673742]">{formatPrice(p.price)}</span>
                    </button>))}
                  {availableProducts.length === 0 && (<p className="text-center text-xs text-[#382b31]/40 py-2">No matching products found.</p>)}
                </div>)}
            </div>
          </div>

          {/* Section 3: Pricing & Discounts */}
          <div className="bg-white p-6 rounded-3xl border border-[#ecdfe4] shadow-xs space-y-4">
            <h2 className="font-heading font-black text-base text-[#382b31]">Bundle Pricing & Discount</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Discount Model</label>
                <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2.5 bg-white">
                  <option value="percentage">Percentage Off (%)</option>
                  <option value="fixed">Fixed Amount Off (Rs.)</option>
                  <option value="custom">Direct Bundle Price (Rs.)</option>
                </select>
              </div>

              {discountType === 'percentage' && (<div>
                  <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Discount (%)</label>
                  <input type="number" min="0" max="100" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2.5"/>
                </div>)}

              {discountType === 'fixed' && (<div>
                  <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Discount Amount (Rs.)</label>
                  <input type="number" min="0" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2.5"/>
                </div>)}

              {discountType === 'custom' && (<div>
                  <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Custom Price (Rs.)</label>
                  <input type="number" min="0" value={customPrice} onChange={e => setCustomPrice(Number(e.target.value))} className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2.5"/>
                </div>)}
            </div>

            {/* Live Price Calculator */}
            <div className="p-4 rounded-2xl bg-[#FFF4F6] border border-[#ecdfe4] flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#382b31]/40 block">Combined Individual Items</span>
                <span className="text-sm font-bold text-[#382b31]/60 line-through">{formatPrice(originalTotal)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#673742] block">Customer Savings</span>
                <span className="text-sm font-bold text-[#673742]">Save {formatPrice(originalTotal - finalPrice)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#673742] block">Bundle Final Price</span>
                <span className="text-xl font-black text-[#673742]">{formatPrice(finalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Gallery */}
          <BundleGalleryImages images={galleryImages} onChange={setGalleryImages}/>
        </div>

        {/* Right Column: Live Card Preview & Settings */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#ecdfe4] shadow-xs space-y-4">
            <h3 className="font-heading font-black text-sm text-[#382b31]">Publishing Controls</h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-[#382b31]">Active Status</span>
                <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded text-[#673742]"/>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-[#382b31]">Bestseller Badge</span>
                <input type="checkbox" checked={isBestseller} onChange={e => setIsBestseller(e.target.checked)} className="rounded text-[#673742]"/>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-[#382b31]">Show in Shop Page</span>
                <input type="checkbox" disabled title="Backend endpoint not available for this option." checked={showShop} onChange={e => setShowShop(e.target.checked)} className="rounded text-[#673742]"/>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-[#382b31]">Feature on Homepage</span>
                <input type="checkbox" disabled title="Backend endpoint not available for this option." checked={featureHome} onChange={e => setFeatureHome(e.target.checked)} className="rounded text-[#673742]"/>
              </label>
            </div>
          </div>

          {/* Main Image */}
          <div className="bg-white p-6 rounded-3xl border border-[#ecdfe4] shadow-xs space-y-3">
            <h3 className="font-heading font-black text-sm text-[#382b31]">Main Cover Image</h3>
            {mainImage ? (<div className="relative aspect-video rounded-2xl overflow-hidden border border-[#ecdfe4]">
                <img src={getSafeImageSrc(mainImage)} alt="Cover" className="w-full h-full object-cover"/>
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  Replace Image
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                try {
                    if (e.target.files?.[0])
                        setMainImage(await uploadAdminAsset(e.target.files[0]));
                }
                catch {
                }
            }}/>
                </label>
              </div>) : (<label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-[#ecdfe4] rounded-2xl cursor-pointer hover:bg-[#FFF4F6]">
                <ImagePlus className="w-8 h-8 text-[#382b31]/30 mb-2"/>
                <span className="text-xs font-bold text-[#673742]">Upload Cover Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                try {
                    if (e.target.files?.[0])
                        setMainImage(await uploadAdminAsset(e.target.files[0]));
                }
                catch {
                }
            }}/>
              </label>)}
          </div>

          {/* Live Storefront Card Preview */}
          <div className="bg-white p-6 rounded-3xl border border-[#ecdfe4] shadow-xs space-y-3">
            <h3 className="font-heading font-black text-xs text-[#382b31]/50 uppercase tracking-wider">
              Storefront Preview Card
            </h3>
            <div className="border border-[#ecdfe4] rounded-2xl overflow-hidden bg-[#FFF4F6]">
              <div className="relative aspect-video">
                <img src={getSafeImageSrc(mainImage)} alt="Preview" className="w-full h-full object-cover"/>
                {badgeText && (<span className="absolute top-2 left-2 px-2 py-0.5 bg-[#673742] text-white text-[9px] font-black uppercase rounded">
                    {badgeText}
                  </span>)}
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-xs text-[#382b31] truncate">{name || 'Bundle Title'}</h4>
                <p className="text-[11px] text-[#382b31]/60 line-clamp-1">{shortDesc || 'Bundle short summary'}</p>
                <div className="pt-2 flex items-baseline gap-2">
                  <span className="font-black text-sm text-[#673742]">{formatPrice(finalPrice)}</span>
                  {originalTotal > finalPrice && (<span className="text-[10px] text-[#382b31]/40 line-through">{formatPrice(originalTotal)}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>);
};

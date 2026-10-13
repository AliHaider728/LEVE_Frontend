"use client";
import { uploadImage as uploadAdminAsset } from '@/admin-ui/api';
import React, { useState } from 'react';
import { ChevronLeft, Save, Plus, Search, Trash2, ImagePlus } from 'lucide-react';
import { useAdminUI } from '../context/AdminUIContext';
import { Product, ProductAttribute, ProductVariation, PricingOffers, ProductDetailBlock } from '../types';
import { Switch } from '../components/Switch';
import { AttributesManager } from '../components/attributes/AttributesManager';
import { VariationsGenerator } from '../components/attributes/VariationsGenerator';
import { PricingOffersSection } from '../components/products/PricingOffersSection';
import { ProductDetailContentBuilder } from '../components/products/ProductDetailContentBuilder';
import { CategoryFormModal } from '../components/categories/CategoryFormModal';
import { getSafeImageSrc } from '../utils/images';
export const ProductFormPage: React.FC = () => {
    const { products, categories, globalAttributes, addProduct, updateProduct, addCategory, activePageParams, setActivePage, showToast, settings } = useAdminUI();
    const isEditing = Boolean(activePageParams?.id);
    const existingProduct = isEditing ? products.find(p => p.id === activePageParams.id) : null;
    // Basic info
    const [productType, setProductType] = useState<'simple' | 'variable'>(existingProduct?.productType === 'variable' ? 'variable' : 'simple');
    const [name, setName] = useState(existingProduct?.name || '');
    const [shortDescription, setShortDescription] = useState(existingProduct?.shortDescription || '');
    const [description, setDescription] = useState(existingProduct?.description || '');
    const [brand, setBrand] = useState(existingProduct?.brand || 'LEVA');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(existingProduct?.categoryIds || (existingProduct?.categoryId ? [existingProduct.categoryId] : []));
    const [categorySearch, setCategorySearch] = useState('');
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    // Pricing & Stock (Simple)
    const [regularPrice, setRegularPrice] = useState<string>(existingProduct?.originalPrice ? String(existingProduct.originalPrice) : existingProduct?.price ? String(existingProduct.price) : '');
    const [salePrice, setSalePrice] = useState<string>(existingProduct?.originalPrice ? String(existingProduct.price) : '');
    const [sku, setSku] = useState(existingProduct?.sku || '');
    const [trackInventory, setTrackInventory] = useState(existingProduct?.trackInventory ?? true);
    const [stockQuantity, setStockQuantity] = useState<string>(existingProduct?.stockQuantity !== undefined && existingProduct?.stockQuantity !== null ? String(existingProduct.stockQuantity) : '20');
    const [lowStockThreshold, setLowStockThreshold] = useState<string>(existingProduct?.lowStockThreshold ? String(existingProduct.lowStockThreshold) : '5');
    const [stockStatus, setStockStatus] = useState(existingProduct?.stockStatus || 'in_stock');
    // Variable product
    const [attributes, setAttributes] = useState<ProductAttribute[]>(existingProduct?.attributes || []);
    const [variations, setVariations] = useState<ProductVariation[]>(existingProduct?.variations || []);
    const [sizeGuide, setSizeGuide] = useState(existingProduct?.specifications?.sizeGuide || '');
    // Offers
    const [pricingOffers, setPricingOffers] = useState<PricingOffers>(existingProduct?.pricingOffers || {
        quantityBreaks: { enabled: false, tiers: [] },
        bogo: { enabled: false, buyQty: 2, getQty: 1, label: '' },
        flatDiscount: { enabled: false, minQty: 2, discountType: 'fixed', discountValue: 0, label: '' }
    });
    // Shipping
    const [weight, setWeight] = useState<string>(existingProduct?.weight ? String(existingProduct.weight) : '');
    const [deliveryType, setDeliveryType] = useState(existingProduct?.deliveryType || 'store_threshold');
    const [customDeliveryFee, setCustomDeliveryFee] = useState<string>(existingProduct?.customDeliveryFee ? String(existingProduct.customDeliveryFee) : '');
    // Content Builder
    const [productDetailBlocks, setProductDetailBlocks] = useState<ProductDetailBlock[]>(existingProduct?.productDetailBlocks || []);
    const [customCss, setCustomCss] = useState(existingProduct?.productDetailCustomCss || '');
    // Sidebar / Publish
    const [status, setStatus] = useState<'published' | 'draft'>(existingProduct?.status || 'published');
    const [isVisible, setIsVisible] = useState(existingProduct?.isVisible !== false);
    const [isFeatured, setIsFeatured] = useState(existingProduct?.isFeatured || false);
    const [isBestseller, setIsBestseller] = useState(existingProduct?.isBestseller || false);
    const [isNewArrival, setIsNewArrival] = useState(existingProduct?.isNewArrival || false);
    const [isSpotlight, setIsSpotlight] = useState(existingProduct?.isSpotlight || false);
    const [soldCount] = useState<string>(existingProduct?.soldCount ? String(existingProduct.soldCount) : '');
    // Images
    const [images, setImages] = useState<string[]>(existingProduct?.images || []);
    // Product details & SEO
    const [material, setMaterial] = useState(existingProduct?.specifications?.Material || '');
    const [safetyInfo, setSafetyInfo] = useState(existingProduct?.safetyInfo || '');
    const [metaTitle, setMetaTitle] = useState(existingProduct?.metaTitle || '');
    const [metaDescription, setMetaDescription] = useState(existingProduct?.metaDescription || '');
    const [slug, setSlug] = useState(existingProduct?.slug || '');
    const activeBasePrice = parseFloat(salePrice || regularPrice || '0') || 0;
    const handleSave = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            if (!name.trim()) {
                showToast('Product name is required', 'error');
                return;
            }
            const priceNum = parseFloat(salePrice || regularPrice || '0') || 0;
            const origPriceNum = salePrice && regularPrice ? parseFloat(regularPrice) : undefined;
            const catObjs = categories.filter(c => selectedCategoryIds.includes(c.id));
            const payload: Partial<Product> = {
                productType,
                name: name.trim(),
                slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                sku: sku.trim(),
                brand,
                price: priceNum,
                originalPrice: origPriceNum,
                shortDescription,
                description,
                inStock: trackInventory ? (parseInt(stockQuantity, 10) > 0) : stockStatus === 'in_stock',
                trackInventory,
                stockQuantity: trackInventory ? parseInt(stockQuantity, 10) : null,
                stockStatus: stockStatus as any,
                lowStockThreshold: parseInt(lowStockThreshold, 10) || null,
                category: catObjs[0]?.name || 'Uncategorized',
                categorySlug: catObjs[0]?.slug || 'uncategorized',
                categoryId: catObjs[0]?.id,
                categoryIds: selectedCategoryIds,
                categoryNames: catObjs.map(c => c.name),
                categorySlugs: catObjs.map(c => c.slug),
                images,
                attributes,
                variations,
                specifications: { ...existingProduct?.specifications, Material: material, sizeGuide },
                pricingOffers,
                weight: parseFloat(weight) || undefined,
                deliveryType: deliveryType as any,
                customDeliveryFee: parseFloat(customDeliveryFee) || undefined,
                productDetailBlocks,
                productDetailCustomCss: customCss,
                status,
                isVisible,
                isFeatured,
                isBestseller,
                isNewArrival,
                isSpotlight,

                safetyInfo,
                metaTitle,
                metaDescription
            };
            if (isEditing && existingProduct) {
                await updateProduct(existingProduct.id, payload);
            }
            else {
                await addProduct(payload);
            }
            setActivePage('products');
        }
        catch {
        }
    };
    const handleUploadMainImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!e.target.files || !e.target.files[0])
                return;
            const url = await uploadAdminAsset(e.target.files[0]);
            setImages(prev => [url, ...prev.slice(1)]);
        }
        catch {
        }
    };
    const handleAddGalleryImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!e.target.files)
                return;
            const urls = await Promise.all(Array.from(e.target.files).map(async (f) => await uploadAdminAsset(f)));
            setImages(prev => [...prev, ...urls].slice(0, 8));
        }
        catch {
        }
    };
    const setAsMainImage = (idx: number) => {
        setImages(prev => {
            const copy = [...prev];
            const [item] = copy.splice(idx, 1);
            return [item, ...copy];
        });
    };
    const removeImage = (idx: number) => {
        setImages(prev => prev.filter((_, i) => i !== idx));
    };
    return (<form onSubmit={handleSave} className="space-y-6 font-heading pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#ecdfe4] pb-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setActivePage('products')} className="p-2 rounded-xl bg-white border border-[#ecdfe4] hover:bg-[#FFF4F6] text-[#382b31]/70 transition-colors">
            <ChevronLeft className="w-5 h-5"/>
          </button>
          <div>
            <h1 className="font-heading font-black text-2xl text-[#382b31]">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-xs text-[#382b31]/50">
              {isEditing ? `Modifying "${existingProduct?.name}"` : 'Create a new catalog item with full variations and PDP blocks.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setActivePage('products')} className="px-4 py-2.5 rounded-xl border border-[#ecdfe4] bg-white text-xs font-bold text-[#382b31]/70 hover:bg-[#FFF4F6]">
            Cancel
          </button>
          <button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#673742] to-[#673742] hover:from-[#673742] hover:to-[#673742] text-white px-5 py-2.5 text-xs font-bold shadow-sm">
            <Save className="w-4 h-4"/>
            <span>{isEditing ? 'Update Product' : 'Save Product'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 2/3 Content + 1/3 Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Basic Information */}
          <div className="bg-white p-6 rounded-3xl border border-[#ecdfe4] shadow-xs space-y-4">
            <h2 className="font-heading font-black text-base text-[#382b31]">Basic Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1.5">Product Type</label>
                <select value={productType} onChange={e => setProductType(e.target.value as any)} className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2.5 bg-white font-medium">
                  <option value="simple">Simple Product</option>
                  <option value="variable">Variable Product (Variations)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1.5">Brand</label>
                <input type="text" value={brand} onChange={e => setBrand(e.target.value)} placeholder="LEVA" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2.5 bg-white"/>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#382b31]/80 mb-1.5">Product Name *</label>
              <input type="text" required value={name} onChange={e => {
            setName(e.target.value);
            if (!isEditing && !slug) {
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
            }
        }} placeholder="e.g. Vitamin C Brightening Serum 15%" className="w-full text-sm font-bold rounded-xl border border-[#ecdfe4] px-3 py-2.5 bg-white outline-none focus:border-[#673742]"/>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-[#382b31]/80">Short Description</label>
                <span className="text-[10px] text-[#382b31]/40">{shortDescription.length}/300</span>
              </div>
              <input type="text" maxLength={300} value={shortDescription} onChange={e => setShortDescription(e.target.value)} placeholder="Brief single-line summary for product card & cart" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2.5 bg-white"/>
            </div>

            {/* Categories Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#382b31]/80">Categories</label>
                <button type="button" onClick={() => setIsCategoryModalOpen(true)} className="text-xs font-bold text-[#673742] flex items-center gap-1 hover:underline">
                  <Plus className="w-3.5 h-3.5"/> Add Category
                </button>
              </div>

              {/* Selected category chips */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedCategoryIds.map((cid, idx) => {
            const cat = categories.find(c => c.id === cid);
            if (!cat)
                return null;
            return (<span key={cid} className="inline-flex items-center gap-1.5 bg-[#FFF4F6] border border-[#ecdfe4] px-2.5 py-1 rounded-xl text-xs font-semibold text-[#382b31]">
                      {cat.name}
                      {idx === 0 && <span className="text-[9px] bg-[#673742] text-white px-1 rounded">Primary</span>}
                      <button type="button" onClick={() => setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== cid))} className="text-[#382b31]/40 hover:text-red-500">
                        &times;
                      </button>
                    </span>);
        })}
              </div>

              {/* Category Search & checkboxes */}
              <div className="relative mb-2">
                <input type="text" placeholder="Filter categories list..." value={categorySearch} onChange={e => setCategorySearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#ecdfe4]"/>
                <Search className="w-3.5 h-3.5 text-[#382b31]/40 absolute left-2.5 top-2.5"/>
              </div>

              <div className="max-h-32 overflow-y-auto border border-[#ecdfe4] rounded-xl p-2 space-y-1.5 bg-[#FFF4F6]/30">
                {categories
            .filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
            .map(c => (<label key={c.id} className="flex items-center gap-2 text-xs text-[#382b31]/80 hover:bg-[#FFF4F6] p-1 rounded-lg cursor-pointer">
                      <input type="checkbox" checked={selectedCategoryIds.includes(c.id)} onChange={e => {
                if (e.target.checked)
                    setSelectedCategoryIds([...selectedCategoryIds, c.id]);
                else
                    setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== c.id));
            }} className="rounded text-[#673742]"/>
                      {c.name}
                    </label>))}
              </div>
            </div>
          </div>

          <label className="block text-xs font-semibold mb-5">Description<textarea value={description} onChange={e=>setDescription(e.target.value)} className="mt-2 w-full rounded-xl border border-[#ecdfe4] p-3" rows={4}/></label>
          {/* Section 2: Pricing & Stock (Simple Only) */}
          {productType === 'simple' && (<div className="bg-white p-6 rounded-3xl border border-[#ecdfe4] shadow-xs space-y-4">
              <h2 className="font-heading font-black text-base text-[#382b31]">Pricing & Inventory</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#382b31]/80 mb-1.5">Regular Price (Rs.) *</label>
                  <input type="number" min="0" required value={regularPrice} onChange={e => setRegularPrice(e.target.value)} placeholder="e.g. 2500" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2.5 bg-white"/>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#382b31]/80 mb-1.5">Sale Price (Rs.)</label>
                  <input type="number" min="0" value={salePrice} onChange={e => setSalePrice(e.target.value)} placeholder="Optional discount price" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2.5 bg-white"/>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#382b31]/80 mb-1.5">SKU</label>
                  <input type="text" value={sku} onChange={e => setSku(e.target.value.toUpperCase())} placeholder="LEV-VITC-30ML" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2.5 bg-white font-mono"/>
                </div>
              </div>

              <div className="pt-2 border-t border-[#ecdfe4]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-bold text-[#382b31] block">Track Inventory Quantity</span>
                    <span className="text-[11px] text-[#382b31]/50">Enable automatic stock deduction upon orders</span>
                  </div>
                  <Switch checked={trackInventory} onChange={setTrackInventory}/>
                </div>

                {trackInventory ? (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FFF4F6] p-4 rounded-2xl border border-[#ecdfe4]">
                    <div>
                      <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Stock Quantity *</label>
                      <input type="number" min="0" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} className="w-full text-xs bg-white border border-[#ecdfe4] rounded-xl px-3 py-2"/>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Low Stock Alert Level</label>
                      <input type="number" min="0" value={lowStockThreshold} onChange={e => setLowStockThreshold(e.target.value)} placeholder="5" className="w-full text-xs bg-white border border-[#ecdfe4] rounded-xl px-3 py-2"/>
                    </div>
                  </div>) : (<div>
                    <label className="block text-xs font-bold text-[#382b31]/80 mb-1.5">Manual Stock Status</label>
                    <select value={stockStatus} onChange={e => setStockStatus(e.target.value as any)} className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2.5 bg-white">
                      <option value="in_stock">In Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>)}
              </div>
            </div>)}

          {/* Section 3: Attributes & Variations (Variable Only) */}
          {productType === 'variable' && (<div className="bg-white p-6 rounded-3xl border border-[#ecdfe4] shadow-xs space-y-6">
              <h2 className="font-heading font-black text-base text-[#382b31]">Attributes & Variations</h2>

              <AttributesManager attributes={attributes} onChange={setAttributes} globalAttributesList={globalAttributes}/>

              <div className="pt-4 border-t border-[#ecdfe4]">
                <VariationsGenerator attributes={attributes} variations={variations} onChange={setVariations} basePrice={activeBasePrice} productImages={images.map((url, i) => ({ id: `img-${i}`, url }))}/>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1.5">Size Guide / Shade Guide Notes</label>
                <textarea rows={3} value={sizeGuide} onChange={e => setSizeGuide(e.target.value)} placeholder="Optional size / swatch description table or guide" className="w-full text-xs rounded-xl border border-[#ecdfe4] p-3"/>
              </div>
            </div>)}

          {/* Section 4: Pricing Offers */}
          <div className="bg-white p-6 rounded-3xl border border-[#ecdfe4] shadow-xs">
            <h2 className="font-heading font-black text-base text-[#382b31] mb-4">Promotional Offers & Quantity Breaks</h2>
            <PricingOffersSection value={pricingOffers} onChange={setPricingOffers} basePrice={activeBasePrice}/>
          </div>

          {/* Section 5: Delivery & Shipping */}
          <div className="bg-white p-6 rounded-3xl border border-[#ecdfe4] shadow-xs space-y-4">
            <h2 className="font-heading font-black text-base text-[#382b31]">Shipping & Delivery</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1.5">Weight / Volume (ml or g)</label>
                <input type="number" min="0" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 50" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2.5"/>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1.5">Delivery Fee Model</label>
                <select value={deliveryType} onChange={e => setDeliveryType(e.target.value as any)} className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2.5 bg-white">
                  <option value="store_threshold">Standard Store Threshold (Free from Rs. {settings.freeShippingThreshold})</option>
                  <option value="free">Always Free Delivery</option>
                  <option value="fixed">Custom Delivery Fee for this Item</option>
                </select>
              </div>

              {deliveryType === 'fixed' && (<div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#382b31]/80 mb-1.5">Custom Delivery Fee (Rs.)</label>
                  <input type="number" min="0" value={customDeliveryFee} onChange={e => setCustomDeliveryFee(e.target.value)} placeholder="e.g. 250" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2.5"/>
                </div>)}
            </div>
          </div>

          {/* Section 6: Product Detail Blocks */}
          <ProductDetailContentBuilder blocks={productDetailBlocks} customCss={customCss} isSuperAdmin={true} onBlocksChange={setProductDetailBlocks} onCustomCssChange={setCustomCss}/>
        </div>

        {/* Right Column (1 Col) - Sidebar */}
        <div className="space-y-6">
          {/* Section 7: Publish Status */}
          <div className="bg-white p-6 rounded-3xl border border-[#ecdfe4] shadow-xs space-y-4">
            <h2 className="font-heading font-black text-base text-[#382b31]">Publishing & Status</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Catalog Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 bg-white">
                  <option value="published">Published</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Store Visibility</label>
                <select value={isVisible ? 'visible' : 'hidden'} onChange={e => setIsVisible(e.target.value === 'visible')} className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 bg-white">
                  <option value="visible">Visible to Customers</option>
                  <option value="hidden">Hidden from Search & Listings</option>
                </select>
              </div>

              <div className="pt-2 border-t border-[#ecdfe4] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#382b31]/80">Featured Product</span>
                  <Switch checked={isFeatured} onChange={setIsFeatured}/>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#382b31]/80">Bestseller Badge</span>
                  <Switch checked={isBestseller} onChange={setIsBestseller}/>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#382b31]/80">New Arrival</span>
                  <Switch checked={isNewArrival} onChange={setIsNewArrival}/>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#382b31]/80">Homepage Spotlight</span>
                  <Switch checked={isSpotlight} onChange={setIsSpotlight}/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Sold Count (Social Proof)</label>
                <input type="number" min="0" value={soldCount} disabled title="Sales totals are derived from orders; this backend has no manual sold-count endpoint." placeholder="Derived from orders" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2"/>
              </div>
            </div>
          </div>

          {/* Section 8: Images */}
          <div className="bg-white p-6 rounded-3xl border border-[#ecdfe4] shadow-xs space-y-4">
            <h2 className="font-heading font-black text-base text-[#382b31]">Product Images</h2>

            {/* Main Image */}
            <div>
              <span className="block text-xs font-bold text-[#382b31]/80 mb-2">Main Product Image</span>
              {images[0] ? (<div className="relative aspect-square rounded-2xl overflow-hidden border border-[#ecdfe4] bg-[#FFF4F6] group">
                  <img src={getSafeImageSrc(images[0])} alt="Main" className="w-full h-full object-cover"/>
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    Replace Main Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleUploadMainImage}/>
                  </label>
                </div>) : (<label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-[#ecdfe4] rounded-2xl cursor-pointer hover:bg-[#FFF4F6]">
                  <ImagePlus className="w-8 h-8 text-[#382b31]/30 mb-2"/>
                  <span className="text-xs font-bold text-[#673742]">Upload Main Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleUploadMainImage}/>
                </label>)}
            </div>

            {/* Gallery Images */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#382b31]/80">Gallery ({images.length}/8)</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {images.map((img, i) => (<div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-[#ecdfe4] group">
                    <img src={getSafeImageSrc(img)} alt={`Gallery ${i}`} className="w-full h-full object-cover"/>
                    {i === 0 && (<span className="absolute bottom-0 inset-x-0 bg-[#673742] text-white text-[9px] font-bold text-center py-0.5">
                        Main
                      </span>)}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity">
                      {i !== 0 && (<button type="button" onClick={() => setAsMainImage(i)} className="text-[9px] text-white bg-[#673742] px-1.5 py-0.5 rounded font-bold">
                          Set Main
                        </button>)}
                      <button type="button" onClick={() => removeImage(i)} className="text-white hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  </div>))}
              </div>

              <label className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-[#ecdfe4] rounded-xl text-xs font-bold text-[#673742] hover:bg-[#FFF4F6] cursor-pointer">
                <Plus className="w-3.5 h-3.5"/> Add Gallery Photos
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleAddGalleryImages}/>
              </label>
            </div>
          </div>

          {/* Section 9: Safety & Materials */}
          <div className="bg-white p-6 rounded-3xl border border-[#ecdfe4] shadow-xs space-y-4">
            <h2 className="font-heading font-black text-base text-[#382b31]">Specifications</h2>

            <div>
              <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Key Formulation / Material</label>
              <input type="text" value={material} onChange={e => setMaterial(e.target.value)} placeholder="e.g. 15% Ethylated Ascorbic Acid" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2"/>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Safety & Usage Notes</label>
              <textarea rows={3} value={safetyInfo} onChange={e => setSafetyInfo(e.target.value)} placeholder="Storage temperature, sunscreen warning, allergy advice" className="w-full text-xs rounded-xl border border-[#ecdfe4] p-3"/>
            </div>
          </div>

          {/* Section 10: SEO Settings */}
          <div className="bg-white p-6 rounded-3xl border border-[#ecdfe4] shadow-xs space-y-4">
            <h2 className="font-heading font-black text-base text-[#382b31]">SEO Metadata</h2>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-[#382b31]/80">SEO Meta Title</label>
                <span className="text-[10px] text-[#382b31]/40">{metaTitle.length}/70</span>
              </div>
              <input type="text" maxLength={70} value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="Title tag for search engine results" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2"/>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-[#382b31]/80">Meta Description</label>
                <span className="text-[10px] text-[#382b31]/40">{metaDescription.length}/180</span>
              </div>
              <textarea rows={3} maxLength={180} value={metaDescription} onChange={e => setMetaDescription(e.target.value)} placeholder="Summary snippet displayed on Google search" className="w-full text-xs rounded-xl border border-[#ecdfe4] p-3"/>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#382b31]/80 mb-1">URL Slug</label>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} placeholder="product-url-slug" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 font-mono"/>
              <span className="text-[10px] text-[#382b31]/40 mt-1 block">Preview: /shop/{slug || '...'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Category Modal */}
      {isCategoryModalOpen && (<CategoryFormModal categories={categories} onClose={() => setIsCategoryModalOpen(false)} onSave={async (data) => {
                try {
                    const created = await addCategory(data);
                    setSelectedCategoryIds(prev => [...prev, created.id]);
                }
                catch {
                }
            }} compact/>)}
    </form>);
};

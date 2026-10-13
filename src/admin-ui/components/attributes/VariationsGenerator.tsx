"use client";
import React, { useState } from 'react';
import { Play, Trash2, Image as ImageIcon } from 'lucide-react';
import { ProductAttribute, ProductVariation } from '../../types';
import { VariationImageModal } from '../products/VariationImageModal';
import { getSafeImageSrc } from '../../utils/images';
interface VariationsGeneratorProps {
    attributes: ProductAttribute[];
    variations: ProductVariation[];
    onChange: (variations: ProductVariation[]) => void;
    basePrice?: number;
    productImages?: {
        id: string;
        url: string;
        publicId?: string;
    }[];
}
export const VariationsGenerator: React.FC<VariationsGeneratorProps> = ({ attributes, variations, onChange, basePrice = 0, productImages = [] }) => {
    const [editingImageFor, setEditingImageFor] = useState<string | null>(null);
    const variationAttributes = attributes.filter(a => {
        if (!a.usedForVariations)
            return false;
        if (a.source === 'custom')
            return a.terms && a.terms.length > 0;
        return a.selectedTermIds && a.selectedTermIds.length > 0;
    });
    const generateCombinations = () => {
        if (variationAttributes.length === 0)
            return;
        const generate = (index: number, currentCombo: Record<string, string>): Record<string, string>[] => {
            if (index === variationAttributes.length) {
                return [{ ...currentCombo }];
            }
            const attr = variationAttributes[index];
            const results: Record<string, string>[] = [];
            const values = attr.source === 'global'
                ? (attr.terms || []).filter(t => (attr.selectedTermIds || []).includes(t.id)).map(t => t.value)
                : (attr.terms || []).map(t => t.value);
            for (const val of values) {
                results.push(...generate(index + 1, { ...currentCombo, [attr.slug]: val }));
            }
            return results;
        };
        const combinations = generate(0, {});
        const newVariations = combinations.map(combo => {
            const existing = variations.find(v => {
                return Object.entries(combo).every(([key, val]) => v.attributes[key] === val) &&
                    Object.keys(v.attributes).length === Object.keys(combo).length;
            });
            if (existing)
                return existing;
            return {
                id: `var-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                attributes: combo,
                enabled: true,
                sku: '',
                regularPrice: basePrice || ('' as unknown as number),
                manageStock: false,
                stockStatus: 'in_stock' as const
            };
        });
        onChange(newVariations);
    };
    const updateVariation = (id: string, field: keyof ProductVariation, value: any) => {
        onChange(variations.map(v => v.id === id ? { ...v, [field]: value } : v));
    };
    const removeVariation = (id: string) => {
        onChange(variations.filter(v => v.id !== id));
    };
    const getLabel = (v: ProductVariation) => {
        return Object.entries(v.attributes).map(([k, val]) => `${k}: ${val}`).join(' / ');
    };
    return (<div className="space-y-6">
      <div className="flex items-center justify-between bg-[#FFF4F6] p-4 border border-[#ecdfe4] rounded-xl">
        <div>
          <h3 className="font-heading font-bold text-[#382b31]">Generate Variations</h3>
          <p className="text-sm text-[#382b31]/50">
            {variationAttributes.length > 0
            ? `Ready to generate from ${variationAttributes.length} attribute(s).`
            : 'Add attributes used for variations first.'}
          </p>
        </div>
        <button type="button" disabled={variationAttributes.length === 0} onClick={generateCombinations} className="flex items-center gap-2 px-4 py-2 bg-[#673742] text-white font-heading font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#673742] transition-colors text-sm">
          <Play className="w-4 h-4"/> Generate
        </button>
      </div>

      {variations.length > 0 && (<div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-[#FFF4F6] rounded-lg text-xs font-heading font-bold text-[#382b31]/70 uppercase tracking-wider">
            <div className="col-span-3">Attributes</div>
            <div className="col-span-2">Regular Price</div>
            <div className="col-span-2">Sale Price</div>
            <div className="col-span-2">SKU</div>
            <div className="col-span-2">Stock</div>
            <div className="col-span-1 text-center">Image</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {variations.map((variation) => (<div key={variation.id} className={`grid grid-cols-12 gap-4 px-4 py-3 border border-[#ecdfe4] rounded-xl items-center transition-opacity ${!variation.enabled ? 'opacity-50 bg-[#FFF4F6]' : 'bg-white'}`}>
              <div className="col-span-3 flex flex-col gap-1">
                <span className="text-sm font-bold text-[#382b31]">
                  {getLabel(variation) || 'Custom Variant'}
                </span>
                <label className="flex items-center gap-2 text-xs text-[#382b31]/50 mt-1 cursor-pointer">
                  <input type="checkbox" checked={variation.enabled} onChange={(e) => updateVariation(variation.id, 'enabled', e.target.checked)} className="rounded text-[#673742] focus:ring-[#673742] cursor-pointer"/>
                  Enabled
                </label>
              </div>

              <div className="col-span-2">
                <input type="number" min="0" value={variation.regularPrice !== undefined && variation.regularPrice !== ('' as unknown as number) ? variation.regularPrice : ''} onChange={(e) => updateVariation(variation.id, 'regularPrice', e.target.value === '' ? ('' as unknown as number) : parseFloat(e.target.value))} className="w-full rounded-lg border border-[#ecdfe4] px-3 py-1.5 text-sm focus:border-[#673742] outline-none" placeholder="Required"/>
              </div>

              <div className="col-span-2">
                <input type="number" min="0" value={variation.salePrice || ''} onChange={(e) => updateVariation(variation.id, 'salePrice', e.target.value ? parseFloat(e.target.value) : undefined)} className="w-full rounded-lg border border-[#ecdfe4] px-3 py-1.5 text-sm focus:border-[#673742] outline-none" placeholder="Optional"/>
              </div>

              <div className="col-span-2">
                <input type="text" value={variation.sku || ''} onChange={(e) => updateVariation(variation.id, 'sku', e.target.value)} className="w-full rounded-lg border border-[#ecdfe4] px-3 py-1.5 text-sm focus:border-[#673742] outline-none" placeholder="SKU"/>
              </div>

              <div className="col-span-2 flex flex-col gap-2">
                <label className="flex items-center gap-2 text-xs text-[#382b31]/70 cursor-pointer">
                  <input type="checkbox" checked={variation.manageStock} onChange={(e) => updateVariation(variation.id, 'manageStock', e.target.checked)} className="rounded text-[#673742] focus:ring-[#673742] cursor-pointer"/>
                  Track
                </label>
                {variation.manageStock && (<input type="number" min="0" value={variation.stockQuantity || ''} onChange={(e) => updateVariation(variation.id, 'stockQuantity', parseInt(e.target.value, 10))} className="w-full rounded-lg border border-[#ecdfe4] px-3 py-1.5 text-sm focus:border-[#673742] outline-none" placeholder="Qty"/>)}
              </div>

              <div className="col-span-1 flex justify-center items-center">
                <button type="button" onClick={() => setEditingImageFor(variation.id)} className={`p-1.5 rounded-lg border transition-colors ${variation.image?.url ? 'border-[#673742] bg-[#FFF4F6]' : 'border-[#ecdfe4] bg-white hover:bg-[#FFF4F6]'} text-[#382b31]/50`} title="Variation Image">
                  {variation.image?.url ? (<img src={getSafeImageSrc(variation.image.url)} alt="Variation" className="w-6 h-6 object-cover rounded-md"/>) : (<ImageIcon className="w-5 h-5 opacity-70"/>)}
                </button>
              </div>

              <div className="col-span-1 flex justify-end">
                <button type="button" onClick={() => removeVariation(variation.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove Variation">
                  <Trash2 className="w-5 h-5"/>
                </button>
              </div>
            </div>))}
        </div>)}

      {editingImageFor && (<VariationImageModal isOpen={true} onClose={() => setEditingImageFor(null)} currentImage={variations.find(v => v.id === editingImageFor)?.image} productImages={productImages} onSave={(img) => {
                updateVariation(editingImageFor, 'image', img);
            }}/>)}
    </div>);
};

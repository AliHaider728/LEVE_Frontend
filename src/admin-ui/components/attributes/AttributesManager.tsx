"use client";
import React from 'react';
import { Plus, Trash2, GripVertical, Settings } from 'lucide-react';
import { ProductAttribute } from '../../types';
import { useAdminUI } from '../../context/AdminUIContext';
interface AttributesManagerProps {
    attributes: ProductAttribute[];
    onChange: (attributes: ProductAttribute[]) => void;
    globalAttributesList?: any[];
}
export const AttributesManager: React.FC<AttributesManagerProps> = ({ attributes, onChange, globalAttributesList }) => {
    const { globalAttributes: storedAttributes } = useAdminUI();
    const globalAttributes = globalAttributesList || storedAttributes;
    const handleAddCustomAttribute = () => {
        onChange([
            ...attributes,
            {
                source: 'custom',
                id: `attr-${Date.now()}`,
                name: '',
                slug: '',
                displayType: 'buttons',
                terms: [],
                selectedTermIds: [],
                visible: true,
                usedForVariations: true,
                position: attributes.length
            }
        ]);
    };
    const handleAddGlobalAttribute = (globalAttrId: string) => {
        if (!globalAttrId)
            return;
        if (attributes.some(a => a.globalAttributeId === globalAttrId))
            return;
        const globalAttr = globalAttributes.find(g => g.id === globalAttrId);
        if (!globalAttr)
            return;
        onChange([
            ...attributes,
            {
                source: 'global',
                globalAttributeId: globalAttr.id,
                id: `attr-${Date.now()}`,
                name: globalAttr.name,
                slug: globalAttr.slug,
                displayType: globalAttr.displayType,
                terms: globalAttr.terms,
                selectedTermIds: [],
                visible: true,
                usedForVariations: true,
                position: attributes.length
            }
        ]);
    };
    const handleRemoveAttribute = (id: string) => {
        onChange(attributes.filter(a => a.id !== id));
    };
    const handleAttributeChange = (id: string, field: keyof ProductAttribute, value: any) => {
        onChange(attributes.map(a => {
            if (a.id !== id)
                return a;
            const updated = { ...a, [field]: value };
            if (field === 'name' && a.source === 'custom') {
                updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            }
            return updated;
        }));
    };
    const addCustomTerm = (attrId: string, label: string) => {
        label = label.trim();
        if (!label)
            return;
        onChange(attributes.map(a => {
            if (a.id !== attrId || a.source !== 'custom')
                return a;
            const terms = a.terms || [];
            if (terms.some(t => t.label.toLowerCase() === label.toLowerCase())) {
                return a;
            }
            return {
                ...a,
                terms: [
                    ...terms,
                    {
                        id: `term-${Date.now()}`,
                        label,
                        slug: label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                        value: label,
                        position: terms.length
                    }
                ]
            };
        }));
    };
    const removeCustomTerm = (attrId: string, termId: string) => {
        onChange(attributes.map(a => {
            if (a.id !== attrId || a.source !== 'custom')
                return a;
            return {
                ...a,
                terms: a.terms.filter(t => t.id !== termId)
            };
        }));
    };
    const toggleGlobalTermSelection = (attrId: string, termId: string) => {
        onChange(attributes.map(a => {
            if (a.id !== attrId || a.source !== 'global')
                return a;
            const selected = new Set(a.selectedTermIds || []);
            if (selected.has(termId))
                selected.delete(termId);
            else
                selected.add(termId);
            return {
                ...a,
                selectedTermIds: Array.from(selected)
            };
        }));
    };
    return (<div className="space-y-4">
      {/* Top action row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFF4F6] p-3 rounded-2xl border border-[#ecdfe4]">
        <div className="flex items-center gap-2">
          <select defaultValue="" onChange={(e) => {
            handleAddGlobalAttribute(e.target.value);
            e.target.value = '';
        }} className="text-xs bg-white border border-[#ecdfe4] rounded-xl px-3 py-1.5 focus:outline-none">
            <option value="" disabled>Add Global Attribute...</option>
            {globalAttributes.map(g => (<option key={g.id} value={g.id} disabled={attributes.some(a => a.globalAttributeId === g.id)}>
                {g.name}
              </option>))}
          </select>
          <button type="button" onClick={handleAddCustomAttribute} className="flex items-center gap-1.5 text-xs font-bold bg-white text-[#382b31] border border-[#ecdfe4] px-3 py-1.5 rounded-xl hover:bg-[#FFF4F6] transition-colors">
            <Plus className="w-3.5 h-3.5"/>
            Add Custom
          </button>
        </div>

        <span className="text-[11px] text-[#382b31]/50 flex items-center gap-1 font-medium">
          <Settings className="w-3.5 h-3.5"/>
          Global attributes can be reused across products
        </span>
      </div>

      {/* Attributes List */}
      <div className="space-y-3">
        {attributes.map((attr, _idx) => (<div key={attr.id} className="bg-white p-4 rounded-2xl border border-[#ecdfe4] space-y-4 shadow-xs">
            <div className="flex items-center justify-between gap-2 border-b border-[#ecdfe4]/60 pb-3">
              <div className="flex items-center gap-2 flex-1">
                <GripVertical className="w-4 h-4 text-[#382b31]/30 cursor-grab"/>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFF4F6] text-[#673742] border border-[#ecdfe4]">
                  {attr.source}
                </span>

                {attr.source === 'custom' ? (<input type="text" value={attr.name} placeholder="Attribute Name (e.g. Size, Skin Type)" onChange={(e) => handleAttributeChange(attr.id, 'name', e.target.value)} className="font-bold text-xs bg-transparent border-b border-dashed border-[#ecdfe4] focus:border-[#673742] px-1 py-0.5 outline-none flex-1 max-w-xs"/>) : (<span className="font-bold text-xs text-[#382b31]">{attr.name}</span>)}
              </div>

              <div className="flex items-center gap-3">
                <select value={attr.displayType} onChange={(e) => handleAttributeChange(attr.id, 'displayType', e.target.value)} className="text-[11px] bg-[#FFF4F6] border border-[#ecdfe4] rounded-lg px-2 py-1">
                  <option value="buttons">Buttons</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="radio">Radio</option>
                  <option value="color_swatches">Color Swatches</option>
                  <option value="image_swatches">Image Swatches</option>
                </select>

                <button type="button" onClick={() => handleRemoveAttribute(attr.id)} className="text-red-500 hover:text-red-700 p-1" title="Remove attribute">
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            </div>

            {/* Terms Area */}
            <div>
              <span className="text-[11px] font-bold text-[#382b31]/60 block mb-2">Attribute Values / Terms</span>
              {attr.source === 'custom' ? (<div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {attr.terms?.map(term => (<span key={term.id} className="inline-flex items-center gap-1.5 bg-[#FFF4F6] border border-[#ecdfe4] text-xs font-medium px-2.5 py-1 rounded-xl">
                        {term.label}
                        <button type="button" onClick={() => removeCustomTerm(attr.id, term.id)} className="text-[#382b31]/40 hover:text-red-500">
                          &times;
                        </button>
                      </span>))}
                  </div>

                  <input type="text" placeholder="Type value and press Enter..." onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomTerm(attr.id, e.currentTarget.value);
                        e.currentTarget.value = '';
                    }
                }} className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#673742]"/>
                </div>) : (<div className="flex flex-wrap gap-1.5">
                  {attr.terms?.map(term => {
                    const isSelected = attr.selectedTermIds?.includes(term.id);
                    return (<button key={term.id} type="button" onClick={() => toggleGlobalTermSelection(attr.id, term.id)} className={`text-xs px-2.5 py-1 rounded-xl border transition-colors ${isSelected
                            ? 'bg-[#673742] text-white border-[#673742]'
                            : 'bg-[#FFF4F6] text-[#382b31]/70 border-[#ecdfe4] hover:bg-white'}`}>
                        {term.label}
                      </button>);
                })}
                </div>)}
            </div>

            {/* Checkboxes row */}
            <div className="flex items-center gap-4 text-xs font-semibold text-[#382b31]/70 pt-2 border-t border-[#ecdfe4]/40">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={attr.visible} onChange={(e) => handleAttributeChange(attr.id, 'visible', e.target.checked)} className="rounded text-[#673742] focus:ring-[#673742]"/>
                Visible on product page
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={attr.usedForVariations} onChange={(e) => handleAttributeChange(attr.id, 'usedForVariations', e.target.checked)} className="rounded text-[#673742] focus:ring-[#673742]"/>
                Used for variations
              </label>
            </div>
          </div>))}

        {attributes.length === 0 && (<div className="p-8 text-center text-xs text-[#382b31]/40 border border-dashed border-[#ecdfe4] rounded-2xl">
            No attributes added yet. Add a global or custom attribute to generate product variations.
          </div>)}
      </div>
    </div>);
};

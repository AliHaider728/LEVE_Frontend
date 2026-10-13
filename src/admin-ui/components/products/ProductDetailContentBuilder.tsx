"use client";
import { uploadImage as uploadAdminAsset } from '@/admin-ui/api';
import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Copy, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { ProductDetailBlock, ProductDetailBlockType } from '../../types';
import { getSafeImageSrc } from '../../utils/images';
type Props = {
    blocks: ProductDetailBlock[];
    customCss?: string;
    isSuperAdmin?: boolean;
    onBlocksChange: (blocks: ProductDetailBlock[]) => void;
    onCustomCssChange?: (css: string) => void;
};
const newId = () => `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const ordered = (blocks: ProductDetailBlock[]) => blocks.map((block, order) => ({ ...block, order }));
const createBlock = (type: ProductDetailBlockType): ProductDetailBlock => ({
    id: newId(),
    type,
    enabled: true,
    order: 0,
    ...(type === 'richText' ? { heading: '', content: '<p>Add your rich product description here.</p>' } : {}),
    ...(type === 'html' ? { content: '<section class="product-highlight"><h2>Product highlight</h2><p>Custom HTML section.</p></section>' } : {}),
    settings: { width: 'full', alignment: 'center' }
});
export const ProductDetailContentBuilder: React.FC<Props> = ({ blocks, customCss = '', isSuperAdmin = true, onBlocksChange, onCustomCssChange = () => { } }) => {
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
    const [selectedBlockType, setSelectedBlockType] = useState<ProductDetailBlockType>('richText');
    const sorted = useMemo(() => [...blocks].sort((a, b) => a.order - b.order), [blocks]);
    const update = (id: string, changes: Partial<ProductDetailBlock>) => onBlocksChange(ordered(sorted.map(block => block.id === id ? { ...block, ...changes } : block)));
    const add = (type: ProductDetailBlockType) => {
        onBlocksChange(ordered([...sorted, createBlock(type)]));
    };
    const move = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= sorted.length)
            return;
        const next = [...sorted];
        [next[index], next[target]] = [next[target], next[index]];
        onBlocksChange(ordered(next));
    };
    const duplicate = (block: ProductDetailBlock) => {
        const index = sorted.findIndex(item => item.id === block.id);
        const next = [...sorted];
        next.splice(index + 1, 0, { ...block, id: newId() });
        onBlocksChange(ordered(next));
    };
    const remove = (blockId: string) => {
        onBlocksChange(ordered(sorted.filter(item => item.id !== blockId)));
    };
    const uploadLocal = async (blockId: string, file?: File) => {
        try {
            if (!file)
                return;
            const url = await uploadAdminAsset(file);
            update(blockId, {
                image: {
                    secureUrl: url,
                    publicId: `detail-${Date.now()}`,
                    alt: file.name
                }
            });
        }
        catch {
        }
    };
    return (<section className="rounded-3xl border border-[#ecdfe4] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="font-heading text-base font-black text-[#382b31]">Product Description & Page Content</h2>
        <p className="mt-1 text-xs text-[#382b31]/50">Build responsive content below the main product information.</p>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <select value={selectedBlockType} onChange={e => setSelectedBlockType(e.target.value as ProductDetailBlockType)} className="rounded-xl border border-[#ecdfe4] bg-white px-3 py-2 text-sm text-[#382b31] outline-none">
          <option value="heading">Heading</option>
          <option value="richText">Rich Text</option>
          <option value="image">Image</option>
          <option value="imageText">Image + Text</option>
          <option value="fullWidthImage">Full-width Image</option>
          <option value="gallery">Gallery</option>
          <option value="featureCards">Feature Cards</option>
          <option value="iconText">Icon + Text</option>
          <option value="benefitsList">Benefits List</option>
          <option value="whatsIncluded">What&apos;s Included</option>
          <option value="recommendedAge">Recommended Age</option>
          <option value="giftBadges">Gift Badges</option>
          <option value="divider">Divider</option>
          <option value="spacer">Spacer</option>
          <option value="ctaBanner">CTA Banner</option>
          {isSuperAdmin && <option value="html">Custom HTML</option>}
        </select>
        <button type="button" onClick={() => add(selectedBlockType)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#673742] to-[#673742] hover:from-[#673742] hover:to-[#673742] text-white px-3 py-2 text-xs font-bold shadow-sm">
          <Plus className="h-4 w-4"/> Add Block
        </button>
      </div>

      <div className="space-y-3">
        {sorted.map((block, index) => {
            const isCollapsed = collapsed.has(block.id);
            return (<article key={block.id} className="overflow-hidden rounded-2xl border border-[#ecdfe4] bg-[#FFF4F6]">
              <div className="flex flex-wrap items-center gap-2 border-b border-[#ecdfe4] bg-white p-3">
                <span className="rounded-lg bg-[#FFF4F6] px-2.5 py-1 text-[10px] font-black uppercase text-[#673742] border border-[#ecdfe4]">
                  {block.type}
                </span>
                <label className="mr-auto flex items-center gap-2 text-xs font-bold text-[#382b31]/70 cursor-pointer">
                  <input type="checkbox" checked={block.enabled} onChange={e => update(block.id, { enabled: e.target.checked })} className="rounded text-[#673742]"/>
                  Enabled
                </label>
                <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="rounded-xl border border-[#ecdfe4] p-1.5 text-[#382b31]/50 hover:bg-[#FFF4F6] disabled:opacity-30" title="Move Up">
                  <ArrowUp className="h-3.5 w-3.5"/>
                </button>
                <button type="button" disabled={index === sorted.length - 1} onClick={() => move(index, 1)} className="rounded-xl border border-[#ecdfe4] p-1.5 text-[#382b31]/50 hover:bg-[#FFF4F6] disabled:opacity-30" title="Move Down">
                  <ArrowDown className="h-3.5 w-3.5"/>
                </button>
                <button type="button" onClick={() => duplicate(block)} className="rounded-xl border border-[#ecdfe4] p-1.5 text-[#382b31]/50 hover:bg-[#FFF4F6]" title="Duplicate">
                  <Copy className="h-3.5 w-3.5"/>
                </button>
                <button type="button" onClick={() => remove(block.id)} className="rounded-xl border border-[#ecdfe4] p-1.5 text-red-500 hover:bg-red-50" title="Delete Block">
                  <Trash2 className="h-3.5 w-3.5"/>
                </button>
                <button type="button" onClick={() => setCollapsed(cur => {
                    const next = new Set(cur);
                    if (isCollapsed)
                        next.delete(block.id);
                    else
                        next.add(block.id);
                    return next;
                })} className="rounded-xl border border-[#ecdfe4] p-1.5 text-[#382b31]/50 hover:bg-[#FFF4F6]" title={isCollapsed ? 'Expand' : 'Collapse'}>
                  {isCollapsed ? <ChevronDown className="h-3.5 w-3.5"/> : <ChevronUp className="h-3.5 w-3.5"/>}
                </button>
              </div>

              {!isCollapsed && (<div className="space-y-4 p-4">
                  {block.type === 'richText' && (<>
                      <label className="block text-xs font-bold text-[#382b31]/70">
                        Optional heading
                        <input maxLength={140} value={block.heading || ''} onChange={e => update(block.id, { heading: e.target.value })} className="mt-1 w-full rounded-xl border border-[#ecdfe4] bg-white px-3 py-2 text-sm"/>
                      </label>
                      <textarea rows={4} value={block.content || ''} onChange={e => update(block.id, { content: e.target.value })} className="w-full rounded-xl border border-[#ecdfe4] bg-white p-3 text-sm leading-6 outline-none" placeholder="Type rich paragraph content..."/>
                    </>)}

                  {['heading', 'featureCards', 'iconText', 'benefitsList', 'whatsIncluded', 'recommendedAge', 'giftBadges', 'spacer', 'ctaBanner', 'imageText', 'fullWidthImage', 'gallery'].includes(block.type) && (<>
                      <label className="block text-xs font-bold text-[#382b31]/70">
                        Heading
                        <input maxLength={140} value={block.heading || ''} onChange={e => update(block.id, { heading: e.target.value })} className="mt-1 w-full rounded-xl border border-[#ecdfe4] bg-white px-3 py-2 text-sm" placeholder="Block heading"/>
                      </label>
                      <label className="block text-xs font-bold text-[#382b31]/70 mt-3">
                        Content (optional)
                        <textarea rows={3} maxLength={2000} value={block.content || ''} onChange={e => update(block.id, { content: e.target.value })} className="mt-1 w-full rounded-xl border border-[#ecdfe4] bg-white px-3 py-2 text-sm" placeholder="Block text content"/>
                      </label>
                    </>)}

                  {['image', 'imageText', 'fullWidthImage', 'gallery', 'ctaBanner'].includes(block.type) && (<>
                      {block.image?.secureUrl && (<img src={getSafeImageSrc(block.image.secureUrl)} alt={block.image.alt || 'Product detail preview'} className="max-h-72 w-full rounded-xl bg-white object-contain border border-[#ecdfe4]"/>)}
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#673742] bg-white px-4 py-3 text-xs font-bold text-[#673742] mt-3 hover:bg-[#FFF4F6]">
                        <ImagePlus className="h-4 w-4"/>
                        {block.image ? 'Replace image' : 'Upload primary media'}
                        <input type="file" className="hidden" accept="image/*" onChange={e => {
                            uploadLocal(block.id, e.target.files?.[0]);
                            e.target.value = '';
                        }}/>
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2 mt-3">
                        <label className="text-xs font-bold text-[#382b31]/70">
                          Alt text *
                          <input maxLength={180} value={block.image?.alt || ''} onChange={e => block.image && update(block.id, { image: { ...block.image, alt: e.target.value } })} className="mt-1 w-full rounded-xl border border-[#ecdfe4] bg-white px-3 py-2 text-sm"/>
                        </label>
                        <label className="text-xs font-bold text-[#382b31]/70">
                          Caption
                          <input maxLength={300} value={block.image?.caption || ''} onChange={e => block.image && update(block.id, { image: { ...block.image, caption: e.target.value } })} className="mt-1 w-full rounded-xl border border-[#ecdfe4] bg-white px-3 py-2 text-sm"/>
                        </label>
                      </div>
                    </>)}

                  {block.type === 'html' && (<div>
                      <label className="block text-xs font-bold text-[#382b31]/70">
                        Custom HTML
                        <textarea rows={6} spellCheck={false} value={block.content || ''} onChange={e => update(block.id, { content: e.target.value })} className="mt-1 w-full rounded-xl border border-[#ecdfe4] bg-slate-950 p-3 font-mono text-xs text-[#673742]"/>
                      </label>
                    </div>)}

                  {block.type === 'divider' && (<div className="py-4">
                      <hr className="border-[#ecdfe4]"/>
                    </div>)}

                  {block.type !== 'divider' && (<div className="grid gap-3 sm:grid-cols-2">
                      <label className="text-xs font-bold text-[#382b31]/70">
                        Width
                        <select value={block.settings?.width || 'full'} onChange={e => update(block.id, { settings: { ...block.settings, width: e.target.value as any } })} className="mt-1 w-full rounded-xl border border-[#ecdfe4] bg-white px-3 py-2 text-sm">
                          <option value="full">Full</option>
                          <option value="large">Large</option>
                          <option value="medium">Medium</option>
                        </select>
                      </label>
                      <label className="text-xs font-bold text-[#382b31]/70">
                        Alignment
                        <select value={block.settings?.alignment || 'center'} onChange={e => update(block.id, { settings: { ...block.settings, alignment: e.target.value as any } })} className="mt-1 w-full rounded-xl border border-[#ecdfe4] bg-white px-3 py-2 text-sm">
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </label>
                    </div>)}
                </div>)}
            </article>);
        })}

        {sorted.length === 0 && (<div className="rounded-2xl border border-dashed border-[#ecdfe4] p-8 text-center text-xs font-medium text-[#382b31]/40">
            No custom product-page blocks yet. Click &ldquo;Add Block&rdquo; to build interactive PDP sections.
          </div>)}
      </div>

      {isSuperAdmin && (<div className="mt-6 rounded-2xl border border-[#ecdfe4] bg-[#FFF4F6] p-4">
          <label className="text-xs font-black text-[#382b31]">
            Scoped custom CSS
            <textarea rows={4} spellCheck={false} value={customCss} onChange={e => onCustomCssChange(e.target.value)} placeholder=".product-highlight { background: #fff7ed; padding: 2rem; }" className="mt-2 w-full rounded-xl border border-[#ecdfe4] bg-slate-950 p-3 font-mono text-xs text-[#673742]"/>
          </label>
        </div>)}
    </section>);
};

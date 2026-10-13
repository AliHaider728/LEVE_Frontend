"use client";
import { uploadImage as uploadAdminAsset } from '@/admin-ui/api';
import React, { useState } from 'react';
import { Plus, Trash2, Edit2, GripVertical, X } from 'lucide-react';
import { useAdminUI } from '../context/AdminUIContext';
import { GlobalAttribute, GlobalAttributeTerm } from '../types';
import { getSafeImageSrc } from '../utils/images';
export const GlobalAttributesPage: React.FC = () => {
    const { globalAttributes, addGlobalAttribute, updateGlobalAttribute, deleteGlobalAttribute, showToast, confirm } = useAdminUI();
    const [selectedAttrId, setSelectedAttrId] = useState<string>(globalAttributes[0]?.id || '');
    const [isEditingAttrModal, setIsEditingAttrModal] = useState<GlobalAttribute | null | 'new'>(null);
    const [editingTerm, setEditingTerm] = useState<{
        attrId: string;
        term?: GlobalAttributeTerm;
    } | null>(null);
    const activeAttr = globalAttributes.find(a => a.id === selectedAttrId) || globalAttributes[0];
    // Attribute Form state
    const [attrName, setAttrName] = useState('');
    const [attrSlug, setAttrSlug] = useState('');
    const [attrDisplayType, setAttrDisplayType] = useState<GlobalAttribute['displayType']>('buttons');
    // Term Form state
    const [termLabel, setTermLabel] = useState('');
    const [termSlug, setTermSlug] = useState('');
    const [termValue, setTermValue] = useState('');
    const [termColor, setTermColor] = useState('#673742');
    const [termImage, setTermImage] = useState('');
    const openAttrModal = (attr?: GlobalAttribute) => {
        if (attr) {
            setAttrName(attr.name);
            setAttrSlug(attr.slug);
            setAttrDisplayType(attr.displayType);
            setIsEditingAttrModal(attr);
        }
        else {
            setAttrName('');
            setAttrSlug('');
            setAttrDisplayType('buttons');
            setIsEditingAttrModal('new');
        }
    };
    const saveAttrModal = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            if (!attrName.trim())
                return;
            if (isEditingAttrModal === 'new') {
                const created = await addGlobalAttribute({
                    name: attrName.trim(),
                    slug: attrSlug.trim() || attrName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    displayType: attrDisplayType,
                    terms: []
                });
                setSelectedAttrId(created.id);
            }
            else if (isEditingAttrModal) {
                await updateGlobalAttribute(isEditingAttrModal.id, {
                    name: attrName.trim(),
                    slug: attrSlug.trim() || attrName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    displayType: attrDisplayType
                });
            }
            setIsEditingAttrModal(null);
        }
        catch {
        }
    };
    const openTermModal = (term?: GlobalAttributeTerm) => {
        if (!activeAttr)
            return;
        if (term) {
            setTermLabel(term.label);
            setTermSlug(term.slug);
            setTermValue(term.value);
            setTermColor(term.colorValue || '#673742');
            setTermImage(term.imageUrl || '');
            setEditingTerm({ attrId: activeAttr.id, term });
        }
        else {
            setTermLabel('');
            setTermSlug('');
            setTermValue('');
            setTermColor('#673742');
            setTermImage('');
            setEditingTerm({ attrId: activeAttr.id });
        }
    };
    const saveTermModal = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            if (!termLabel.trim() || !activeAttr)
                return;
            const termPayload: GlobalAttributeTerm = {
                id: editingTerm?.term?.id || `term-${Date.now()}`,
                label: termLabel.trim(),
                slug: termSlug.trim() || termLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                value: termValue.trim() || termLabel.trim(),
                colorValue: activeAttr.displayType === 'color_swatches' ? termColor : undefined,
                imageUrl: activeAttr.displayType === 'image_swatches' ? termImage : undefined,
                position: editingTerm?.term?.position || activeAttr.terms.length + 1
            };
            let nextTerms = [...activeAttr.terms];
            if (editingTerm?.term) {
                nextTerms = nextTerms.map(t => t.id === editingTerm.term?.id ? termPayload : t);
            }
            else {
                nextTerms.push(termPayload);
            }
            await updateGlobalAttribute(activeAttr.id, { terms: nextTerms });
            setEditingTerm(null);
        }
        catch {
        }
    };
    const deleteTerm = async (termId: string) => {
        try {
            if (!activeAttr)
                return;
            const nextTerms = activeAttr.terms.filter(t => t.id !== termId);
            await updateGlobalAttribute(activeAttr.id, { terms: nextTerms });
            showToast('Attribute value removed', 'info');
        }
        catch {
        }
    };
    const handleDeleteAttribute = async (attr: GlobalAttribute) => {
        try {
            const isConfirmed = await confirm({
                title: 'Delete Global Attribute?',
                description: `"${attr.name}" and all its terms will be deleted.`,
                cancelLabel: 'Cancel',
                confirmLabel: 'Delete Attribute',
                destructive: true
            });
            if (isConfirmed) {
                await deleteGlobalAttribute(attr.id);
                if (selectedAttrId === attr.id) {
                    setSelectedAttrId(globalAttributes.find(a => a.id !== attr.id)?.id || '');
                }
            }
        }
        catch {
        }
    };
    return (<div className="space-y-6 font-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-[#382b31]">Global Attributes</h1>
          <p className="text-xs text-[#382b31]/50 font-medium">Manage reusable product variation attributes, swatches, and sizes.</p>
        </div>
        <button type="button" onClick={() => openAttrModal()} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#673742] to-[#673742] hover:from-[#673742] hover:to-[#673742] text-white px-5 py-2.5 text-xs font-bold shadow-sm">
          <Plus className="w-4 h-4"/> Add Attribute
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Attributes list */}
        <div className="space-y-3">
          <h3 className="font-heading font-black text-sm text-[#382b31] uppercase tracking-wider">
            Attribute Groups ({globalAttributes.length})
          </h3>

          <div className="space-y-2">
            {globalAttributes.map(attr => {
            const isSelected = activeAttr?.id === attr.id;
            return (<div key={attr.id} onClick={() => setSelectedAttrId(attr.id)} className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${isSelected
                    ? 'bg-white border-[#673742] shadow-sm ring-1 ring-[#673742]/20'
                    : 'bg-white border-[#ecdfe4] hover:bg-[#FFF4F6]'}`}>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-[#382b31]">{attr.name}</h4>
                    <p className="text-[11px] text-[#382b31]/40 font-mono">/{attr.slug}</p>
                    <span className="inline-block mt-2 text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-[#FFF4F6] text-[#673742] border border-[#ecdfe4]">
                      {attr.displayType.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button type="button" onClick={() => openAttrModal(attr)} className="p-1.5 text-[#382b31]/50 hover:text-[#673742]" title="Edit Attribute">
                      <Edit2 className="w-4 h-4"/>
                    </button>
                    <button type="button" onClick={() => handleDeleteAttribute(attr)} className="p-1.5 text-red-500 hover:text-red-700" title="Delete Attribute">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                </div>);
        })}
          </div>
        </div>

        {/* Right Column (2 Cols): Selected Attribute Terms */}
        <div className="lg:col-span-2 space-y-4">
          {activeAttr ? (<div className="bg-white p-6 rounded-3xl border border-[#ecdfe4] shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ecdfe4] pb-4">
                <div>
                  <h3 className="font-heading font-black text-lg text-[#382b31]">
                    Values for &ldquo;{activeAttr.name}&rdquo;
                  </h3>
                  <p className="text-xs text-[#382b31]/50 mt-0.5">
                    Configure terms, swatches, and labels available for variations.
                  </p>
                </div>
                <button type="button" onClick={() => openTermModal()} className="flex items-center gap-1.5 px-4 py-2 bg-[#673742] text-white rounded-xl text-xs font-bold hover:bg-[#673742] transition-colors">
                  <Plus className="w-3.5 h-3.5"/> Add Term Value
                </button>
              </div>

              <div className="space-y-2">
                {activeAttr.terms.map(term => (<div key={term.id} className="flex items-center justify-between gap-4 bg-[#FFF4F6]/70 p-3.5 rounded-2xl border border-[#ecdfe4]">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-[#382b31]/30"/>
                      {activeAttr.displayType === 'color_swatches' && term.colorValue && (<div className="w-7 h-7 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: term.colorValue }}/>)}
                      {activeAttr.displayType === 'image_swatches' && term.imageUrl && (<img src={getSafeImageSrc(term.imageUrl)} alt={term.label} className="w-7 h-7 rounded-lg object-cover border border-[#ecdfe4]"/>)}
                      <div>
                        <span className="font-bold text-xs text-[#382b31] block">{term.label}</span>
                        <span className="text-[10px] text-[#382b31]/40 font-mono">slug: {term.slug} | value: {term.value}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => openTermModal(term)} className="p-1.5 text-[#382b31]/50 hover:text-[#673742]">
                        <Edit2 className="w-4 h-4"/>
                      </button>
                      <button type="button" onClick={() => deleteTerm(term.id)} className="p-1.5 text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>))}

                {activeAttr.terms.length === 0 && (<div className="p-8 text-center text-xs text-[#382b31]/40 border border-dashed border-[#ecdfe4] rounded-2xl">
                    No values added yet for this attribute. Click &ldquo;Add Term Value&rdquo; above.
                  </div>)}
              </div>
            </div>) : (<div className="bg-white p-12 rounded-3xl border border-[#ecdfe4] text-center text-xs text-[#382b31]/40">
              Select or create an attribute group to view its terms.
            </div>)}
        </div>
      </div>

      {/* Attribute Edit / Create Modal */}
      {isEditingAttrModal && (<div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#ecdfe4] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ecdfe4] pb-3 mb-4">
              <h3 className="font-heading font-black text-base text-[#382b31]">
                {isEditingAttrModal === 'new' ? 'New Global Attribute' : 'Edit Attribute'}
              </h3>
              <button type="button" onClick={() => setIsEditingAttrModal(null)} className="text-[#382b31]/40 hover:text-[#382b31]">
                <X className="w-5 h-5"/>
              </button>
            </div>

            <form onSubmit={saveAttrModal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Name *</label>
                <input type="text" required value={attrName} onChange={e => {
                setAttrName(e.target.value);
                if (isEditingAttrModal === 'new')
                    setAttrSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
            }} placeholder="e.g. Volume / Size" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 outline-none"/>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Slug</label>
                <input type="text" value={attrSlug} onChange={e => setAttrSlug(e.target.value)} placeholder="e.g. size" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 outline-none font-mono"/>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Display Type</label>
                <select value={attrDisplayType} onChange={e => setAttrDisplayType(e.target.value as any)} className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 outline-none bg-white">
                  <option value="buttons">Pill Buttons</option>
                  <option value="dropdown">Dropdown Select</option>
                  <option value="radio">Radio Options</option>
                  <option value="color_swatches">Color Swatches</option>
                  <option value="image_swatches">Image Swatches</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#ecdfe4]">
                <button type="button" onClick={() => setIsEditingAttrModal(null)} className="px-4 py-2 text-xs font-bold text-[#382b31]/60 hover:bg-slate-100 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-[#673742] hover:bg-[#673742] rounded-xl shadow-sm">
                  Save Attribute
                </button>
              </div>
            </form>
          </div>
        </div>)}

      {/* Term Edit / Create Modal */}
      {editingTerm && (<div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#ecdfe4] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ecdfe4] pb-3 mb-4">
              <h3 className="font-heading font-black text-base text-[#382b31]">
                {editingTerm.term ? 'Edit Value Term' : 'Add Term Value'}
              </h3>
              <button type="button" onClick={() => setEditingTerm(null)} className="text-[#382b31]/40 hover:text-[#382b31]">
                <X className="w-5 h-5"/>
              </button>
            </div>

            <form onSubmit={saveTermModal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Display Label *</label>
                <input type="text" required value={termLabel} onChange={e => {
                setTermLabel(e.target.value);
                if (!editingTerm.term) {
                    setTermSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    setTermValue(e.target.value);
                }
            }} placeholder="e.g. 30 ml (Standard)" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 outline-none"/>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Slug</label>
                <input type="text" value={termSlug} onChange={e => setTermSlug(e.target.value)} placeholder="e.g. 30ml" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 outline-none font-mono"/>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Value String</label>
                <input type="text" value={termValue} onChange={e => setTermValue(e.target.value)} placeholder="e.g. 30ml" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 outline-none"/>
              </div>

              {activeAttr?.displayType === 'color_swatches' && (<div>
                  <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Color Swatch</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={termColor} onChange={e => setTermColor(e.target.value)} className="w-10 h-10 p-0 border border-[#ecdfe4] rounded-xl cursor-pointer"/>
                    <input type="text" value={termColor} onChange={e => setTermColor(e.target.value)} className="text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 font-mono flex-1"/>
                  </div>
                </div>)}

              {activeAttr?.displayType === 'image_swatches' && (<div>
                  <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Image Swatch</label>
                  <input type="file" accept="image/*" onChange={async (e) => {
                    try {
                        if (e.target.files?.[0])
                            setTermImage(await uploadAdminAsset(e.target.files[0]));
                    }
                    catch {
                    }
                }} className="text-xs"/>
                  {termImage && (<img src={getSafeImageSrc(termImage)} alt="Swatch" className="w-12 h-12 object-cover rounded-xl mt-2 border"/>)}
                </div>)}

              <div className="flex justify-end gap-2 pt-2 border-t border-[#ecdfe4]">
                <button type="button" onClick={() => setEditingTerm(null)} className="px-4 py-2 text-xs font-bold text-[#382b31]/60 hover:bg-slate-100 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-[#673742] hover:bg-[#673742] rounded-xl shadow-sm">
                  Save Term
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
};

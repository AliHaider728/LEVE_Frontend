"use client";
import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Copy, Home, Menu, Plus, RotateCcw, Save, ShieldAlert, Trash2 } from 'lucide-react';
import { useAdminUI } from '../context/AdminUIContext';
import { HomepageSectionSetting, NavigationLinkType, StorefrontNavigationItem } from '../types';
type Tab = 'navigation' | 'homepage';
const INTERNAL_PAGE_OPTIONS = [
    { value: '/', label: 'Home Page' },
    { value: '/shop', label: 'All Products / Shop' },
    { value: '/routine', label: 'Routine Builder' },
    { value: '/reviews', label: 'Customer Reviews' },
    { value: '/contact', label: 'Contact Us' },
    { value: '/about', label: 'About Us' }
];
const makeId = () => `nav-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const resequence = (items: StorefrontNavigationItem[]) => {
    const parents = items.filter(item => !item.parentId).map((item, index) => ({ ...item, displayOrder: index, order: index }));
    const children = parents.flatMap(parent => items.filter(item => item.parentId === parent.id).map((item, index) => ({ ...item, displayOrder: index, order: index })));
    return [...parents, ...children];
};
const createItem = (parentId: string | null = null): StorefrontNavigationItem => {
    const id = makeId();
    return {
        id,
        key: id,
        label: parentId ? 'New Child Link' : 'New Navigation Item',
        linkType: 'custom_internal_url',
        menuType: 'link',
        path: '/category/all',
        parentId,
        visible: true,
        enabled: true,
        showOnDesktop: true,
        showOnMobile: true,
        displayOrder: 999,
        order: 999,
        isSystemItem: false
    };
};
export const StoreAppearancePage: React.FC = () => {
    const { categories, navigation: contextNav, homepageSections: contextSections, updateAppearanceSettings, showToast, confirm, adminUser } = useAdminUI();
    const [tab, setTab] = useState<Tab>('navigation');
    const [navigation, setNavigation] = useState<StorefrontNavigationItem[]>(() => resequence(contextNav || []));
    const [sections, setSections] = useState<HomepageSectionSetting[]>(() => [...(contextSections || [])].sort((a, b) => a.order - b.order));
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const allowed = adminUser?.role === 'super_admin';
    const markNavigation = (next: StorefrontNavigationItem[], message?: string) => {
        setNavigation(resequence(next));
        setDirty(true);
        if (message)
            showToast(message, 'info');
    };
    const markSections = (next: HomepageSectionSetting[]) => {
        setSections(next.map((item, order) => ({ ...item, order })));
        setDirty(true);
    };
    const parents = useMemo(() => navigation.filter(item => !item.parentId).sort((a, b) => a.displayOrder - b.displayOrder), [navigation]);
    const errors = useMemo(() => {
        const messages: string[] = [];
        navigation.filter(item => !item.label.trim()).forEach(() => messages.push('Every navigation item needs a label.'));
        navigation.forEach(item => {
            if (item.linkType === 'category' && !item.categoryId)
                messages.push(`${item.label} needs a category.`);
            if (item.linkType === 'custom_internal_url' && (!item.path?.startsWith('/') || item.path.startsWith('/admin')))
                messages.push(`${item.label} needs a safe public path beginning with /.`);
            if (item.linkType === 'external_url' && !/^https:\/\//i.test(item.externalUrl || ''))
                messages.push(`${item.label} needs a valid HTTPS URL.`);
        });
        sections.filter(item => !item.heading?.trim()).forEach(item => messages.push(`${item.name} needs a heading.`));
        return messages;
    }, [navigation, sections]);
    const patchItem = (id: string, changes: Partial<StorefrontNavigationItem>) => {
        markNavigation(navigation.map(item => item.id === id ? { ...item, ...changes } : item));
    };
    const addParent = () => {
        markNavigation([...navigation, createItem()], 'Navigation item added.');
    };
    const addChild = (parent: StorefrontNavigationItem) => {
        markNavigation([...navigation, createItem(parent.id)], `Child link added to ${parent.label}.`);
    };
    const duplicate = (item: StorefrontNavigationItem) => {
        const id = makeId();
        const copy = { ...item, id, key: id, label: `${item.label} Copy`, isSystemItem: false };
        markNavigation([...navigation, copy], 'Navigation item duplicated.');
    };
    const remove = async (item: StorefrontNavigationItem) => {
        try {
            const childCount = navigation.filter(child => child.parentId === item.id).length;
            const accepted = await confirm({
                title: 'Delete this navigation item?',
                description: childCount ? `This dropdown and its ${childCount} child link(s) will be removed.` : 'This navigation item will be removed.',
                cancelLabel: 'Keep Item',
                confirmLabel: 'Delete Item',
                destructive: true
            });
            if (accepted) {
                markNavigation(navigation.filter(row => row.id !== item.id && row.parentId !== item.id), 'Navigation item removed.');
            }
        }
        catch {
        }
    };
    const changeMenuType = async (item: StorefrontNavigationItem, menuType: 'link' | 'dropdown') => {
        try {
            if (menuType === 'link') {
                const children = navigation.filter(row => row.parentId === item.id);
                if (children.length && !await confirm({
                    title: 'Convert to a direct link?',
                    description: `${children.length} child link(s) will be removed.`,
                    cancelLabel: 'Cancel',
                    confirmLabel: 'Convert and Remove Children',
                    destructive: true
                }))
                    return;
                markNavigation(navigation.filter(row => row.parentId !== item.id).map(row => row.id === item.id ? { ...row, menuType } : row));
            }
            else {
                patchItem(item.id, { menuType, path: undefined, externalUrl: undefined, categoryId: undefined });
            }
        }
        catch {
        }
    };
    const move = (item: StorefrontNavigationItem, direction: -1 | 1) => {
        const siblings = navigation.filter(row => (row.parentId || null) === (item.parentId || null)).sort((a, b) => a.displayOrder - b.displayOrder);
        const index = siblings.findIndex(row => row.id === item.id);
        const target = index + direction;
        if (target < 0 || target >= siblings.length)
            return;
        [siblings[index], siblings[target]] = [siblings[target], siblings[index]];
        const order = new Map(siblings.map((row, position) => [row.id, position]));
        markNavigation(navigation.map(row => order.has(row.id) ? { ...row, displayOrder: order.get(row.id)!, order: order.get(row.id)! } : row));
    };
    const save = async () => {
        if (errors.length) {
            showToast(errors[0], 'error');
            return;
        }
        setSaving(true);
            try {
                await updateAppearanceSettings(resequence(navigation), sections);
                setDirty(false);
                setSaving(false);
                showToast('Storefront appearance settings saved.', 'success');
            }
            catch {} finally {setSaving(false);}

    };
    const reset = async () => {
        try {
            const isConfirmed = await confirm({
                title: 'Reset appearance settings?',
                description: 'Navigation and homepage settings will return to defaults.',
                cancelLabel: 'Keep Current Settings',
                confirmLabel: 'Reset to Defaults',
                destructive: true
            });
            if (!isConfirmed)
                return;
            setSaving(true);
            setTimeout(() => {
                setNavigation(resequence(contextNav || []));
                setSections([...(contextSections || [])].sort((a, b) => a.order - b.order));
                setDirty(false);
                setSaving(false);
                showToast('Appearance reset to defaults.', 'info');
            }, 300);
        }
        catch {
        }
    };
    if (!allowed) {
        return (<div className="max-w-xl rounded-3xl border border-[#ecdfe4] bg-[#FFF4F6] p-8 font-heading">
        <ShieldAlert className="mb-3 h-8 w-8 text-[#673742]"/>
        <h1 className="font-heading text-xl font-black text-[#382b31]">Super Admin access required</h1>
        <p className="mt-2 text-sm text-[#382b31]/70">Only a Super Admin can change storefront navigation and homepage appearance.</p>
      </div>);
    }
    return (<div className="space-y-6 font-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-black text-[#382b31]">Store Appearance</h1>
          <p className="text-xs font-medium text-[#382b31]/50">Build database-driven navigation and organize homepage content.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tab === 'navigation' && (<button type="button" onClick={addParent} className="flex items-center gap-2 rounded-xl border border-[#ecdfe4] bg-[#FFF4F6] px-4 py-2.5 text-xs font-bold text-[#673742] hover:bg-[#FFF4F6]/30 cursor-pointer transition-colors">
              <Plus className="h-4 w-4"/>
              <span>Add Navigation Item</span>
            </button>)}
          <button type="button" onClick={() => void reset()} disabled={saving} className="flex items-center gap-2 rounded-xl border border-[#ecdfe4] bg-white px-4 py-2.5 text-xs font-bold text-[#382b31]/80 hover:bg-[#FFF4F6] cursor-pointer">
            <RotateCcw className="h-4 w-4"/>
            <span>Reset defaults</span>
          </button>
          <button type="button" onClick={save} disabled={saving || !dirty} className="flex items-center gap-2 rounded-xl bg-[#673742] text-white px-5 py-2.5 text-xs font-bold hover:bg-[#673742] disabled:opacity-50 transition-colors shadow-md cursor-pointer">
            <Save className="h-4 w-4"/>
            <span>{saving ? 'Saving…' : 'Save appearance'}</span>
          </button>
        </div>
      </div>

      <div className="flex w-fit rounded-2xl bg-slate-200/70 p-1">
        {(['navigation', 'homepage'] as Tab[]).map(value => (<button key={value} type="button" onClick={() => setTab(value)} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer transition-colors ${tab === value ? 'bg-white shadow-xs text-[#382b31]' : 'text-[#382b31]/50 hover:text-[#382b31]'}`}>
            {value === 'navigation' ? <Menu className="h-4 w-4"/> : <Home className="h-4 w-4"/>}
            <span>{value === 'navigation' ? 'Navigation' : 'Homepage'}</span>
          </button>))}
      </div>

      {tab === 'navigation' ? (<div className="space-y-4">
          {parents.map(parent => (<div key={parent.id} className="rounded-3xl border border-[#ecdfe4] bg-white p-4 shadow-xs sm:p-5">
              <NavigationEditor item={parent} categories={categories} siblings={parents} patchItem={patchItem} move={move} changeMenuType={changeMenuType} duplicate={duplicate} remove={remove}/>
              {parent.menuType === 'dropdown' && (<div className="mt-4 space-y-3 border-l-2 border-[#ecdfe4] pl-3 sm:pl-6">
                  {navigation
                        .filter(child => child.parentId === parent.id)
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map(child => (<div key={child.id} className="rounded-2xl border border-[#ecdfe4] bg-[#FFF4F6] p-4">
                        <NavigationEditor item={child} categories={categories} siblings={navigation.filter(row => row.parentId === parent.id)} patchItem={patchItem} move={move} duplicate={duplicate} remove={remove}/>
                      </div>))}
                  <button type="button" onClick={() => addChild(parent)} className="flex items-center gap-2 rounded-xl border border-dashed border-[#673742] px-4 py-2.5 text-xs font-bold text-[#673742] hover:bg-[#FFF4F6]/20 cursor-pointer">
                    <Plus className="h-4 w-4"/>
                    <span>Add Child Link</span>
                  </button>
                </div>)}
            </div>))}
        </div>) : (<div className="space-y-3">
          {sections.map((section, index) => (<div key={section.key} className="rounded-2xl border border-[#ecdfe4] bg-white p-5 shadow-xs">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="flex gap-1">
                  <button type="button" disabled={index === 0} onClick={() => {
                    const next = [...sections];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    markSections(next);
                }} className="rounded-lg border border-[#ecdfe4] p-2 disabled:opacity-30 cursor-pointer">
                    <ArrowUp className="h-3.5 w-3.5"/>
                  </button>
                  <button type="button" disabled={index === sections.length - 1} onClick={() => {
                    const next = [...sections];
                    [next[index + 1], next[index]] = [next[index], next[index + 1]];
                    markSections(next);
                }} className="rounded-lg border border-[#ecdfe4] p-2 disabled:opacity-30 cursor-pointer">
                    <ArrowDown className="h-3.5 w-3.5"/>
                  </button>
                </div>
                <h2 className="mr-auto font-heading text-sm font-black text-[#382b31]">{section.name}</h2>
                <label className="flex items-center gap-2 text-xs font-bold text-[#382b31] cursor-pointer">
                  <input type="checkbox" checked={section.enabled} onChange={e => markSections(sections.map(row => row.key === section.key ? { ...row, enabled: e.target.checked } : row))} className="h-4 w-4 accent-[#673742]"/>
                  <span>Enabled</span>
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <AppearanceField label="Heading" value={section.heading || ''} maxLength={120} onChange={value => markSections(sections.map(row => row.key === section.key ? { ...row, heading: value } : row))}/>
                <AppearanceField label="Subheading" value={section.subheading || ''} maxLength={320} onChange={value => markSections(sections.map(row => row.key === section.key ? { ...row, subheading: value } : row))}/>
                {section.ctaLabel !== undefined && (<AppearanceField label="Button label" value={section.ctaLabel} maxLength={60} onChange={value => markSections(sections.map(row => row.key === section.key ? { ...row, ctaLabel: value } : row))}/>)}
                {section.ctaLink !== undefined && (<AppearanceField label="Button link" value={section.ctaLink} maxLength={200} onChange={value => markSections(sections.map(row => row.key === section.key ? { ...row, ctaLink: value } : row))}/>)}
              </div>
            </div>))}
        </div>)}
    </div>);
};
type EditorProps = {
    item: StorefrontNavigationItem;
    categories: any[];
    siblings: StorefrontNavigationItem[];
    patchItem: (id: string, changes: Partial<StorefrontNavigationItem>) => void;
    move: (item: StorefrontNavigationItem, direction: -1 | 1) => void;
    changeMenuType?: (item: StorefrontNavigationItem, type: 'link' | 'dropdown') => void;
    duplicate: (item: StorefrontNavigationItem) => void;
    remove: (item: StorefrontNavigationItem) => void;
};
const NavigationEditor: React.FC<EditorProps> = ({ item, categories, siblings, patchItem, move, changeMenuType, duplicate, remove }) => {
    const ordered = [...siblings].sort((a, b) => a.displayOrder - b.displayOrder);
    const index = ordered.findIndex(row => row.id === item.id);
    const field = 'mt-1 w-full rounded-xl border border-[#ecdfe4] bg-white px-3 py-2 text-sm focus:outline-[#673742]';
    return (<div className="space-y-4 font-heading">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          <button type="button" disabled={index <= 0} onClick={() => move(item, -1)} aria-label={`Move ${item.label} up`} className="rounded-lg border border-[#ecdfe4] p-2 disabled:opacity-30 cursor-pointer">
            <ArrowUp className="h-3.5 w-3.5"/>
          </button>
          <button type="button" disabled={index === ordered.length - 1} onClick={() => move(item, 1)} aria-label={`Move ${item.label} down`} className="rounded-lg border border-[#ecdfe4] p-2 disabled:opacity-30 cursor-pointer">
            <ArrowDown className="h-3.5 w-3.5"/>
          </button>
        </div>
        <span className="mr-auto rounded-full bg-[#FFF4F6] px-2.5 py-1 text-[10px] font-black text-[#382b31]/50">
          {item.isSystemItem ? 'SYSTEM' : item.parentId ? 'CHILD' : 'CUSTOM'}
        </span>
        {!item.isSystemItem && (<button type="button" onClick={() => duplicate(item)} className="rounded-lg p-2 text-[#382b31]/50 hover:bg-[#FFF4F6] cursor-pointer" aria-label={`Duplicate ${item.label}`}>
            <Copy className="h-4 w-4"/>
          </button>)}
        {!item.isSystemItem && (<button type="button" onClick={() => void remove(item)} className="rounded-lg p-2 text-[#673742] hover:bg-[#FFF4F6] cursor-pointer" aria-label={`Delete ${item.label}`}>
            <Trash2 className="h-4 w-4"/>
          </button>)}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-[11px] font-bold text-[#382b31]/70">
          Label
          <input value={item.label} maxLength={60} onChange={e => patchItem(item.id, { label: e.target.value })} className={field}/>
        </label>
        {!item.parentId && (<label className="text-[11px] font-bold text-[#382b31]/70">
            Menu Type
            <select value={item.menuType} onChange={e => changeMenuType?.(item, e.target.value as 'link' | 'dropdown')} className={field}>
              <option value="link">Link</option>
              <option value="dropdown">Dropdown</option>
            </select>
          </label>)}
        {item.menuType === 'link' && (<>
            <label className="text-[11px] font-bold text-[#382b31]/70">
              Link Type
              <select value={item.linkType} onChange={e => patchItem(item.id, { linkType: e.target.value as NavigationLinkType, path: undefined, externalUrl: undefined, categoryId: undefined })} className={field}>
                <option value="internal_page">Internal Page</option>
                <option value="category">Category</option>
                <option value="custom_internal_url">Custom Internal URL</option>
                <option value="external_url">External HTTPS URL</option>
              </select>
            </label>
            <Destination item={item} categories={categories} patchItem={patchItem} field={field}/>
          </>)}
        <label className="text-[11px] font-bold text-[#382b31]/70">
          Badge (optional)
          <input value={item.badgeText || ''} maxLength={20} onChange={e => patchItem(item.id, { badgeText: e.target.value })} className={field} placeholder="New"/>
        </label>
      </div>

      <div className="flex flex-wrap gap-4">
        {(['visible', 'enabled', 'showOnDesktop', 'showOnMobile'] as const).map(key => (<label key={key} className="flex items-center gap-2 text-xs font-semibold text-[#382b31]/70 cursor-pointer">
            <input type="checkbox" checked={item[key]} onChange={e => patchItem(item.id, { [key]: e.target.checked })} className="accent-[#673742]"/>
            <span>{{ visible: 'Visible', enabled: 'Enabled', showOnDesktop: 'Desktop', showOnMobile: 'Mobile' }[key]}</span>
          </label>))}
        {item.linkType === 'external_url' && item.menuType === 'link' && (<label className="flex items-center gap-2 text-xs font-semibold text-[#382b31]/70 cursor-pointer">
            <input type="checkbox" checked={item.openInNewTab === true} onChange={e => patchItem(item.id, { openInNewTab: e.target.checked })} className="accent-[#673742]"/>
            <span>Open in new tab</span>
          </label>)}
      </div>
    </div>);
};
const Destination: React.FC<{
    item: StorefrontNavigationItem;
    categories: any[];
    patchItem: EditorProps['patchItem'];
    field: string;
}> = ({ item, categories, patchItem, field }) => {
    if (item.linkType === 'internal_page') {
        return (<label className="text-[11px] font-bold text-[#382b31]/70">
        Page
        <select value={item.path || '/'} onChange={e => patchItem(item.id, { path: e.target.value })} className={field}>
          {INTERNAL_PAGE_OPTIONS.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
        </select>
      </label>);
    }
    if (item.linkType === 'category') {
        return (<label className="text-[11px] font-bold text-[#382b31]/70">
        Category
        <select value={item.categoryId || ''} onChange={e => patchItem(item.id, { categoryId: e.target.value })} className={field}>
          <option value="">Choose category</option>
          {categories.filter(category => category.isActive !== false).map(category => (<option key={category.id} value={category.id}>{category.name}</option>))}
        </select>
      </label>);
    }
    if (item.linkType === 'external_url') {
        return (<label className="text-[11px] font-bold text-[#382b31]/70">
        HTTPS URL
        <input value={item.externalUrl || ''} onChange={e => patchItem(item.id, { externalUrl: e.target.value })} className={field} placeholder="https://example.com"/>
      </label>);
    }
    return (<label className="text-[11px] font-bold text-[#382b31]/70">
      Public Path
      <input value={item.path || ''} onChange={e => patchItem(item.id, { path: e.target.value })} className={field} placeholder="/collections/new"/>
    </label>);
};
const AppearanceField: React.FC<{
    label: string;
    value: string;
    maxLength: number;
    onChange: (value: string) => void;
}> = ({ label, value, maxLength, onChange }) => (<label className="text-[11px] font-bold text-[#382b31]/70">
    {label}
    <input value={value} maxLength={maxLength} onChange={e => onChange(e.target.value)} className="mt-1 w-full rounded-xl border border-[#ecdfe4] bg-white px-3 py-2 text-sm focus:outline-[#673742]"/>
    <span className="mt-1 block text-right text-[10px] text-[#382b31]/40">{value.length}/{maxLength}</span>
  </label>);

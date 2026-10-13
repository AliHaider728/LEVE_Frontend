"use client";
import React, { useState } from 'react';
import { Save, Globe, DollarSign, Sliders } from 'lucide-react';
import { useAdminUI } from '../context/AdminUIContext';
export const StoreSettingsPage: React.FC = () => {
    const { settings, updateSettings, showToast } = useAdminUI();
    const [storeName, setStoreName] = useState(settings.storeName);
    const [email, setEmail] = useState(settings.email);
    const [phone, setPhone] = useState(settings.phone);
    const [address, setAddress] = useState(settings.address);
    const [currency, setCurrency] = useState(settings.currency);
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(settings.freeShippingThreshold);
    const [standardShippingFee, setStandardShippingFee] = useState(settings.standardShippingFee);
    const [taxRate, setTaxRate] = useState(settings.taxRate * 100);
    const [metaTitle, setMetaTitle] = useState(settings.metaTitle);
    const [metaDescription, setMetaDescription] = useState(settings.metaDescription);
    const [socialLinks,setSocialLinks]=useState<Record<string,string>>(settings.socialLinks||{});
    const [saving, setSaving] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
            try {
                await updateSettings({
                    storeName,
                    email,
                    phone,
                    address,
                    currency,
                    freeShippingThreshold: Number(freeShippingThreshold),
                    standardShippingFee: Number(standardShippingFee),
                    taxRate: Number(taxRate) / 100,
                    metaTitle,
                    metaDescription, socialLinks
                });
                setSaving(false);
                showToast('Store settings updated successfully.', 'success');
            }
            catch {} finally {setSaving(false);}

    };
    return (<div className="space-y-6 font-heading">
      <div>
        <h1 className="font-heading font-black text-2xl text-[#382b31]">Store Settings & Delivery Rates</h1>
        <p className="text-xs text-[#382b31]/50 font-medium">Configure store details, free shipping threshold in PKR, delivery charges, and SEO defaults.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Profile */}
        <div className="bg-white p-6 rounded-3xl border border-[#ecdfe4]/80 shadow-xs space-y-4">
          <h3 className="font-heading font-black text-base text-[#382b31] flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#673742]"/>
            <span>General Store Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#382b31]/80 block mb-1">Store Name</label>
              <input type="text" required value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl border border-[#ecdfe4] focus:outline-[#673742]"/>
            </div>

            <div>
              <label className="text-xs font-bold text-[#382b31]/80 block mb-1">Currency Code / Symbol</label>
              <input type="text" required value={currency} onChange={e => setCurrency(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl border border-[#ecdfe4] focus:outline-[#673742]"/>
            </div>

            <div>
              <label className="text-xs font-bold text-[#382b31]/80 block mb-1">Support Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl border border-[#ecdfe4] focus:outline-[#673742]"/>
            </div>

            <div>
              <label className="text-xs font-bold text-[#382b31]/80 block mb-1">Phone / WhatsApp Contact</label>
              <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl border border-[#ecdfe4] focus:outline-[#673742]"/>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#382b31]/80 block mb-1">Store Location Address</label>
              <input type="text" required value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl border border-[#ecdfe4] focus:outline-[#673742]"/>
            </div>
          </div>
        </div>

        {/* Shipping & Taxes */}
        <div className="bg-white p-6 rounded-3xl border border-[#ecdfe4]/80 shadow-xs space-y-4">
          <h3 className="font-heading font-black text-base text-[#382b31] flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#673742]"/>
            <span>Shipping & Tax Rates</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-[#382b31]/80 block mb-1">Free Shipping Minimum (Rs.)</label>
              <input type="number" required value={freeShippingThreshold} onChange={e => setFreeShippingThreshold(Number(e.target.value))} className="w-full px-3 py-2 text-xs rounded-xl border border-[#ecdfe4] focus:outline-[#673742]"/>
            </div>

            <div>
              <label className="text-xs font-bold text-[#382b31]/80 block mb-1">Standard Flat Delivery Fee (Rs.)</label>
              <input type="number" step="1" required value={standardShippingFee} onChange={e => setStandardShippingFee(Number(e.target.value))} className="w-full px-3 py-2 text-xs rounded-xl border border-[#ecdfe4] focus:outline-[#673742]"/>
            </div>

            <div>
              <label className="text-xs font-bold text-[#382b31]/80 block mb-1">Estimated Sales Tax (%)</label>
              <input type="number" step="0.1" required value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} className="w-full px-3 py-2 text-xs rounded-xl border border-[#ecdfe4] focus:outline-[#673742]"/>
            </div>
          </div>
        </div>

        {/* Default SEO Settings */}
        <div className="bg-white p-6 rounded-3xl border border-[#ecdfe4]/80 shadow-xs space-y-4">
          <h3 className="font-heading font-black text-base text-[#382b31] flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#673742]"/>
            <span>Global SEO Default Meta</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#382b31]/80 block mb-1">Default Title Template</label>
              <input type="text" required value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl border border-[#ecdfe4] focus:outline-[#673742]"/>
            </div>

            <div>
              <label className="text-xs font-bold text-[#382b31]/80 block mb-1">Default Meta Description</label>
              <textarea rows={2} required value={metaDescription} onChange={e => setMetaDescription(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl border border-[#ecdfe4] focus:outline-[#673742]"/>
            </div>
          </div>
        </div>

<div className="rounded-3xl border border-[#ecdfe4] p-6"><h3 className="font-bold mb-4">Social links</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{['instagram','facebook','youtube','tiktok'].map(key=><label key={key} className="text-xs capitalize">{key}<input type="url" value={socialLinks[key]||''} onChange={e=>setSocialLinks(prev=>({...prev,[key]:e.target.value}))} className="mt-1 w-full rounded-xl border border-[#ecdfe4] px-3 py-2"/></label>)}</div></div>
        <button type="submit" disabled={saving} className="px-8 py-3.5 rounded-xl bg-[#382b31] hover:bg-[#333333] text-white font-heading font-extrabold text-xs shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-all">
          <Save className="w-4 h-4 text-[#673742]"/>
          <span>{saving ? 'Saving…' : 'Save Store Settings'}</span>
        </button>
      </form>
    </div>);
};

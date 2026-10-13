"use client";
import React from 'react';
import { Plus, Trash2, Tag, Gift, BadgePercent } from 'lucide-react';
import { PricingOffers, QuantityBreakTier } from '../../types';
import { Toggle } from '../Toggle';
const fieldCls = 'w-full rounded-xl border border-[#ecdfe4] bg-white px-3 py-2.5 text-sm text-[#382b31] outline-none transition focus:border-[#673742] focus:ring-2 focus:ring-rose-100';
const smallFieldCls = 'w-full rounded-xl border border-[#ecdfe4] bg-white px-2.5 py-2 text-sm text-[#382b31] outline-none transition focus:border-[#673742] focus:ring-2 focus:ring-rose-100';
const calcSaveAmount = (tier1Price: number, tierPrice: number, minQty: number): number => {
    if (!tier1Price || tierPrice >= tier1Price)
        return 0;
    return (tier1Price - tierPrice) * minQty;
};
const formatAutoLabel = (minQty: number, saveAmount: number): string => {
    if (saveAmount > 0)
        return `Buy ${minQty}, Save Rs. ${saveAmount}`;
    return `Buy ${minQty}`;
};
const emptyTier = (): QuantityBreakTier => ({
    minQty: 1,
    pricePerUnit: 0,
    label: '',
    badge: ''
});
const DEFAULT_OFFERS: PricingOffers = {
    quantityBreaks: { enabled: false, tiers: [] },
    bogo: { enabled: false, buyQty: 2, getQty: 1, label: '' },
    flatDiscount: { enabled: false, minQty: 2, discountType: 'fixed', discountValue: 0, label: '' }
};
interface Props {
    value: PricingOffers;
    onChange: (next: PricingOffers) => void;
    basePrice: number;
}
export const PricingOffersSection: React.FC<Props> = ({ value, onChange, basePrice }) => {
    const offers = value || DEFAULT_OFFERS;
    const qb = offers.quantityBreaks || DEFAULT_OFFERS.quantityBreaks;
    const bogo = offers.bogo || DEFAULT_OFFERS.bogo;
    const flatDiscount = offers.flatDiscount || DEFAULT_OFFERS.flatDiscount;
    const sortedTiersWithIndex = (qb.tiers || [])
        .map((tier, index) => ({ tier, originalIndex: index }))
        .sort((a, b) => a.tier.minQty - b.tier.minQty);
    const setQb = (next: Partial<typeof qb>) => onChange({ ...offers, quantityBreaks: { ...qb, ...next } });
    const setBogo = (next: Partial<typeof bogo>) => onChange({ ...offers, bogo: { ...bogo, ...next } });
    const setFlatDiscount = (next: Partial<typeof flatDiscount>) => onChange({ ...offers, flatDiscount: { ...flatDiscount, ...next } });
    const addTier = () => {
        const lastQty = qb.tiers[qb.tiers.length - 1]?.minQty ?? 0;
        setQb({
            tiers: [
                ...(qb.tiers || []),
                { ...emptyTier(), minQty: lastQty + 1, pricePerUnit: basePrice }
            ]
        });
    };
    const updateTier = (index: number, patch: Partial<QuantityBreakTier>) => {
        const tiers = qb.tiers.map((t, i) => (i === index ? { ...t, ...patch } : t));
        setQb({ tiers });
    };
    const removeTier = (index: number) => {
        setQb({ tiers: qb.tiers.filter((_, i) => i !== index) });
    };
    const bogoAutoLabel = `Buy ${bogo.buyQty}, Get ${bogo.getQty} Free`;
    const flatAutoLabel = flatDiscount.discountType === 'percentage'
        ? `Buy ${flatDiscount.minQty}+, Save ${flatDiscount.discountValue}%/unit`
        : `Buy ${flatDiscount.minQty}+, Save Rs. ${flatDiscount.discountValue}/unit`;
    return (<div className="space-y-8">
      {/* Section A: Quantity Breaks */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#ecdfe4] pb-3">
          <Tag className="h-4 w-4 text-[#673742]"/>
          <h3 className="font-heading text-sm font-black text-[#382b31] uppercase tracking-wider">
            Quantity Breaks
          </h3>
        </div>

        <Toggle checked={qb.enabled} onChange={enabled => setQb({ enabled })} label="Enable Quantity Breaks" description="Show tiered pricing cards on the product page. Customers tap a card to select that quantity and see the discounted price."/>

        {qb.enabled && (<div className="space-y-3 pl-0 pt-1">
            {(!qb.tiers || qb.tiers.length === 0) && (<p className="rounded-2xl border border-dashed border-[#ecdfe4] bg-[#FFF4F6] px-4 py-3 text-xs text-[#382b31]/40">
                No tiers yet. Click &ldquo;Add Tier&rdquo; to create your first pricing tier.
              </p>)}

            <div className="space-y-2 flex flex-col">
              {sortedTiersWithIndex.map(({ tier, originalIndex }) => (<div key={originalIndex} className="grid grid-cols-[60px_1fr_60px_1fr_1fr_48px_40px] gap-2 items-start rounded-2xl border border-[#ecdfe4] bg-[#FFF4F6]/60 p-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#382b31]/50">
                      Min Qty
                    </label>
                    <input type="number" min={1} value={tier.minQty} onChange={e => updateTier(originalIndex, { minQty: Number(e.target.value) })} className={smallFieldCls}/>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#382b31]/50">
                      Price/Unit
                    </label>
                    <input type="number" min={0} value={tier.pricePerUnit} onChange={e => updateTier(originalIndex, { pricePerUnit: Number(e.target.value) })} className={smallFieldCls}/>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#382b31]/50">
                      % Off
                    </label>
                    <input type="number" min={0} max={100} value={basePrice > 0 && tier.pricePerUnit < basePrice ? Math.round(((basePrice - tier.pricePerUnit) / basePrice) * 100) : 0} onChange={e => {
                    const pct = Math.max(0, Math.min(100, Number(e.target.value)));
                    const newPrice = Math.round(basePrice * (1 - pct / 100));
                    updateTier(originalIndex, { pricePerUnit: newPrice });
                }} className={smallFieldCls}/>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#382b31]/50">
                      Label
                    </label>
                    <input type="text" maxLength={120} placeholder={formatAutoLabel(tier.minQty, calcSaveAmount(basePrice, tier.pricePerUnit, tier.minQty))} value={tier.label} onChange={e => updateTier(originalIndex, { label: e.target.value })} className={smallFieldCls}/>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#382b31]/50">
                      Badge
                    </label>
                    <input type="text" maxLength={60} placeholder="e.g. Most Popular" value={tier.badge} onChange={e => updateTier(originalIndex, { badge: e.target.value })} className={smallFieldCls}/>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#382b31]/50">
                      Save
                    </label>
                    <div className="flex h-9 items-center justify-center rounded-xl border border-[#ecdfe4] bg-[#FFF4F6] px-2 text-xs font-bold text-[#673742] whitespace-nowrap">
                      {(() => {
                    const saved = calcSaveAmount(basePrice, tier.pricePerUnit, tier.minQty);
                    return saved === 0 ? 'base' : `Rs. ${saved}`;
                })()}
                    </div>
                  </div>

                  <div className="pt-5">
                    <button type="button" onClick={() => removeTier(originalIndex)} className="flex h-9 w-9 items-center justify-center rounded-xl text-[#382b31]/40 hover:bg-[#FFF4F6] hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4"/>
                    </button>
                  </div>
                </div>))}
            </div>

            <button type="button" onClick={addTier} className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#ecdfe4] bg-white px-4 py-2 text-xs font-bold text-[#382b31]/70 hover:border-[#673742] hover:text-[#673742] transition-colors">
              <Plus className="h-3.5 w-3.5"/>
              Add Tier
            </button>
          </div>)}
      </div>

      {/* Section B: BOGO */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#ecdfe4] pb-3">
          <Gift className="h-4 w-4 text-[#673742]"/>
          <h3 className="font-heading text-sm font-black text-[#382b31] uppercase tracking-wider">
            Buy X Get Y Free (BOGO)
          </h3>
        </div>

        <Toggle checked={bogo.enabled} onChange={enabled => setBogo({ enabled })} label="Enable Buy X Get Y Free" description="Award free units when a customer buys a qualifying quantity."/>

        {bogo.enabled && (<div className="space-y-4 pl-0 pt-1">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#382b31]/80">
                  Buy Qty (paid)
                </label>
                <input type="number" min={1} value={bogo.buyQty} onChange={e => {
                const buyQty = Math.max(1, Number(e.target.value));
                setBogo({ buyQty });
            }} className={fieldCls}/>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#382b31]/80">
                  Get Qty (free)
                </label>
                <input type="number" min={1} value={bogo.getQty} onChange={e => {
                const getQty = Math.max(1, Number(e.target.value));
                setBogo({ getQty });
            }} className={fieldCls}/>
              </div>

              <div className="col-span-2 sm:col-span-1 flex items-end">
                <div className="w-full rounded-xl border border-[#ecdfe4] bg-[#FFF4F6] px-3 py-2.5 text-sm font-bold text-[#673742] flex items-center gap-1.5">
                  <Tag className="h-4 w-4 shrink-0"/> {bogoAutoLabel}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#382b31]/80">
                Offer Label{' '}
                <span className="font-normal text-[#382b31]/40">
                  (leave empty to use auto-generated: &ldquo;{bogoAutoLabel}&rdquo;)
                </span>
              </label>
              <input type="text" maxLength={120} placeholder={bogoAutoLabel} value={bogo.label} onChange={e => setBogo({ label: e.target.value })} className={fieldCls}/>
            </div>
          </div>)}
      </div>

      {/* Section C: Flat Discount */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#ecdfe4] pb-3">
          <BadgePercent className="h-4 w-4 text-[#673742]"/>
          <h3 className="font-heading text-sm font-black text-[#382b31] uppercase tracking-wider">
            Flat Discount
          </h3>
        </div>

        <Toggle checked={flatDiscount.enabled} onChange={enabled => setFlatDiscount({ enabled })} label="Enable Flat Discount" description="Apply a uniform discount (fixed Rs. or %) to every unit once a minimum quantity is reached."/>

        {flatDiscount.enabled && (<div className="space-y-4 pl-0 pt-1">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#382b31]/80">
                  Minimum Quantity
                </label>
                <input type="number" min={1} value={flatDiscount.minQty} onChange={e => setFlatDiscount({ minQty: Math.max(1, Number(e.target.value)) })} className={fieldCls}/>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#382b31]/80">
                  Discount Value
                </label>
                <div className="relative">
                  <input type="number" min={0} value={flatDiscount.discountValue} onChange={e => setFlatDiscount({ discountValue: Math.max(0, Number(e.target.value)) })} className={`${fieldCls} pr-14`}/>
                  <div className="absolute inset-y-0 right-1 flex items-center">
                    <button type="button" onClick={() => {
                setFlatDiscount({
                    discountType: flatDiscount.discountType === 'fixed' ? 'percentage' : 'fixed'
                });
            }} className="flex h-7 items-center justify-center rounded-lg bg-[#FFF4F6] px-2 text-xs font-bold text-[#382b31]/70 hover:bg-slate-200">
                      {flatDiscount.discountType === 'fixed' ? 'Rs.' : '%'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 flex items-end">
                <div className="w-full rounded-xl border border-[#ecdfe4] bg-[#FFF4F6] px-3 py-2.5 text-sm font-bold text-[#673742] flex items-center gap-1.5">
                  <Tag className="h-4 w-4 shrink-0 text-[#673742]"/> {flatAutoLabel}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#382b31]/80">
                Offer Label{' '}
                <span className="font-normal text-[#382b31]/40">
                  (leave empty to use auto-generated: &ldquo;{flatAutoLabel}&rdquo;)
                </span>
              </label>
              <input type="text" maxLength={120} placeholder={flatAutoLabel} value={flatDiscount.label} onChange={e => setFlatDiscount({ label: e.target.value })} className={fieldCls}/>
            </div>
          </div>)}
      </div>
    </div>);
};

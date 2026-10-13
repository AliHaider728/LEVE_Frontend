"use client";
import React, { useState } from 'react';
import { Plus, Save, Trash2, Sparkles } from 'lucide-react';
import { useAdminUI } from '../context/AdminUIContext';
import { RoutineDiscountSettings } from '../types';
export const RoutineDiscountsPage: React.FC = () => {
    const { settings, updateRoutineDiscountSettings, showToast } = useAdminUI();
    const [draft, setDraft] = useState<RoutineDiscountSettings>(() => {
        return settings.routineDiscount || {
            minimumDistinctProducts: 2,
            tiers: [
                { minProducts: 2, discountPercent: 10 },
                { minProducts: 3, discountPercent: 15 },
                { minProducts: 4, discountPercent: 20 }
            ],
            quantityBonusEnabled: true,
            quantityBonusPercent: 5
        };
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const change = (next: RoutineDiscountSettings) => {
        setDraft(next);
        setSaved(false);
    };
    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
            try {
                await updateRoutineDiscountSettings(draft);
                setSaving(false);
                setSaved(true);
                showToast('Routine discounts saved successfully.', 'success');
            }
            catch {} finally {setSaving(false);}

    };
    const field = 'w-full rounded-xl border border-[#ecdfe4] bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#673742]';
    return (<div className="max-w-4xl space-y-6 font-heading">
      <div>
        <h1 className="text-2xl font-bold text-[#382b31]">Build Your Routine</h1>
        <p className="mt-2 text-sm text-[#74665C]">Configure savings for the routine builder, cart and checkout.</p>
      </div>

      {saved && (<p role="status" className="rounded-2xl bg-[#FFF4F6] p-4 text-sm text-[#673742]">
          Routine discounts saved. New calculations use these settings.
        </p>)}

      <form onSubmit={submit} className="space-y-6">
        <fieldset disabled={saving} className="space-y-6 disabled:opacity-60">
          <section className="rounded-3xl border border-[#ecdfe4] bg-gradient-to-br from-[#F7E5DE] to-[#FFFCF8] p-6">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#382b31]">
              <Sparkles size={19} className="text-[#673742]"/>
              <span>Unlocking the discount</span>
            </h2>
            <label htmlFor="routine-minimum" className="mb-2 block text-sm font-medium text-[#382b31]/80">
              Minimum distinct products
            </label>
            <input id="routine-minimum" type="number" required min="1" max="100" step="1" value={draft.minimumDistinctProducts} onChange={e => change({ ...draft, minimumDistinctProducts: Number(e.target.value) })} className={`${field} max-w-xs`}/>
            <p className="mt-3 text-xs leading-relaxed text-[#74665C]">
              Different quantities or variants of the same product count as one distinct product. Below this minimum, neither the tier discount nor the quantity bonus applies.
            </p>
          </section>

          <section className="rounded-3xl border border-[#ecdfe4] bg-white p-6">
            <h2 className="font-semibold text-[#382b31]">Discount tiers</h2>
            <p className="mb-5 mt-2 text-sm text-[#74665C]">
              The highest qualifying product-count tier applies. Each tier continues until the next threshold.
            </p>
            <div className="space-y-3">
              {draft.tiers.map((tier, index) => (<div key={index} className="flex items-end gap-3 rounded-2xl bg-[#FFF4F6] p-3">
                  <label className="flex-1 text-xs font-medium text-[#382b31]/80">
                    Distinct products (at least)
                    <input aria-label={`Tier ${index + 1} product count`} type="number" required min="1" max="100" step="1" value={tier.minProducts} onChange={e => change({
                ...draft,
                tiers: draft.tiers.map((item, i) => i === index ? { ...item, minProducts: Number(e.target.value) } : item)
            })} className={`${field} mt-2`}/>
                  </label>
                  <label className="flex-1 text-xs font-medium text-[#382b31]/80">
                    Discount (%)
                    <input aria-label={`Tier ${index + 1} discount`} type="number" required min="0" max="100" step="0.1" value={tier.discountPercent} onChange={e => change({
                ...draft,
                tiers: draft.tiers.map((item, i) => i === index ? { ...item, discountPercent: Number(e.target.value) } : item)
            })} className={`${field} mt-2`}/>
                  </label>
                  <button type="button" aria-label={`Remove tier ${index + 1}`} disabled={draft.tiers.length === 1} onClick={() => change({ ...draft, tiers: draft.tiers.filter((_, i) => i !== index) })} className="rounded-xl p-3 text-[#673742] hover:bg-[#FFF4F6]/30 disabled:opacity-30 cursor-pointer">
                    <Trash2 size={18}/>
                  </button>
                </div>))}
            </div>
            <button type="button" onClick={() => change({
            ...draft,
            tiers: [
                ...draft.tiers,
                { minProducts: (draft.tiers.length ? Math.max(...draft.tiers.map(t => t.minProducts)) : 1) + 1, discountPercent: 0 }
            ]
        })} className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#673742] cursor-pointer hover:underline">
              <Plus size={17}/>
              <span>Add tier</span>
            </button>
          </section>

          <section className="rounded-3xl border border-[#ecdfe4] bg-white p-6">
            <h2 className="mb-4 font-semibold text-[#382b31]">Flat quantity bonus</h2>
            <label className="mb-5 flex items-center gap-3 text-sm text-[#382b31] cursor-pointer">
              <input type="checkbox" checked={draft.quantityBonusEnabled} onChange={e => change({ ...draft, quantityBonusEnabled: e.target.checked })} className="h-5 w-5 accent-[#673742]"/>
              <span>Enable extra savings for duplicate quantities</span>
            </label>
            <label htmlFor="routine-bonus" className="mb-2 block text-sm font-medium text-[#382b31]/80">
              Additional discount (%)
            </label>
            <input id="routine-bonus" type="number" required min="0" max="100" step="0.1" disabled={!draft.quantityBonusEnabled} value={draft.quantityBonusPercent} onChange={e => change({ ...draft, quantityBonusPercent: Number(e.target.value) })} className={`${field} max-w-xs disabled:opacity-50`}/>
            <p className="mt-3 text-xs leading-relaxed text-[#74665C]">
              Added once when total paid quantity exceeds the distinct product count. More duplicates never multiply the bonus. The tier plus bonus cannot exceed 100%.
            </p>
          </section>

          <button type="submit" className="flex items-center gap-2 rounded-xl bg-[#673742] px-6 py-3 text-sm font-semibold text-white hover:bg-[#673742] cursor-pointer transition-colors shadow-md">
            <Save size={18}/>
            <span>{saving ? 'Saving…' : 'Save routine discounts'}</span>
          </button>
        </fieldset>
      </form>
    </div>);
};

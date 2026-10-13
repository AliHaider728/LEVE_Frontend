"use client";
import { useAdminUI } from '../context/AdminUIContext';
import { Switch } from '../components/Switch';
export function BestSellersPage() { const { bestSellers, setBestSeller, showToast } = useAdminUI(); return <div className="space-y-6"><h1 className="font-bold">Best Sellers</h1><p className="text-sm text-[#382b31]/60">Choose which existing products are featured as best sellers.</p><div className="rounded-2xl border border-[#ecdfe4] bg-white p-5">{bestSellers.length ? bestSellers.map(p => <div key={p.id} className="flex items-center justify-between border-b border-[#ecdfe4] py-4"><span>{p.name}</span><Switch aria-label={p.name} checked={Boolean(p.isBestseller)} onChange={async (value: boolean) => {
    try {
        try {
            await setBestSeller(p.id, value);
        }
        catch (error) {
            showToast(error instanceof Error ? error.message : 'Could not save.', 'error');
        }
    }
    catch {
    }
}}/></div>) : <p>No products yet.</p>}</div></div>; }

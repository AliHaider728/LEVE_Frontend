"use client";
import { useState } from 'react';
import { useAdminUI } from '../context/AdminUIContext';
import { Switch } from '../components/Switch';
const labels: Record<string, string> = { products: 'Products', categories: 'Categories', attributes: 'Attributes', orders: 'Orders', customers: 'Customers', reviews: 'Reviews', audioReviews: 'Voice reviews', contact: 'Contact messages', bundles: 'Bundles', coupons: 'Coupons', reports: 'Sales reports', routineDiscounts: 'Routine discounts', bestSellers: 'Best sellers', appearance: 'Store appearance', settings: 'Store settings' };
export function FeatureManagementPage() { const { modules, saveModules, adminUser, showToast } = useAdminUI(); const [saving, setSaving] = useState(false); if (adminUser?.role !== 'super_admin')
    return <p>Super Admin access is required.</p>; return <div className="space-y-6"><div><h1 className="font-bold">Feature Management</h1><p className="mt-2 text-sm text-[#382b31]/60">Control admin modules. Storefront features and checkout remain available.</p></div><div className="grid gap-4 md:grid-cols-2">{Object.entries(labels).map(([key, label]) => <div key={key} className="flex items-center justify-between rounded-2xl border border-[#ecdfe4] bg-white p-5"><span className="font-semibold">{label}</span><Switch aria-label={label} checked={modules[key] === true} disabled={saving} onChange={async (value: boolean) => {
    try {
        setSaving(true);
        try {
            await saveModules({ [key]: value });
        }
        catch (error) {
            showToast(error instanceof Error ? error.message : 'Could not save settings.', 'error');
        }
        finally {
            setSaving(false);
        }
    }
    catch {
    }
}}/></div>)}</div></div>; }

"use client";
import React, { useState } from 'react';
import { Plus, Trash2, X, Edit, Power, PowerOff } from 'lucide-react';
import { useAdminUI } from '../context/AdminUIContext';
import { Coupon } from '../types';
import { formatPrice } from '../utils/formatters';
export const CouponsPage: React.FC = () => {
    const { coupons, addCoupon, updateCoupon, deleteCoupon, showToast, confirm } = useAdminUI();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
    const [amount, setAmount] = useState(10);
    const [minSpend, setMinSpend] = useState(30);
    const [expiryDate, setExpiryDate] = useState('2026-12-31');
    const openCreateModal = () => {
        setEditId(null);
        setCode('');
        setDiscountType('percentage');
        setAmount(10);
        setMinSpend(30);
        setExpiryDate('2026-12-31');
        setIsModalOpen(true);
    };
    const openEditModal = (coup: Coupon) => {
        setEditId(coup.id);
        setCode(coup.code);
        setDiscountType(coup.discountType);
        setAmount(coup.amount);
        setMinSpend(coup.minSpend);
        setExpiryDate(coup.expiryDate || '');
        setIsModalOpen(true);
    };
    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            if (editId) {
                await updateCoupon(editId, {
                    code: code.toUpperCase(),
                    discountType,
                    amount: Number(amount),
                    minSpend: Number(minSpend),
                    expiryDate
                });
                showToast('Coupon updated successfully.', 'success');
            }
            else {
                await addCoupon({
                    code: code.toUpperCase(),
                    discountType,
                    amount: Number(amount),
                    minSpend: Number(minSpend),
                    expiryDate,
                    usageLimit: 500,
                    isActive: true
                });
                showToast('Coupon created successfully.', 'success');
            }
            setIsModalOpen(false);
        }
        catch {
        }
    };
    const toggleStatus = async (coup: Coupon) => {
        try {
            await updateCoupon(coup.id, { isActive: !coup.isActive });
            showToast(`Coupon ${!coup.isActive ? 'enabled' : 'disabled'}.`, 'success');
        }
        catch {
        }
    };
    const removeCoupon = async (coupon: Coupon) => {
        try {
            const isConfirmed = await confirm({
                title: 'Delete this coupon?',
                description: `${coupon.code} will no longer be available to customers.`,
                cancelLabel: 'Keep Coupon',
                confirmLabel: 'Delete Coupon',
                destructive: true
            });
            if (!isConfirmed)
                return;
            await deleteCoupon(coupon.id);
            showToast('Coupon deleted.', 'info');
        }
        catch {
        }
    };
    return (<div className="space-y-6 font-heading">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-2xl text-[#382b31]">Promo Coupons & Deals</h1>
          <p className="text-xs text-[#382b31]/50 font-medium">Create promotional discount codes and percentage vouchers.</p>
        </div>
        <button onClick={openCreateModal} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#673742] to-[#673742] hover:from-[#673742] hover:to-[#673742] text-white border-transparent shadow-sm font-heading font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all">
          <Plus className="w-4 h-4"/>
          <span>Create New Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons.map(coup => (<div key={coup.id} className="bg-white rounded-3xl p-6 border border-[#ecdfe4]/80 shadow-xs space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#ecdfe4] pb-3">
              <span className="font-mono font-black text-base text-[#382b31] bg-[#FFF4F6] px-3 py-1 rounded-xl">
                {coup.code}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${coup.isActive ? 'bg-[#FFF4F6] text-[#673742]' : 'bg-[#FFF4F6] text-[#382b31]/50'}`}>
                {coup.isActive ? 'Active' : 'Disabled'}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-heading font-black text-xl text-[#673742] block">
                {coup.discountType === 'percentage' ? `${coup.amount}% OFF` : `${formatPrice(coup.amount)} OFF`}
              </span>
              <p className="text-[#382b31]/50 font-medium">Min spend: {formatPrice(coup.minSpend)}</p>
              <p className="text-[#382b31]/40 text-[11px]">Used {coup.usedCount} times &bull; Expires {coup.expiryDate}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#ecdfe4]">
              <button onClick={() => toggleStatus(coup)} className={`p-1.5 rounded-lg text-xs flex items-center gap-1 font-bold cursor-pointer transition-colors ${coup.isActive ? 'text-[#673742] hover:bg-[#FFF4F6]' : 'text-[#673742] hover:bg-[#FFF4F6]'}`}>
                {coup.isActive ? <PowerOff className="w-3.5 h-3.5"/> : <Power className="w-3.5 h-3.5"/>}
                <span>{coup.isActive ? 'Disable' : 'Enable'}</span>
              </button>
              <button onClick={() => openEditModal(coup)} className="p-1.5 text-[#A85A3B] hover:bg-[#FFF4F6] rounded-lg text-xs flex items-center gap-1 font-bold cursor-pointer transition-colors">
                <Edit className="w-3.5 h-3.5"/>
                <span>Edit</span>
              </button>
              <button onClick={() => { void removeCoupon(coup); }} className="p-1.5 text-[#673742] hover:bg-[#FFF4F6] rounded-lg text-xs flex items-center gap-1 font-bold cursor-pointer transition-colors">
                <Trash2 className="w-3.5 h-3.5"/>
                <span>Delete</span>
              </button>
            </div>
          </div>))}
      </div>

      {isModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#382b31]/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative shadow-2xl border border-[#ecdfe4] space-y-4">
            <div className="flex items-center justify-between border-b border-[#ecdfe4] pb-3">
              <h3 className="font-heading font-black text-lg text-[#382b31]">{editId ? 'Edit Promo Code' : 'Create Promo Code'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-[#382b31]/40 hover:text-[#382b31] cursor-pointer">
                <X className="w-5 h-5"/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#382b31]/80 block mb-1">Coupon Code</label>
                <input type="text" required placeholder="e.g. TOYFUN20" value={code} onChange={e => setCode(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl border border-[#ecdfe4] uppercase font-mono focus:outline-[#673742]"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#382b31]/80 block mb-1">Discount Type</label>
                  <select value={discountType} onChange={e => setDiscountType(e.target.value as 'percentage' | 'flat')} className="w-full px-3 py-2 text-xs rounded-xl border border-[#ecdfe4] bg-white focus:outline-[#673742]">
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#382b31]/80 block mb-1">Amount</label>
                  <input type="number" required value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full px-3 py-2 text-xs rounded-xl border border-[#ecdfe4] focus:outline-[#673742]"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#382b31]/80 block mb-1">Min Spend (Rs.)</label>
                  <input type="number" required value={minSpend} onChange={e => setMinSpend(Number(e.target.value))} className="w-full px-3 py-2 text-xs rounded-xl border border-[#ecdfe4] focus:outline-[#673742]"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#382b31]/80 block mb-1">Expiry Date</label>
                  <input type="date" required value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl border border-[#ecdfe4] focus:outline-[#673742]"/>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-[#FFF4F6] text-[#382b31]/80 font-bold text-xs hover:bg-[#ecdfe4]/50 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#673742] to-[#673742] hover:from-[#673742] hover:to-[#673742] text-white border-transparent font-bold text-xs shadow-md cursor-pointer">
                  {editId ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
};

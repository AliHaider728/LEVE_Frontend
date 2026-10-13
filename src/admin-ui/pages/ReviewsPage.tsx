"use client";
import { uploadImage as uploadAdminAsset } from '@/admin-ui/api';
import React, { useState } from 'react';
import { Search, Trash2, CheckCircle, XCircle, Star, ShieldCheck, Clock, Plus, X } from 'lucide-react';
import { useAdminUI } from '../context/AdminUIContext';
import { getSafeImageSrc } from '../utils/images';
export const ReviewsPage: React.FC = () => {
    const { reviews, products, addReview, updateReviewStatus, deleteReview, confirm } = useAdminUI();
    const [statusFilter, setStatusFilter] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    // Add Review Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [productId, setProductId] = useState(products[0]?.id || '');
    const [reviewerName, setReviewerName] = useState('');
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [verifiedPurchase, setVerifiedPurchase] = useState(true);
    const [imagePreview, setImagePreview] = useState('');
    const counts = {
        pending: reviews.filter(r => r.status === 'pending').length,
        approved: reviews.filter(r => r.status === 'approved').length,
        rejected: reviews.filter(r => r.status === 'rejected').length
    };
    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '5.0';
    const filtered = reviews.filter(r => {
        const matchStatus = !statusFilter || r.status === statusFilter;
        const matchRating = !ratingFilter || r.rating === Number(ratingFilter);
        const matchSearch = !searchQuery ||
            r.reviewerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchStatus && matchRating && matchSearch;
    });
    const handleAddReviewSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            if (!reviewerName.trim() || !content.trim())
                return;
            const prod = products.find(p => p.id === productId);
            await addReview({
                productId,
                productName: prod?.name || 'Skincare Item',
                reviewerName: reviewerName.trim(),
                rating,
                title: title.trim(),
                content: content.trim(),
                verifiedPurchase,
                imageUrl: imagePreview || undefined,
                source: 'admin',
                status: 'approved'
            });
            setIsAddModalOpen(false);
            setReviewerName('');
            setTitle('');
            setContent('');
            setImagePreview('');
        }
        catch {
        }
    };
    const handleDelete = async (id: string) => {
        try {
            const isConfirmed = await confirm({
                title: 'Delete this review?',
                description: 'The review will be permanently removed.',
                cancelLabel: 'Cancel',
                confirmLabel: 'Delete Review',
                destructive: true
            });
            if (isConfirmed) {
                await deleteReview(id);
            }
        }
        catch {
        }
    };
    return (<div className="space-y-6 font-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-[#382b31]">Customer Reviews & UGC</h1>
          <p className="text-xs text-[#382b31]/50 font-medium">Moderate incoming product reviews, approve testimonials, and add manual UGC feedback.</p>
        </div>
        <button type="button" onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#673742] to-[#673742] hover:from-[#673742] hover:to-[#673742] text-white px-5 py-2.5 text-xs font-bold shadow-sm">
          <Plus className="w-4 h-4"/> Add Manual Review
        </button>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#ecdfe4] shadow-xs">
          <span className="text-[11px] font-bold text-[#382b31]/50 uppercase tracking-wider block">Total Reviews</span>
          <span className="font-heading font-black text-2xl text-[#382b31] mt-1 block">{reviews.length}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#ecdfe4] shadow-xs">
          <span className="text-[11px] font-bold text-[#673742] uppercase tracking-wider block flex items-center gap-1">
            <Clock className="w-3.5 h-3.5"/> Pending Approval
          </span>
          <span className="font-heading font-black text-2xl text-[#673742] mt-1 block">{counts.pending}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#ecdfe4] shadow-xs">
          <span className="text-[11px] font-bold text-[#673742] uppercase tracking-wider block flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5"/> Approved Reviews
          </span>
          <span className="font-heading font-black text-2xl text-[#673742] mt-1 block">{counts.approved}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#ecdfe4] shadow-xs">
          <span className="text-[11px] font-bold text-[#673742] uppercase tracking-wider block flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-current"/> Average Rating
          </span>
          <span className="font-heading font-black text-2xl text-[#382b31] mt-1 block">{avgRating} / 5.0</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-3xl border border-[#ecdfe4]/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input type="text" placeholder="Search reviewer or review text..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#ecdfe4] outline-none"/>
          <Search className="w-4 h-4 text-[#382b31]/40 absolute left-3 top-2.5"/>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-xs font-bold rounded-xl border border-[#ecdfe4] bg-white outline-none">
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} className="px-3 py-2 text-xs font-bold rounded-xl border border-[#ecdfe4] bg-white outline-none">
            <option value="">All Star Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-3xl border border-[#ecdfe4]/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#382b31]/80">
            <thead className="bg-[#FFF4F6] text-[#382b31]/40 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 pl-6">Reviewer & Product</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Feedback</th>
                <th className="p-4">Source</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(rev => (<tr key={rev.id} className="hover:bg-[#FFF4F6]/80 transition-colors">
                  <td className="p-4 pl-6">
                    <div>
                      <span className="font-heading font-bold text-[#382b31] block">{rev.reviewerName}</span>
                      <span className="text-[10px] text-[#673742] block font-semibold">
                        {rev.productName || products.find(p => p.id === rev.productId)?.name || 'General Review'}
                      </span>
                      {rev.verifiedPurchase && (<span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#673742] bg-[#FFF4F6] px-1.5 py-0.5 rounded border border-[#ecdfe4] mt-1">
                          <ShieldCheck className="w-3 h-3"/> Verified
                        </span>)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex text-[#673742]">
                      {Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`}/>))}
                    </div>
                  </td>
                  <td className="p-4 max-w-sm">
                    {rev.title && <span className="font-bold text-xs text-[#382b31] block mb-0.5">{rev.title}</span>}
                    <p className="text-xs text-[#382b31]/70 leading-relaxed line-clamp-2">{rev.content}</p>
                    {rev.imageUrl && (<img src={getSafeImageSrc(rev.imageUrl)} alt="UGC photo" className="w-10 h-10 object-cover rounded-lg mt-2 border border-[#ecdfe4]"/>)}
                  </td>
                  <td className="p-4">
                    <span className="capitalize text-[11px] font-semibold text-[#382b31]/60">{rev.source}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${rev.status === 'approved'
                ? 'bg-[#FFF4F6] text-[#673742]'
                : rev.status === 'rejected'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-[#FFF4F6] text-[#673742]'}`}>
                      {rev.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right space-x-1.5">
                    {rev.status !== 'approved' && (<button type="button" onClick={async () => await updateReviewStatus(rev.id, 'approved')} className="p-1.5 text-[#673742] hover:bg-[#FFF4F6] rounded-lg" title="Approve Review">
                        <CheckCircle className="w-4 h-4"/>
                      </button>)}
                    {rev.status !== 'rejected' && (<button type="button" onClick={async () => await updateReviewStatus(rev.id, 'rejected')} className="p-1.5 text-[#673742] hover:bg-[#FFF4F6] rounded-lg" title="Reject Review">
                        <XCircle className="w-4 h-4"/>
                      </button>)}
                    <button type="button" onClick={() => handleDelete(rev.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete Review">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </td>
                </tr>))}

              {filtered.length === 0 && (<tr>
                  <td colSpan={6} className="p-12 text-center text-[#382b31]/40 text-sm">
                    No reviews match your filters.
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Review Modal */}
      {isAddModalOpen && (<div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-[#ecdfe4] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ecdfe4] pb-3 mb-4">
              <h3 className="font-heading font-black text-base text-[#382b31]">Add Manual UGC Review</h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-[#382b31]/40">
                <X className="w-5 h-5"/>
              </button>
            </div>

            <form onSubmit={handleAddReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Product *</label>
                <select value={productId} onChange={e => setProductId(e.target.value)} className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 bg-white">
                  {products.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Customer Name *</label>
                  <input type="text" required value={reviewerName} onChange={e => setReviewerName(e.target.value)} placeholder="e.g. Fatima M." className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 outline-none"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Rating</label>
                  <select value={rating} onChange={e => setRating(Number(e.target.value))} className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 bg-white">
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Review Headline</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Cleared my hyperpigmentation" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 outline-none"/>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Review Content *</label>
                <textarea rows={3} required value={content} onChange={e => setContent(e.target.value)} placeholder="Customer feedback details..." className="w-full text-xs rounded-xl border border-[#ecdfe4] p-3 outline-none"/>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="rev-verified" checked={verifiedPurchase} onChange={e => setVerifiedPurchase(e.target.checked)} className="rounded text-[#673742]"/>
                <label htmlFor="rev-verified" className="text-xs font-bold text-[#382b31]/70 cursor-pointer">
                  Mark as Verified Purchase
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Photo Upload (Optional)</label>
                <input type="file" accept="image/*" onChange={async (e) => {
                try {
                    if (e.target.files?.[0])
                        setImagePreview(await uploadAdminAsset(e.target.files[0]));
                }
                catch {
                }
            }} className="text-xs"/>
                {imagePreview && (<img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-xl mt-2 border"/>)}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#ecdfe4]">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-xs font-bold text-[#382b31]/60 hover:bg-slate-100 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-[#673742] hover:bg-[#673742] rounded-xl shadow-sm">
                  Add Review
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
};

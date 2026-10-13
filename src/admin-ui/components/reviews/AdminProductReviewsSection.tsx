"use client";
import React, { useState } from 'react';
import { Star, MessageSquare, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { Review } from '../../types';
interface AdminProductReviewsSectionProps {
    productId?: string;
    initialReviews?: Review[];
}
export const AdminProductReviewsSection: React.FC<AdminProductReviewsSectionProps> = ({ productId = 'prod-1', initialReviews = [] }) => {
    const [reviews, setReviews] = useState<Review[]>(initialReviews);
    const [showAddForm, setShowAddForm] = useState(false);
    // Form State
    const [reviewerName, setReviewerName] = useState('');
    const [reviewerEmail, setReviewerEmail] = useState('');
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [verifiedPurchase, setVerifiedPurchase] = useState(true);
    const handleAddReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewerName.trim() || !content.trim())
            return;
        const newRev: Review = {
            id: `rev-${Date.now()}`,
            productId,
            reviewerName: reviewerName.trim(),
            reviewerEmail: reviewerEmail.trim(),
            title: title.trim(),
            content: content.trim(),
            rating,
            verifiedPurchase,
            source: 'admin',
            status: 'approved',
            createdAt: new Date().toISOString()
        };
        setReviews([newRev, ...reviews]);
        setShowAddForm(false);
        setReviewerName('');
        setReviewerEmail('');
        setRating(5);
        setTitle('');
        setContent('');
        setVerifiedPurchase(true);
    };
    const handleDelete = (id: string) => {
        setReviews(reviews.filter(r => r.id !== id));
    };
    return (<div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ecdfe4] pb-4">
        <div>
          <h3 className="font-heading font-black text-lg text-[#382b31] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#673742]"/>
            Product Reviews ({reviews.length})
          </h3>
          <p className="text-xs text-[#382b31]/50 mt-1">Manage customer testimonials and manual UGC reviews for this product.</p>
        </div>

        <button type="button" onClick={() => setShowAddForm(!showAddForm)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#673742] text-white rounded-xl text-xs font-bold hover:bg-[#673742] transition-colors">
          <Plus className="w-4 h-4"/>
          {showAddForm ? 'Cancel Form' : 'Add Manual Review'}
        </button>
      </div>

      {showAddForm && (<form onSubmit={handleAddReview} className="bg-[#FFF4F6] p-5 rounded-2xl border border-[#ecdfe4] space-y-4">
          <h4 className="font-heading font-bold text-sm text-[#382b31]">Add UGC / Manual Review</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Customer Name *</label>
              <input type="text" required value={reviewerName} onChange={e => setReviewerName(e.target.value)} placeholder="e.g. Ayesha K." className="w-full text-xs bg-white border border-[#ecdfe4] rounded-xl px-3 py-2 outline-none"/>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Email (Optional)</label>
              <input type="email" value={reviewerEmail} onChange={e => setReviewerEmail(e.target.value)} placeholder="customer@example.com" className="w-full text-xs bg-white border border-[#ecdfe4] rounded-xl px-3 py-2 outline-none"/>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Star Rating</label>
              <select value={rating} onChange={e => setRating(Number(e.target.value))} className="w-full text-xs bg-white border border-[#ecdfe4] rounded-xl px-3 py-2 outline-none">
                <option value={5}>5 Stars (Excellent)</option>
                <option value={4}>4 Stars (Good)</option>
                <option value={3}>3 Stars (Average)</option>
                <option value={2}>2 Stars (Poor)</option>
                <option value={1}>1 Star (Bad)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Headline / Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Cleared my dark spots!" className="w-full text-xs bg-white border border-[#ecdfe4] rounded-xl px-3 py-2 outline-none"/>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Review Content *</label>
              <textarea rows={3} required value={content} onChange={e => setContent(e.target.value)} placeholder="Write the full feedback text here..." className="w-full text-xs bg-white border border-[#ecdfe4] rounded-xl px-3 py-2 outline-none"/>
            </div>

            <div className="sm:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="sec-verified" checked={verifiedPurchase} onChange={e => setVerifiedPurchase(e.target.checked)} className="rounded text-[#673742]"/>
              <label htmlFor="sec-verified" className="text-xs font-semibold text-[#382b31]/70 cursor-pointer">
                Mark as Verified Purchase
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#ecdfe4]">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-xs font-bold text-[#382b31]/60 hover:bg-slate-200 rounded-xl">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-[#673742] hover:bg-[#673742] rounded-xl shadow-sm">
              Save Review
            </button>
          </div>
        </form>)}

      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.map(rev => (<div key={rev.id} className="bg-white p-4 rounded-2xl border border-[#ecdfe4] flex flex-col sm:flex-row justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <div className="flex text-[#673742]">
                  {Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`}/>))}
                </div>
                {rev.verifiedPurchase && (<span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#673742] bg-[#FFF4F6] px-2 py-0.5 rounded-full border border-[#ecdfe4]">
                    <ShieldCheck className="w-3 h-3"/> VERIFIED
                  </span>)}
                <span className="text-[10px] text-[#382b31]/40">
                  {new Date(rev.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>

              {rev.title && <h5 className="font-heading font-bold text-xs text-[#382b31]">{rev.title}</h5>}
              <p className="text-xs text-[#382b31]/70 leading-relaxed">{rev.content}</p>
              <span className="text-[11px] font-semibold text-[#382b31]/50 block">By {rev.reviewerName}</span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-start">
              <button type="button" onClick={() => handleDelete(rev.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Review">
                <Trash2 className="w-4 h-4"/>
              </button>
            </div>
          </div>))}

        {reviews.length === 0 && (<div className="p-8 text-center text-xs text-[#382b31]/40 border border-dashed border-[#ecdfe4] rounded-2xl">
            No reviews yet for this product.
          </div>)}
      </div>
    </div>);
};

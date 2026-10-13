"use client";
import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useAdminUI } from '../context/AdminUIContext';
import { AudioReview } from '../types';
export const AudioReviewsPage: React.FC = () => {
    const { audioReviews, addAudioReview, deleteAudioReview, confirm } = useAdminUI();
    const [isFormOpen, setIsFormOpen] = useState(false);
    // Form State
    const [audioFile,setAudioFile]=useState<File|null>(null);
    const [customerName, setCustomerName] = useState('');
    const [duration, setDuration] = useState('0:00');
    const [displayOrder, setDisplayOrder] = useState('1');
    const [isActive, setIsActive] = useState(true);
    const handleAddSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            if (!customerName.trim())
                return;
            if(!audioFile) return;
            await addAudioReview({
                customerName: customerName.trim(),
                file: audioFile,
                duration: duration.trim() || '0:00',
                displayOrder: Number(displayOrder) || 1,
                isActive
            } as Partial<AudioReview>);
            setIsFormOpen(false);
            setCustomerName('');
            setDuration('0:25');
        }
        catch {
        }
    };
    const handleDelete = async (id: string, name: string) => {
        try {
            const isConfirmed = await confirm({
                title: 'Delete Voice Review?',
                description: `"${name}" will be removed.`,
                cancelLabel: 'Cancel',
                confirmLabel: 'Delete Voice Review',
                destructive: true
            });
            if (isConfirmed) {
                await deleteAudioReview(id);
            }
        }
        catch {
        }
    };
    return (<div className="space-y-6 font-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-[#382b31]">Voice & Audio Reviews</h1>
          <p className="text-xs text-[#382b31]/50 font-medium">Manage authentic audio recordings from customers featured across PDPs and landing pages.</p>
        </div>
        <button type="button" onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#673742] to-[#673742] hover:from-[#673742] hover:to-[#673742] text-white px-5 py-2.5 text-xs font-bold shadow-sm">
          <Plus className="w-4 h-4"/> Add Voice Review
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#ecdfe4]/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#382b31]/80">
            <thead className="bg-[#FFF4F6] text-[#382b31]/40 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 pl-6">Customer & Title</th>
                <th className="p-4">Audio Clip</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Order</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {audioReviews.map(audio => (<tr key={audio.id} className="hover:bg-[#FFF4F6]/80 transition-colors">
                  <td className="p-4 pl-6 font-bold text-[#382b31]">
                    {audio.customerName}
                  </td>
                  <td className="p-4">
                    <audio controls preload="none" src={audio.audioUrl} className="h-9 max-w-[240px]"/>
                  </td>
                  <td className="p-4 font-mono text-[#382b31]/60">{audio.duration}</td>
                  <td className="p-4 font-bold">{audio.displayOrder}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${audio.isActive ? 'bg-[#FFF4F6] text-[#673742]' : 'bg-slate-100 text-slate-500'}`}>
                      {audio.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button type="button" onClick={() => handleDelete(audio.id, audio.customerName)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete Audio">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </td>
                </tr>))}

              {audioReviews.length === 0 && (<tr>
                  <td colSpan={6} className="p-12 text-center text-[#382b31]/40 text-sm">
                    No voice reviews found.
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Audio Modal */}
      {isFormOpen && (<div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#ecdfe4] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ecdfe4] pb-3 mb-4">
              <h3 className="font-heading font-black text-base text-[#382b31]">Add Voice Testimonial</h3>
              <button type="button" onClick={() => setIsFormOpen(false)} className="text-[#382b31]/40">
                <X className="w-5 h-5"/>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4"><label className="block text-xs font-semibold">Audio file (up to 10 MB)<input type="file" accept="audio/mpeg,audio/wav,audio/ogg,audio/webm,audio/mp4" required onChange={e=>setAudioFile(e.target.files?.[0]||null)} className="mt-2 block w-full"/></label>
              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Customer / Location Label *</label>
                <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. Ayesha from Lahore" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 outline-none"/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Duration (mm:ss)</label>
                  <input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder="0:20" className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 outline-none font-mono"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Display Order</label>
                  <input type="number" min="1" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} className="w-full text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 outline-none"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#382b31]/80 mb-1">Audio File (MP3/WAV/OGG)</label>
                <input type="file" accept="audio/*" className="text-xs"/>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="audio-active" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded text-[#673742]"/>
                <label htmlFor="audio-active" className="text-xs font-bold text-[#382b31]/80 cursor-pointer">
                  Publish to Live Storefront
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#ecdfe4]">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-xs font-bold text-[#382b31]/60 hover:bg-slate-100 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-[#673742] hover:bg-[#673742] rounded-xl shadow-sm">
                  Save Audio
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
};

"use client";
import React, { useState } from 'react';
import { Mail, Trash2, Search } from 'lucide-react';
import { useAdminUI } from '../context/AdminUIContext';
export const ContactMessagesPage: React.FC = () => {
    const { contactMessages, updateContactStatus, deleteContactMessage, confirm } = useAdminUI();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const filtered = contactMessages.filter(m => {
        const matchStatus = !statusFilter || m.status === statusFilter;
        const matchSearch = !search ||
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.email.toLowerCase().includes(search.toLowerCase()) ||
            m.subject.toLowerCase().includes(search.toLowerCase()) ||
            m.message.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });
    const handleDelete = async (id: string, name: string) => {
        try {
            const isConfirmed = await confirm({
                title: 'Delete Message?',
                description: `Message from "${name}" will be deleted.`,
                cancelLabel: 'Cancel',
                confirmLabel: 'Delete Message',
                destructive: true
            });
            if (isConfirmed) {
                await deleteContactMessage(id);
            }
        }
        catch {
        }
    };
    return (<div className="space-y-6 font-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-[#382b31]">Customer Inquiries & Messages</h1>
          <p className="text-xs text-[#382b31]/50 font-medium">Customer support contact submissions and product inquiry emails.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-[#ecdfe4]/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input type="text" placeholder="Search sender, email, subject or query..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#ecdfe4] outline-none"/>
          <Search className="w-4 h-4 text-[#382b31]/40 absolute left-3 top-2.5"/>
        </div>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-xs font-bold rounded-xl border border-[#ecdfe4] bg-white outline-none">
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Read">Read</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-[#ecdfe4]/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#382b31]/80">
            <thead className="bg-[#FFF4F6] text-[#382b31]/40 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 pl-6">Customer Sender</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Message</th>
                <th className="p-4">Received Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(msg => (<tr key={msg._id} className="hover:bg-[#FFF4F6]/80 transition-colors">
                  <td className="p-4 pl-6">
                    <div>
                      <span className="font-heading font-bold text-[#382b31] block">{msg.name}</span>
                      <span className="text-[11px] text-[#382b31]/50 flex items-center gap-1 mt-0.5 font-medium">
                        <Mail className="w-3 h-3 text-[#382b31]/30"/> {msg.email}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-[#382b31] max-w-[180px] truncate" title={msg.subject}>
                    {msg.subject}
                  </td>
                  <td className="p-4 max-w-sm">
                    <p className="text-xs text-[#382b31]/70 leading-relaxed line-clamp-2" title={msg.message}>
                      {msg.message}
                    </p>
                  </td>
                  <td className="p-4 text-[#382b31]/50">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <select value={msg.status} onChange={async (e) => await updateContactStatus(msg._id, e.target.value as any)} className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border outline-none ${msg.status === 'New'
                ? 'bg-[#FFF4F6] text-[#673742] border-[#ecdfe4]'
                : msg.status === 'Read'
                    ? 'bg-[#FFF4F6] text-[#673742] border-[#ecdfe4]'
                    : 'bg-[#FFF4F6] text-[#673742] border-[#ecdfe4]'}`}>
                      <option value="New">New</option>
                      <option value="Read">Read</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button type="button" onClick={() => handleDelete(msg._id, msg.name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Message">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </td>
                </tr>))}

              {filtered.length === 0 && (<tr>
                  <td colSpan={6} className="p-12 text-center text-[#382b31]/40 text-sm">
                    No inquiries found.
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
};

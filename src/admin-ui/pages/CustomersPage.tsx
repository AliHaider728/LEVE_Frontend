"use client";
import React, { useState } from 'react';
import { Mail, Phone, Search } from 'lucide-react';
import { useAdminUI } from '../context/AdminUIContext';
import { formatPrice } from '../utils/formatters';
import { getSafeImageSrc } from '../utils/images';
export const CustomersPage: React.FC = () => {
    const { customers } = useAdminUI();
    const [search, setSearch] = useState('');
    const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search));
    return (<div className="space-y-6 font-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-[#382b31]">Registered Customers</h1>
          <p className="text-xs text-[#382b31]/50 font-medium">Customer contact information and total order metrics.</p>
        </div>
        <div className="relative max-w-xs w-full">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer name or phone..." className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#ecdfe4] bg-white outline-none"/>
          <Search className="w-4 h-4 text-[#382b31]/40 absolute left-3 top-2.5"/>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#ecdfe4]/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#382b31]/80">
            <thead className="bg-[#FFF4F6] text-[#382b31]/40 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 pl-6">Customer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Orders</th>
                <th className="p-4 pr-6 text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(cust => (<tr key={cust.id} className="hover:bg-[#FFF4F6]/80 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <img src={getSafeImageSrc(cust.avatar)} alt="" className="w-9 h-9 rounded-full object-cover border border-[#ecdfe4]"/>
                      <div>
                        <span className="font-heading font-bold text-[#382b31] block">{cust.name}</span>
                        <span className="text-[10px] text-[#382b31]/40">ID: {cust.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 space-y-0.5">
                    <span className="flex items-center gap-1 font-medium text-[#382b31]">
                      <Mail className="w-3 h-3 text-[#382b31]/40"/> {cust.email}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-[#382b31]/50">
                      <Phone className="w-3 h-3 text-[#382b31]/40"/> {cust.phone}
                    </span>
                  </td>
                  <td className="p-4 text-[#382b31]/50">{cust.joinedDate}</td>
                  <td className="p-4 font-bold text-[#673742]">{cust.ordersCount} order(s)</td>
                  <td className="p-4 pr-6 text-right font-heading font-black text-[#382b31]">{formatPrice(cust.totalSpent)}</td>
                </tr>))}
              {filtered.length === 0 && (<tr>
                  <td colSpan={5} className="p-12 text-center text-[#382b31]/40 text-sm">
                    No customers found matching your search.
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
};

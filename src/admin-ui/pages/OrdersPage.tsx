"use client";
import React, { useState, useEffect } from 'react';
import { Search, X, CheckCircle2, Trash2, Eye } from 'lucide-react';
import { useAdminUI } from '../context/AdminUIContext';
import { Order } from '../types';
import { uiRequest,orderFromAPI } from '../api';
import { formatPrice } from '../utils/formatters';
import { RoutineContents } from '../components/RoutineContents';
export const OrdersPage: React.FC = () => {
    const { orders, updateOrderStatus, updateOrderTracking, deleteOrder, showToast, confirm, activePageParams, activePage } = useAdminUI();
    const [page,setPage]=useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [trackingInput, setTrackingInput] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
    useEffect(()=>{setPage(1);},[searchQuery,activeTab]);
    useEffect(()=>{if(activePage==='orders'&&activePageParams?.id)void uiRequest('orders/'+encodeURIComponent(activePageParams.id)).then(data=>{const order=orderFromAPI(data);setSelectedOrder(order);setTrackingInput(order.trackingNumber||'');}).catch(error=>showToast(error.message,'error'));},[activePage,activePageParams,orders,showToast]);
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    const filteredOrders = orders.filter(o => {
        const matchesTab = activeTab === 'All'
            ? true
            : activeTab === 'Order Confirmed'
                ? (o.status === 'Order Confirmed' || o.status === 'Processing')
                : o.status === activeTab;
        const matchesSearch = [o.id, o.customerName, o.email, o.phone, o.status].some(value => (value || '').toLowerCase().includes(normalizedSearchQuery));
        return matchesTab && matchesSearch;
    });
    const pagedOrders=filteredOrders.slice((page-1)*25,page*25);
    const handleBulkStatusChange = async (newStatus: Order['status']) => {
        try {
            const accepted = await confirm({
                title: `Mark ${selectedOrderIds.size} orders as ${newStatus}?`,
                description: `All selected orders will be updated to ${newStatus}.`,
                confirmLabel: 'Update Status'
            });
            if (!accepted)
                return;
            await Promise.all(Array.from(selectedOrderIds).map(async (id) => await updateOrderStatus(id, newStatus)));
            showToast(`Updated ${selectedOrderIds.size} orders to ${newStatus}`, 'success');
            setSelectedOrderIds(new Set());
        }
        catch {
        }
    };
    const handleBulkDelete = async () => {
        try {
            const accepted = await confirm({
                title: 'Delete Selected Orders?',
                description: `Are you sure you want to delete ${selectedOrderIds.size} orders permanently?`,
                confirmLabel: 'Delete Orders',
                destructive: true
            });
            if (!accepted)
                return;
            await Promise.all(Array.from(selectedOrderIds).map(async (id) => await deleteOrder(id)));
            showToast(`Deleted ${selectedOrderIds.size} orders`, 'success');
            setSelectedOrderIds(new Set());
        }
        catch {
        }
    };
    const toggleSelectAll = () => {
        if (selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0) {
            setSelectedOrderIds(new Set());
        }
        else {
            setSelectedOrderIds(new Set(pagedOrders.map(o => o.id)));
        }
    };
    const toggleSelectOrder = (orderId: string) => {
        const next = new Set(selectedOrderIds);
        if (next.has(orderId))
            next.delete(orderId);
        else
            next.add(orderId);
        setSelectedOrderIds(next);
    };
    const handleSaveTracking = async (orderId: string) => {
        try {
            if (!trackingInput.trim())
                return;
            await updateOrderTracking(orderId, trackingInput.trim());
            if (selectedOrder) {
                setSelectedOrder({ ...selectedOrder, trackingNumber: trackingInput.trim() });
            }
        }
        catch {
        }
    };
    return (<div className="space-y-6 font-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-[#382b31]">Orders Management</h1>
          <p className="text-xs text-[#382b31]/50 font-medium">Fulfill customer orders, update delivery statuses, and issue tracking numbers.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="bg-white p-4 rounded-3xl border border-[#ecdfe4]/80 shadow-xs max-w-sm w-full sm:w-auto">
          <div className="relative">
            <input type="text" placeholder="Search order ID or customer..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#ecdfe4] outline-none"/>
            <Search className="w-4 h-4 text-[#382b31]/40 absolute left-3 top-2.5"/>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1.5 border border-[#ecdfe4]/80 shadow-xs overflow-x-auto w-full sm:w-auto">
          {['All', 'Pending', 'Order Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(tab => (<button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${activeTab === tab
                ? 'bg-[#382b31] text-white shadow-sm'
                : 'text-[#382b31]/50 hover:text-[#382b31]/80 hover:bg-[#FFF4F6]'}`}>
              {tab}
            </button>))}
        </div>
      </div>

      {/* Bulk action banner */}
      {selectedOrderIds.size > 0 && (<div className="bg-[#FFF4F6] border border-[#673742] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="text-xs font-bold text-[#673742] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4"/>
            {selectedOrderIds.size} Order{selectedOrderIds.size > 1 ? 's' : ''} Selected
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-[#673742] uppercase tracking-wider mr-2 hidden sm:inline">Bulk Status:</span>
            {(['Pending', 'Order Confirmed', 'Shipped', 'Delivered', 'Cancelled'] as Order['status'][]).map(st => (<button key={st} type="button" onClick={() => handleBulkStatusChange(st)} className="px-2.5 py-1 bg-white border border-[#ecdfe4] hover:bg-[#673742] hover:text-white rounded-lg text-xs font-bold text-[#382b31]/70 transition-colors">
                {st}
              </button>))}
            <button type="button" onClick={handleBulkDelete} className="px-2.5 py-1 bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-colors ml-2">
              <Trash2 className="w-3.5 h-3.5 inline mr-1"/>
              Delete Selected
            </button>
          </div>
        </div>)}

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#ecdfe4]/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#382b31]/80">
            <thead className="bg-[#FFF4F6] text-[#382b31]/40 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 pl-6 w-10">
                  <input type="checkbox" checked={selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0} onChange={toggleSelectAll} className="rounded text-[#673742]"/>
                </th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Total (PKR)</th>
                <th className="p-4">Status</th>
                <th className="p-4">Tracking #</th>
                <th className="p-4 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(order => {
            const isSelected = selectedOrderIds.has(order.id);
            return (<tr key={order.id} className={`hover:bg-[#FFF4F6]/80 transition-colors ${isSelected ? 'bg-[#FFF4F6]/40' : ''}`}>
                    <td className="p-4 pl-6">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelectOrder(order.id)} className="rounded text-[#673742]"/>
                    </td>
                    <td className="p-4 font-mono font-bold text-[#382b31]">{order.id}</td>
                    <td className="p-4">
                      <span className="font-bold text-[#382b31] block">{order.customerName || 'Customer'}</span>
                      <span className="text-[10px] text-[#382b31]/50 block">{order.email || order.phone || 'Guest'}</span>
                    </td>
                    <td className="p-4 text-[#382b31]/60">{order.date}</td>
                    <td className="p-4 font-bold text-[#382b31]">{formatPrice(order.total)}</td>
                    <td className="p-4">
                      {(() => {
                        const currentStatus = order.status === 'Processing' ? 'Order Confirmed' : order.status;
                        return (
                          <select value={currentStatus} onChange={async (e) => await updateOrderStatus(order.id, e.target.value as any)} className={`px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wide border outline-none ${currentStatus === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : (currentStatus === 'Shipped' || currentStatus === 'Order Confirmed')
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : currentStatus === 'Cancelled'
                                    ? 'bg-red-50 text-red-800 border-red-200'
                                    : 'bg-[#FFF4F6] text-[#673742] border-[#ecdfe4]'}`}>
                            <option value="Pending">Pending</option>
                            <option value="Order Confirmed">Order Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        );
                      })()}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-[#382b31]/60">
                      {order.trackingNumber || '—'}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button type="button" onClick={async () => {
                    try{setSelectedOrder(orderFromAPI(await uiRequest('orders/'+encodeURIComponent(order.id))));setTrackingInput(order.trackingNumber || '');}catch(error){showToast(error instanceof Error?error.message:'Could not load order.','error');}
                }} className="p-1.5 text-[#673742] hover:bg-[#FFF4F6] rounded-lg transition-colors" title="View Order Details">
                        <Eye className="w-4 h-4"/>
                      </button>
                    </td>
                  </tr>);
        })}

              {filteredOrders.length === 0 && (<tr>
                  <td colSpan={8} className="p-12 text-center text-[#382b31]/40 text-sm">
                    No orders match your filter criteria.
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="rounded-xl border border-[#ecdfe4] px-4 py-2">Previous</button><span>Page {page} of {Math.max(1,Math.ceil(filteredOrders.length/25))}</span><button disabled={page>=Math.ceil(filteredOrders.length/25)} onClick={()=>setPage(p=>p+1)} className="rounded-xl border border-[#ecdfe4] px-4 py-2">Next</button></div>
      {/* Order Detail Modal */}
      {selectedOrder && (() => {
        const displayStatus = selectedOrder.status === 'Processing' ? 'Order Confirmed' : selectedOrder.status;
        const customerName = selectedOrder.customerName || selectedOrder.shippingAddress?.fullName || 'Not provided';
        const customerEmail = selectedOrder.email || 'Not provided';
        const customerPhone = selectedOrder.phone || selectedOrder.shippingAddress?.phone || 'Not provided';
        const shipping = selectedOrder.shippingAddress || {} as any;
        const street = shipping.street || 'Not provided';
        const city = shipping.city || 'Not provided';
        const province = shipping.province || shipping.state || 'Not provided';
        const notes = shipping.notes || selectedOrder.notes || 'None';
        const paymentMethod = selectedOrder.paymentMethod || 'Cash on Delivery (COD)';
        const paymentStatus = displayStatus === 'Delivered'
          ? 'Paid (COD Collected)'
          : displayStatus === 'Cancelled'
            ? 'Cancelled'
            : 'Unpaid (Due on Delivery)';
        const formattedDate = selectedOrder.createdAt
          ? new Date(selectedOrder.createdAt).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })
          : (selectedOrder.date || 'Not provided');

        return (
          <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-black/60 p-4">
            <div className="my-auto w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#ecdfe4] max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#ecdfe4] pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-[#673742] uppercase">Order #{selectedOrder.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      displayStatus === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : (displayStatus === 'Shipped' || displayStatus === 'Order Confirmed')
                          ? 'bg-blue-100 text-blue-800'
                          : displayStatus === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                    }`}>
                      {displayStatus}
                    </span>
                  </div>
                  <h3 className="font-heading font-black text-xl text-[#382b31] mt-1.5">{customerName}</h3>
                  <span className="text-xs text-[#382b31]/60 block mt-0.5">Placed on: {formattedDate}</span>
                </div>
                <button type="button" onClick={() => setSelectedOrder(null)} className="p-2 text-[#382b31]/40 hover:bg-[#FFF4F6] rounded-xl transition-colors">
                  <X className="w-5 h-5"/>
                </button>
              </div>

              {/* Customer and Delivery Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Customer Information */}
                <div className="bg-[#FFF4F6] p-4 rounded-2xl border border-[#ecdfe4] space-y-2.5">
                  <span className="text-[10px] font-bold text-[#673742] uppercase tracking-wider block border-b border-[#ecdfe4]/60 pb-1">
                    Customer Details
                  </span>
                  <div>
                    <span className="text-[10px] text-[#382b31]/50 block font-medium">Customer Name</span>
                    <span className="text-xs font-bold text-[#382b31] block">{customerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#382b31]/50 block font-medium">Email Address</span>
                    <span className="text-xs font-bold text-[#382b31] block break-all">{customerEmail}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#382b31]/50 block font-medium">Mobile Phone</span>
                    <span className="text-xs font-bold text-[#382b31] block">{customerPhone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#382b31]/50 block font-medium">Account Type</span>
                    <span className="text-xs font-semibold text-[#673742] block">
                      {selectedOrder.user_id ? 'Registered Account' : 'Guest Checkout'}
                    </span>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-[#FFF4F6] p-4 rounded-2xl border border-[#ecdfe4] space-y-2.5">
                  <span className="text-[10px] font-bold text-[#673742] uppercase tracking-wider block border-b border-[#ecdfe4]/60 pb-1">
                    Shipping Address
                  </span>
                  <div>
                    <span className="text-[10px] text-[#382b31]/50 block font-medium">Recipient Name</span>
                    <span className="text-xs font-bold text-[#382b31] block">{shipping.fullName || customerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#382b31]/50 block font-medium">Street Address</span>
                    <p className="text-xs text-[#382b31]/90 font-medium leading-relaxed">{street}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-[#382b31]/50 block font-medium">City</span>
                      <span className="text-xs font-bold text-[#382b31] block">{city}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#382b31]/50 block font-medium">Province</span>
                      <span className="text-xs font-bold text-[#382b31] block">{province}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#382b31]/50 block font-medium">Delivery Instructions / Notes</span>
                    <p className="text-xs text-[#382b31]/70 italic leading-relaxed">{notes}</p>
                  </div>
                </div>
              </div>

              {/* Payment and Billing Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-[#ecdfe4] mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#382b31]/50 block font-medium">Payment Method</span>
                  <span className="font-bold text-[#382b31]">{paymentMethod}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#382b31]/50 block font-medium">Payment Status</span>
                  <span className={`font-bold ${displayStatus === 'Delivered' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {paymentStatus}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#382b31]/50 block font-medium">Billing Address</span>
                  <span className="text-[#382b31]/80">Same as shipping address</span>
                </div>
              </div>

              {/* Courier Tracking form */}
              <div className="mb-6 p-4 rounded-2xl border border-[#ecdfe4] bg-white">
                <label className="block text-xs font-bold text-[#382b31]/80 mb-2">Courier Tracking Code</label>
                <div className="flex gap-2">
                  <input type="text" value={trackingInput} onChange={e => setTrackingInput(e.target.value)} placeholder="e.g. TCS-987654321" className="flex-1 text-xs rounded-xl border border-[#ecdfe4] px-3 py-2 font-mono outline-none"/>
                  <button type="button" onClick={() => handleSaveTracking(selectedOrder.id)} className="px-4 py-2 bg-[#673742] text-white rounded-xl text-xs font-bold hover:bg-[#522b34] transition-colors">
                    Save Tracking
                  </button>
                </div>
              </div>

              {/* Ordered Items */}
              <div className="space-y-3 mb-6">
                <h4 className="font-heading font-black text-sm text-[#382b31]">Ordered Items</h4>
                <div className="divide-y divide-[#ecdfe4]/60 border border-[#ecdfe4] rounded-2xl overflow-hidden">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="p-3.5 bg-white flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image && item.image.trim() ? (
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl border border-[#ecdfe4] bg-slate-50 shrink-0"/>
                        ) : (
                          <div className="w-12 h-12 rounded-xl border border-[#ecdfe4] bg-[#FFF4F6] flex items-center justify-center text-[#673742] shrink-0 font-bold text-xs">
                            {item.name ? item.name.slice(0, 2).toUpperCase() : 'LV'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-[#382b31] block truncate">{item.name}</span>
                          {item.selectedAttributes && (
                            <span className="text-[10px] text-[#673742] block font-semibold">
                              {Object.entries(item.selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(', ')}
                            </span>
                          )}
                          <span className="text-[11px] text-[#382b31]/60 block">Qty: {item.quantity} × {formatPrice(item.price)}</span>
                          <RoutineContents components={item.routineComponents}/>
                        </div>
                      </div>
                      <span className="font-bold text-xs text-[#382b31] shrink-0">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status History */}
              <section className="rounded-2xl border border-[#ecdfe4] p-4 mb-6 bg-white">
                <h4 className="font-bold text-sm mb-3 text-[#382b31]">Status History</h4>
                {selectedOrder.statusHistory?.length ? (
                  <div className="divide-y divide-[#ecdfe4]/60">
                    {selectedOrder.statusHistory.map(entry => {
                      const historyDisplayStatus = entry.status === 'Processing' ? 'Order Confirmed' : entry.status;
                      return (
                        <div key={entry.id} className="text-xs py-2">
                          <div className="flex items-center justify-between">
                            <strong className="text-[#382b31]">{historyDisplayStatus}</strong>
                            <span className="text-[10px] text-[#382b31]/50">{new Date(entry.timestamp).toLocaleString()}</span>
                          </div>
                          {entry.note && <p className="text-[11px] text-[#382b31]/70 mt-0.5">{entry.note}</p>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#382b31]/50">No status history available.</p>
                )}
              </section>

              {/* Totals */}
              <div className="bg-[#FFF4F6] p-4 rounded-2xl border border-[#ecdfe4] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#382b31]/70">
                  <span>Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#382b31]/70">
                  <span>Delivery Charges</span>
                  <span>{selectedOrder.shipping === 0 ? 'FREE' : formatPrice(selectedOrder.shipping)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-[#673742] font-semibold">
                    <span>Discount</span>
                    <span>-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-[#382b31] pt-2 border-t border-[#ecdfe4]">
                  <span>Total Amount</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>);
};

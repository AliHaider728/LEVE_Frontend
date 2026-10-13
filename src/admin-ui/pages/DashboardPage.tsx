"use client";
import React from 'react';
import { DollarSign, ShoppingBag, Package, Users, AlertTriangle, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useAdminUI } from '../context/AdminUIContext';
import { orderFromAPI } from '../api';
import { formatPrice } from '../utils/formatters';
export const DashboardPage: React.FC = () => {
    const { products, setActivePage, dashboard } = useAdminUI();
    const totalRevenue = Number(dashboard?.revenue || 0);
    const orders: import('../types').Order[] = (dashboard?.recentOrders || []).map(orderFromAPI);
    const lowStockProducts = products.filter(p => p.trackInventory && (p.stockQuantity ?? 0) < 20);
    return (<div className="max-w-7xl mx-auto space-y-8 font-heading pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#382b31] tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-[#382b31]/60 mt-2 max-w-2xl">Real-time summary of sales revenue, inventory health, and recent customer orders.</p>
        </div>
        <button type="button" onClick={() => setActivePage('product-new')} className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#673742] to-[#673742] hover:to-[#673742] shadow-md transition-all text-sm shrink-0">
          + Add New Product
        </button>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockProducts.length > 0 && (<div className="bg-[#FFF4F6] border border-[#ecdfe4] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#673742] shadow-sm">
          <div className="flex items-center gap-3 font-semibold">
            <AlertTriangle className="w-5 h-5 text-[#673742] shrink-0"/>
            <span>Low Stock Alert: {lowStockProducts.length} product(s) have fewer than 20 units remaining.</span>
          </div>
          <button type="button" onClick={() => setActivePage('products')} className="font-bold underline text-[#673742] hover:text-[#673742] whitespace-nowrap text-left">
            Manage Inventory &rarr;
          </button>
        </div>)}

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#ecdfe4] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFF4F6] rounded-bl-full -mr-10 -mt-10 opacity-50 transition-transform group-hover:scale-110"/>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[11px] font-bold text-[#382b31]/50 uppercase tracking-wider block">
                Total Revenue
              </span>
              <span className="font-heading font-black text-3xl text-[#382b31] mt-2 block tracking-tight">
                {formatPrice(totalRevenue)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#FFF4F6] text-[#673742] shadow-inner">
              <DollarSign className="w-5 h-5"/>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#673742] flex items-center gap-1 mt-4 relative z-10">
            <TrendingUp className="w-3.5 h-3.5"/> Delivered COD orders
          </span>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#ecdfe4] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFF4F6] rounded-bl-full -mr-10 -mt-10 opacity-50 transition-transform group-hover:scale-110"/>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[11px] font-bold text-[#382b31]/50 uppercase tracking-wider block">
                Total Orders
              </span>
              <span className="font-heading font-black text-3xl text-[#382b31] mt-2 block tracking-tight">
                {dashboard?.orders || 0}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#FFF4F6] text-[#673742] shadow-inner">
              <ShoppingBag className="w-5 h-5"/>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#673742] flex items-center gap-1 mt-4 relative z-10">
            <ArrowUpRight className="w-3.5 h-3.5"/> Live order count
          </span>
        </div>

        {/* Products Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#ecdfe4] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFF4F6] rounded-bl-full -mr-10 -mt-10 opacity-50 transition-transform group-hover:scale-110"/>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[11px] font-bold text-[#382b31]/50 uppercase tracking-wider block">
                Active Products
              </span>
              <span className="font-heading font-black text-3xl text-[#382b31] mt-2 block tracking-tight">
                {dashboard?.products || 0}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#FFF4F6] text-[#673742] shadow-inner">
              <Package className="w-5 h-5"/>
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#382b31]/50 mt-4 block relative z-10">
            Across your entire catalog
          </span>
        </div>

        {/* Customers Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#ecdfe4] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFF4F6] rounded-bl-full -mr-10 -mt-10 opacity-50 transition-transform group-hover:scale-110"/>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[11px] font-bold text-[#382b31]/50 uppercase tracking-wider block">
                Registered Customers
              </span>
              <span className="font-heading font-black text-3xl text-[#382b31] mt-2 block tracking-tight">
                {dashboard?.customers || 0}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#FFF4F6] text-[#673742] shadow-inner">
              <Users className="w-5 h-5"/>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#673742] flex items-center gap-1 mt-4 relative z-10">
            Registered customer accounts
          </span>
        </div>
      </div>

      {/* Main Content Area (Chart + Table) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Trend Visual Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-[#ecdfe4] shadow-sm flex flex-col xl:col-span-2 relative">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-heading font-black text-lg text-[#382b31]">Weekly Revenue Breakdown</h3>
              <p className="text-xs text-[#382b31]/50 mt-1">Delivered COD revenue across the last 7 days</p>
            </div>
            <span className="px-3 py-1 bg-[#FFF4F6] rounded-md text-xs font-semibold text-[#382b31]/60 border border-[#ecdfe4]">Last 7 Days</span>
          </div>

          <div className="relative h-64 flex items-end justify-between gap-2 sm:gap-4 mt-auto">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
              <div className="w-full border-t border-dashed border-[#ecdfe4]/50"/>
              <div className="w-full border-t border-dashed border-[#ecdfe4]/50"/>
              <div className="w-full border-t border-dashed border-[#ecdfe4]/50"/>
              <div className="w-full border-t border-[#ecdfe4]"/>
            </div>

            {(dashboard?.weekly || []).map((entry: any) => ({ day: new Date(entry.day).toLocaleDateString('en', { weekday: 'short' }), val: Number(entry.revenue) })).map((bar: any) => (<div key={bar.day} className="flex-1 flex flex-col items-center gap-3 group relative z-10 h-full justify-end">
                <span className="text-[10px] font-bold text-[#673742] opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 bg-white px-2 py-1 rounded shadow-sm border border-[#ecdfe4]">
                  {formatPrice(bar.val)}
                </span>
                <div className="w-full max-w-[48px] bg-gradient-to-t from-[#673742] to-[#f27da0] rounded-t-lg transition-all duration-300 group-hover:brightness-110 shadow-sm" style={{ height: `${(bar.val / Math.max(1, ...(dashboard?.weekly || []).map((row: any) => Number(row.revenue)))) * 100}%` }}/>
                <span className="text-xs font-bold text-[#382b31]/60">{bar.day}</span>
              </div>))}
          </div>
        </div>

        {/* Quick Actions / Summary Sidebar */}
        <div className="bg-[#FFF4F6] p-6 rounded-2xl border border-[#ecdfe4] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-black text-lg text-[#382b31]">Store Status</h3>
            <p className="text-xs text-[#382b31]/50 mt-1">Live metrics summary</p>

            <div className="mt-8 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-[#ecdfe4]">
                <span className="text-sm font-semibold text-[#382b31]/70">Pending Orders</span>
                <span className="text-sm font-bold text-[#673742] bg-[#FFF4F6] px-2.5 py-1 rounded-md">{dashboard?.pending || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-[#ecdfe4]">
                <span className="text-sm font-semibold text-[#382b31]/70">Out of Stock</span>
                <span className="text-sm font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md">{dashboard?.outOfStock || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-[#ecdfe4]">
                <span className="text-sm font-semibold text-[#382b31]/70">Active Customers</span>
                <span className="text-sm font-bold text-[#673742] bg-[#FFF4F6] px-2.5 py-1 rounded-md">{dashboard?.customers || 0}</span>
              </div>
            </div>
          </div>

          <button type="button" onClick={() => setActivePage('settings')} className="mt-8 text-center text-xs font-bold text-[#673742] hover:text-[#673742] underline transition-colors">
            Manage Store Configuration &rarr;
          </button>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-[#ecdfe4] shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#ecdfe4] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <div>
            <h3 className="font-heading font-black text-lg text-[#382b31]">Recent Customer Orders</h3>
            <p className="text-xs text-[#382b31]/50 mt-1">Latest transactions awaiting fulfillment</p>
          </div>
          <button type="button" onClick={() => setActivePage('orders')} className="text-xs font-bold text-[#673742] bg-[#FFF4F6] px-4 py-2 rounded-xl hover:bg-[#ecdfe4] transition-colors">
            View All Orders
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#382b31]/80">
            <thead className="bg-[#FFF4F6] text-[#382b31]/50 border-y border-[#ecdfe4] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 pl-6">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ecdfe4]/50">
              {orders.slice(0, 5).map(order => (<tr key={order.id} className="hover:bg-[#FFF4F6]/50 transition-colors group">
                  <td className="p-4 pl-6 font-heading font-bold text-[#382b31]">{order.id}</td>
                  <td className="p-4 font-medium">{order.customerName}</td>
                  <td className="p-4 text-[#382b31]/50 text-xs">{order.date}</td>
                  <td className="p-4 font-bold text-[#382b31]">{formatPrice(order.total)}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide inline-block ${order.status === 'Delivered' ? 'bg-[#FFF4F6] text-[#673742] border border-[#ecdfe4]' :
                (order.status === 'Shipped' || order.status === 'Processing') ? 'bg-[#FFF4F6] text-[#673742] border border-[#ecdfe4]' :
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-[#FFF4F6] text-[#673742] border border-[#ecdfe4]'}`}>
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button type="button" onClick={() => setActivePage('orders')} className="text-xs font-bold text-[#673742] hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details
                    </button>
                  </td>
                </tr>))}
              {orders.length === 0 && (<tr>
                  <td colSpan={6} className="p-8 text-center text-[#382b31]/40 text-sm font-medium">
                    No orders found.
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
};

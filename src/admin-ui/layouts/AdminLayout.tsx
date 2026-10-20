"use client";
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Layers, ShoppingBag, Users, Star, MessageSquare, Percent, Settings, Boxes, Sliders, BarChart3, Mic, Sparkles, LayoutTemplate, LogOut, Bell, Menu, X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useAdminUI } from '../context/AdminUIContext';
import { pageModule } from '../api';
import { AdminPage } from '../types';
export const AdminLayout: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const { activePage, setActivePage, adminUser, logout, showToast, modules, dashboard } = useAdminUI();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    useEffect(() => {
        const saved = localStorage.getItem('leva_admin_sidebar_collapsed');
        if (saved !== null) {
            setCollapsed(saved === 'true');
        }
    }, []);
    const toggleCollapse = () => {
        setCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('leva_admin_sidebar_collapsed', String(next));
            return next;
        });
    };
    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' as AdminPage },
        { label: 'Products', icon: Package, page: 'products' as AdminPage },
        { label: 'Best Sellers', icon: Sparkles, page: 'best-sellers' as AdminPage },
        { label: 'Categories', icon: Layers, page: 'categories' as AdminPage },
        { label: 'Attributes', icon: Sliders, page: 'attributes' as AdminPage },
        { label: 'Orders', icon: ShoppingBag, page: 'orders' as AdminPage },
        { label: 'Customers', icon: Users, page: 'customers' as AdminPage },
        { label: 'Reviews', icon: Star, page: 'reviews' as AdminPage },
        { label: 'Voice Reviews', icon: Mic, page: 'audio-reviews' as AdminPage },
        { label: 'Contact Messages', icon: MessageSquare, page: 'contact-messages' as AdminPage },
        { label: 'Bundles', icon: Boxes, page: 'bundles' as AdminPage },
        { label: 'Coupons & Deals', icon: Percent, page: 'coupons' as AdminPage },
        { label: 'Sales Reports', icon: BarChart3, page: 'reports' as AdminPage },
        { label: 'Store Settings', icon: Settings, page: 'settings' as AdminPage },
        { label: 'Routine Discounts', icon: Percent, page: 'routine-discounts' as AdminPage },
        ...(adminUser?.role === 'super_admin' ? [
            { label: 'Store Appearance', icon: LayoutTemplate, page: 'store-appearance' as AdminPage }
        ] : [])
    ];
    const handleLogout = async () => {
        try {
            try {
                await logout();
            }
            catch (error) {
                showToast(error instanceof Error ? error.message : 'Logout failed.', 'error');
            }
        }
        catch {
        }
    };
    if (adminUser?.role === 'super_admin')
        navItems.push({ label: 'Feature Management', icon: Sliders, page: 'feature-management' as AdminPage });
    const currentNav = navItems.find(n => n.page === activePage) || { label: 'Administration' };
    return (<div className="flex h-screen overflow-hidden bg-[#FFF4F6] font-body text-[#382b31]">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (<div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden" onClick={() => setMobileMenuOpen(false)}/>)}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#ecdfe4] bg-[#FFF4F6] transition-all duration-300 lg:static ${collapsed ? 'lg:w-[72px]' : 'lg:w-64'} ${mobileMenuOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#ecdfe4] px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <img src="https://pub-a072adc556d047e0bacc05300ca63f83.r2.dev/images/LEVA-logo.png" alt="LEVA" className="h-10 w-16 shrink-0 object-contain"/>
            {(!collapsed || mobileMenuOpen) && (<div className="truncate">
                <span className="font-heading font-black tracking-wider text-base uppercase text-[#382b31] block">
                  LEVA
                </span>
                <span className="text-[10px] font-bold text-[#382b31]/40 uppercase tracking-widest block -mt-0.5">
                  Admin Panel
                </span>
              </div>)}
          </div>

          <button type="button" onClick={toggleCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-[#382b31]/40 hover:bg-[#FFF4F6] hover:text-[#382b31]">
            {collapsed ? <ChevronRight className="h-4 w-4"/> : <ChevronLeft className="h-4 w-4"/>}
          </button>

          <button type="button" onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-1.5 text-[#382b31]/60">
            <X className="h-5 w-5"/>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3 custom-scrollbar">
          {navItems.filter(item => !pageModule[item.page] || modules[pageModule[item.page]]).map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.page ||
                (item.page === 'products' && (activePage === 'product-new' || activePage === 'product-edit')) ||
                (item.page === 'bundles' && (activePage === 'bundle-new' || activePage === 'bundle-edit'));
            return (<button key={item.label} type="button" onClick={() => {
                    setActivePage(item.page);
                    setMobileMenuOpen(false);
                }} title={collapsed ? item.label : undefined} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${isActive
                    ? 'bg-gradient-to-r from-[#673742] to-[#673742] text-white shadow-md shadow-[#673742]/20'
                    : 'text-[#382b31]/70 hover:bg-white/70 hover:text-[#382b31]'}`}>
                <Icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#673742]'}`}/>
                {(!collapsed || mobileMenuOpen) && <span className="truncate">{item.label}</span>}
              </button>);
        })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-[#ecdfe4] p-3 space-y-1">
          <button type="button" onClick={() => window.location.assign('/')} title={collapsed ? 'Live Storefront' : undefined} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-[#382b31]/60 hover:bg-white/70">
            <ExternalLink className="h-4 w-4 shrink-0 text-[#382b31]/40"/>
            {(!collapsed || mobileMenuOpen) && <span>Live Storefront</span>}
          </button>

          <button type="button" onClick={handleLogout} title={collapsed ? 'Sign Out' : undefined} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4 shrink-0"/>
            {(!collapsed || mobileMenuOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#ecdfe4] bg-white px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu" className="lg:hidden rounded-lg p-2 text-[#382b31]/60 hover:bg-[#FFF4F6]">
              <Menu className="h-5 w-5"/>
            </button>
            <h1 className="min-w-0 truncate font-heading font-black text-lg text-[#382b31] capitalize">
              {currentNav.label}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <button type="button" onClick={() => showToast(dashboard ? `${dashboard.pending} pending orders` : 'Notification data is unavailable', 'info')} className="relative rounded-xl border border-[#ecdfe4] p-2 text-[#382b31]/60 hover:bg-[#FFF4F6]" title="Notifications">
              <Bell className="h-4 w-4"/>
              {Number(dashboard?.pending)>0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#673742]"/>}
            </button>

            <div className="flex items-center gap-2.5 border-l border-[#ecdfe4] pl-3 sm:pl-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#673742] to-[#673742] font-heading font-bold text-xs text-white shadow-sm">
                {(adminUser?.name||'Administrator').split(' ').map(part=>part[0]).slice(0,2).join('').toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-[#382b31] leading-tight">
                  {adminUser?.name || 'Administrator'}
                </span>
                <span className="block text-[10px] font-medium text-[#382b31]/40 uppercase tracking-wider">
                  {adminUser?.role === 'super_admin' ? 'Super Admin' : 'Staff Admin'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>);
};

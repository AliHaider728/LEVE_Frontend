"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pageModule, requirementsForPage } from './api';
import { FeatureManagementPage } from './pages/FeatureManagementPage';
import { ToastAndDialog } from './components/ToastAndDialog';
import { AdminContentSkeleton, AdminEntrySkeleton } from './components/AdminLoadingSkeleton';
import { useAdminUI } from './context/AdminUIContext';
import { AdminLayout } from './layouts/AdminLayout';
// Import all Admin UI Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsListPage } from './pages/ProductsListPage';
import { ProductFormPage } from './pages/ProductFormPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { GlobalAttributesPage } from './pages/GlobalAttributesPage';
import { OrdersPage } from './pages/OrdersPage';
import { CustomersPage } from './pages/CustomersPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { AudioReviewsPage } from './pages/AudioReviewsPage';
import { ContactMessagesPage } from './pages/ContactMessagesPage';
import { BundlesListPage } from './pages/BundlesListPage';
import { BundleFormPage } from './pages/BundleFormPage';
import { CouponsPage } from './pages/CouponsPage';
import { ReportsPage } from './pages/ReportsPage';
import { StoreSettingsPage } from './pages/StoreSettingsPage';
import { RoutineDiscountsPage } from './pages/RoutineDiscountsPage';
import { BestSellersPage } from './pages/BestSellersPage';
import { StoreAppearancePage } from './pages/StoreAppearancePage';
/**
 * Inner Router component that reads `activePage` and `adminUser`
 * from the AdminUIContext and renders the appropriate page.
 */
const AdminRouter: React.FC = () => {
    const { activePage, activePageParams, adminUser, loading, errors, modules, reload, moduleLoading, loadedModules } = useAdminUI();
    const router = useRouter();
    useEffect(() => { if (adminUser && (activePage as string) === 'login')
        router.replace('/admin'); }, [adminUser, activePage, router]);
    if (loading)
        return <AdminEntrySkeleton/>;
    if(errors.session)return <div role="alert" className="p-8"><h1 className="font-bold mb-3">Could not load the admin panel</h1>{errors.session}<button onClick={()=>void reload()} className="ml-4 underline">Try again</button></div>;
    if(!adminUser)return <><LoginPage/><ToastAndDialog/></>;
    const activeModule = pageModule[activePage];
    if ((activeModule && !modules[activeModule]) || (activePage === 'feature-management' && adminUser.role !== 'super_admin'))
        return <AdminLayout><p role="alert">This admin module is unavailable.</p><ToastAndDialog /></AdminLayout>;
    const required=requirementsForPage(activePage).filter(key=>key==='dashboard'||modules[key]);
    const failed=required.find(key=>errors[key]);
    if(failed)return <AdminLayout><div role="alert">{errors[failed]}<button onClick={()=>void reload()} className="ml-4 underline">Try again</button></div><ToastAndDialog/></AdminLayout>;
    if(required.some(key=>!loadedModules[key]||moduleLoading[key]&&!loadedModules[key]))return <AdminLayout><AdminContentSkeleton/></AdminLayout>;
    // If user is not authenticated in local state, display Login page
    if (!adminUser) {
        return <LoginPage />;
    }
    // Active page router
    const renderCurrentPage = () => {
        switch (activePage) {
            case 'feature-management':
                return <FeatureManagementPage />;
            case 'dashboard':
                return <DashboardPage />;
            case 'products':
                return <ProductsListPage />;
            case 'product-new':
            case 'product-edit':
                return <ProductFormPage key={activePage+String(activePageParams?.id||'')} />;
            case 'best-sellers':
                return <BestSellersPage />;
            case 'categories':
                return <CategoriesPage />;
            case 'attributes':
                return <GlobalAttributesPage />;
            case 'orders':
                return <OrdersPage />;
            case 'customers':
                return <CustomersPage />;
            case 'reviews':
                return <ReviewsPage />;
            case 'audio-reviews':
                return <AudioReviewsPage />;
            case 'contact-messages':
                return <ContactMessagesPage />;
            case 'bundles':
                return <BundlesListPage />;
            case 'bundle-new':
            case 'bundle-edit':
                return <BundleFormPage key={activePage+String(activePageParams?.id||'')} />;
            case 'coupons':
                return <CouponsPage />;
            case 'reports':
                return <ReportsPage />;
            case 'settings':
                return <StoreSettingsPage />;
            case 'routine-discounts':
                return <RoutineDiscountsPage />;
            case 'store-appearance':
                return <StoreAppearancePage />;
            default:
                return <DashboardPage />;
        }
    };
    return (<AdminLayout>
      {renderCurrentPage()}<ToastAndDialog />
    </AdminLayout>);
};
/**
 * Top-level standalone entry point for the extracted Admin UI.
 * Uses authenticated backend APIs through AdminUIProvider.
 */
export const AdminApp: React.FC = () => <AdminRouter />;
export default AdminApp;

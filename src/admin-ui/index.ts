/**
 * LEVA / Leva Admin Panel UI (Isolated & Portable)
 *
 * Standalone frontend admin panel UI with ZERO backend or external API connections.
 * Integrated with the existing backend and cookie session.
 * and high-fidelity replications of all LEVA Admin pages and components.
 */

// Root App
export { AdminApp, default } from './AdminApp';

// Layout
export { AdminLayout } from './layouts/AdminLayout';

// State & Context
export { AdminUIProvider, useAdminUI } from './context/AdminUIContext';

// Types & Models
export * from './types';

// Mock Datasets


// Utilities
export { formatPrice, formatPKR, parsePriceNumber } from './utils/formatters';
export { getSafeImageSrc, PLACEHOLDER_SVG } from './utils/images';

// Reusable Components
export { ToastContainer, ConfirmationDialog } from './components/ToastAndDialog';
export { Switch } from './components/Switch';
export { Toggle } from './components/Toggle';
export { RoutineContents } from './components/RoutineContents';
export { AnimatedButton } from './components/AnimatedButton';
export { AttributesManager } from './components/attributes/AttributesManager';
export { VariationsGenerator } from './components/attributes/VariationsGenerator';
export { VariationImageModal } from './components/products/VariationImageModal';
export { PricingOffersSection } from './components/products/PricingOffersSection';
export { ProductDetailContentBuilder } from './components/products/ProductDetailContentBuilder';
export { CategoryFormModal } from './components/categories/CategoryFormModal';
export { BundleGalleryImages } from './components/bundles/BundleGalleryImages';
export { AdminProductReviewsSection } from './components/reviews/AdminProductReviewsSection';

// Individual Pages
export { LoginPage } from './pages/LoginPage';
export { DashboardPage } from './pages/DashboardPage';
export { ProductsListPage } from './pages/ProductsListPage';
export { ProductFormPage } from './pages/ProductFormPage';
export { CategoriesPage } from './pages/CategoriesPage';
export { GlobalAttributesPage } from './pages/GlobalAttributesPage';
export { OrdersPage } from './pages/OrdersPage';
export { CustomersPage } from './pages/CustomersPage';
export { ReviewsPage } from './pages/ReviewsPage';
export { AudioReviewsPage } from './pages/AudioReviewsPage';
export { ContactMessagesPage } from './pages/ContactMessagesPage';
export { BundlesListPage } from './pages/BundlesListPage';
export { BundleFormPage } from './pages/BundleFormPage';
export { CouponsPage } from './pages/CouponsPage';
export { ReportsPage } from './pages/ReportsPage';
export { StoreSettingsPage } from './pages/StoreSettingsPage';
export { RoutineDiscountsPage } from './pages/RoutineDiscountsPage';
export { BestSellersPage } from './pages/BestSellersPage';
export { StoreAppearancePage } from './pages/StoreAppearancePage';

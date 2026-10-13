export type AgeGroupCategory = '0-2' | '3-5' | '6-8' | '9-12' | '13+';

export type ProductDetailBlockType =
  | 'heading' | 'richText' | 'image' | 'imageText' | 'fullWidthImage'
  | 'gallery' | 'featureCards' | 'iconText' | 'benefitsList' | 'whatsIncluded'
  | 'recommendedAge' | 'giftBadges' | 'divider' | 'spacer' | 'ctaBanner' | 'html';

export type StockStatus = 'in_stock' | 'out_of_stock';

export interface ProductDetailBlock {
  id: string;
  type: ProductDetailBlockType;
  enabled: boolean;
  order: number;
  heading?: string;
  content?: string;
  items?: Record<string, any>[];
  images?: {
    secureUrl: string;
    publicId: string;
    alt: string;
    caption?: string;
    newlyUploaded?: boolean;
    file?: File;
  }[];
  image?: {
    secureUrl: string;
    publicId: string;
    alt: string;
    caption?: string;
    newlyUploaded?: boolean;
    file?: File;
  };
  settings?: {
    width?: 'full' | 'large' | 'medium';
    alignment?: 'left' | 'center' | 'right';
    background?: string;
    spacing?: 'none' | 'small' | 'medium' | 'large';
    responsiveVisibility?: 'all' | 'desktop' | 'mobile';
    imagePosition?: 'left' | 'right';
    columns?: 2 | 3 | 4;
  };
}

export interface ProductAttributeTerm {
  id: string;
  label: string;
  slug: string;
  soldCount?: number;
  value: string;
  colorValue?: string;
  imageUrl?: string;
  imageAlt?: string;
  position: number;
  isArchived?: boolean;
}

export interface ProductAttribute {
  source: 'global' | 'custom';
  globalAttributeId?: string;
  id: string;
  name: string;
  slug: string;
  displayType: 'dropdown' | 'buttons' | 'radio' | 'color_swatches' | 'image_swatches';
  terms: ProductAttributeTerm[];
  selectedTermIds?: string[];
  visible: boolean;
  usedForVariations: boolean;
  position: number;
  displayTypeOverride?: string;
}

export interface ProductVariation {
  id: string;
  attributes: Record<string, string>;
  enabled: boolean;
  sku?: string;
  regularPrice: number;
  salePrice?: number;
  image?: {
    url: string;
    publicId?: string;
    alt?: string;
  };
  manageStock: boolean;
  stockQuantity?: number | null;
  lowStockThreshold?: number | null;
  stockStatus: StockStatus;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  description?: string;
}

export type DeliveryChargeType = 'store_threshold' | 'category' | 'fixed' | 'free' | 'none';

export interface QuantityBreakTier {
  minQty: number;
  pricePerUnit: number;
  label: string;
  badge: string;
}

export interface QuantityBreaks {
  enabled: boolean;
  tiers: QuantityBreakTier[];
}

export interface Bogo {
  enabled: boolean;
  buyQty: number;
  getQty: number;
  label: string;
}

export interface FlatDiscount {
  enabled: boolean;
  minQty: number;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  label: string;
}

export interface PricingOffers {
  quantityBreaks: QuantityBreaks;
  bogo: Bogo;
  flatDiscount: FlatDiscount;
}

export interface Product {
  id: string;
  productType?: 'simple' | 'variable' | 'bundle';
  bundleData?: Bundle;
  name: string;
  slug: string;
  soldCount?: number;
  sku?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  category: string;
  categorySlug: string;
  categoryId?: string;
  categoryIds?: string[];
  categoryNames?: string[];
  categorySlugs?: string[];
  brand: string;
  inStock: boolean;
  trackInventory?: boolean;
  stockQuantity?: number | null;
  stockStatus?: StockStatus;
  lowStockThreshold?: number | null;
  images: string[];
  imagePublicIds?: string[];
  imageThumbnailUrls?: string[];
  imageThumbnailPublicIds?: string[];
  shortDescription?: string;
  description: string;
  features: string[];
  safetyInfo: string;
  specifications: Record<string, string>;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  bestSellerDisplayImage?: string;
  isSpotlight?: boolean;
  isVisible?: boolean;
  status?: 'draft' | 'published';
  weight?: number;
  sizeGuide?: string;
  tags: string[];
  attributes?: ProductAttribute[];
  variations?: ProductVariation[];
  defaultAttributes?: Record<string, string>;
  defaultVariationId?: string;
  deliveryType?: DeliveryChargeType;
  customDeliveryFee?: number;
  metaTitle?: string;
  metaDescription?: string;
  displayOrder?: number;
  productDetailBlocks?: ProductDetailBlock[];
  productDetailCustomCss?: string;
  productDetailScopedCss?: string;
  pricingOffers?: PricingOffers;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName?: string;
  image: string;
  imagePublicId?: string;
  shortDescription?: string;
  description: string;
  itemCount: number;
  isActive?: boolean;
  isFeatured?: boolean;
  showInNavigation?: boolean;
  navigationLabel?: string;
  displayOrder?: number;
  parentCategoryId?: string;
  seoTitle?: string;
  metaDescription?: string;
  desktopVisible?: boolean;
  mobileVisible?: boolean;
}

export interface RoutineComponent {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  image?: string;
  variationId?: string;
  selectedVariant?: string;
}

export interface OrderItem {
  routineComponents?: RoutineComponent[];
  isRoutine?: boolean;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  selectedVariant?: string;
  variationId?: string;
  productType?: 'simple' | 'variable' | 'bundle';
  sku?: string;
  selectedAttributes?: Record<string, string>;
}

export interface Order {
  id: string;
  date: string;
  createdAt?: string;
  customerName: string;
  email: string;
  phone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: {
    fullName: string;
    phone?: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  statusHistory?: { id: string; status: string; note?: string; timestamp: string }[];
  trackingNumber?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  ordersCount: number;
  totalSpent: number;
  joinedDate: string;
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  reviewerName: string;
  reviewerEmail?: string;
  title?: string;
  content: string;
  rating: number;
  avatarUrl?: string;
  imageUrl?: string;
  verifiedPurchase: boolean;
  source: 'customer' | 'admin' | 'organic' | 'voice';
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

export interface AudioReview {
  id: string;
  customerName: string;
  audioUrl: string;
  duration: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'New' | 'Read' | 'Resolved';
  createdAt: string;
}

export interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  image?: string;
  customImage?: string;
  galleryImages?: string[];
  discountPercent: number;
  discountType?: 'percentage' | 'fixed' | 'custom';
  discountValue?: number;
  customPrice?: number;
  isActive: boolean;
  isBestseller?: boolean;
  displayOrder: number;
  originalTotalPrice?: number;
  currentPrice?: number;
  products?: {
    product: Product;
    quantity: number;
    variant?: string;
  }[];
  tags?: string[];
  badgeText?: string;
  routineSteps?: string;
  showShop?: boolean;
  featureHome?: boolean;
  allowCoupons?: boolean;
  startDate?: string;
  endDate?: string;
  stock?: number;
  autoCalcStock?: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  amount: number;
  minSpend: number;
  expiryDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface RoutineDiscountTier {
  minProducts: number;
  discountPercent: number;
}

export interface RoutineDiscountSettings {
  minimumDistinctProducts: number;
  tiers: RoutineDiscountTier[];
  quantityBonusEnabled: boolean;
  quantityBonusPercent: number;
}

export interface StoreSettings {
  socialLinks?: Record<string,string>;
  storeName: string;
  tagline?: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  logoUrl?: string;
  metaTitle: string;
  metaDescription: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  taxRate: number;
  routineDiscount?: RoutineDiscountSettings;
}

export type NavigationLinkType = 'internal_page' | 'category' | 'custom_internal_url' | 'external_url';
export type NavigationMenuType = 'link' | 'dropdown';

export interface StorefrontNavigationItem {
  id: string;
  key: string;
  label: string;
  linkType: NavigationLinkType;
  menuType: NavigationMenuType;
  path?: string;
  externalUrl?: string;
  categoryId?: string;
  parentId?: string | null;
  visible: boolean;
  enabled: boolean;
  showOnDesktop: boolean;
  showOnMobile: boolean;
  order: number;
  displayOrder: number;
  badgeText?: string;
  openInNewTab?: boolean;
  isSystemItem?: boolean;
}

export interface HomepageSectionSetting {
  key: string;
  name: string;
  enabled: boolean;
  order: number;
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaLink?: string;
}

export interface GlobalAttributeTerm {
  id: string;
  label: string;
  slug: string;
  value: string;
  colorValue?: string;
  imageUrl?: string;
  imageAlt?: string;
  position: number;
  isArchived?: boolean;
}

export interface GlobalAttribute {
  id: string;
  name: string;
  slug: string;
  displayType: 'dropdown' | 'buttons' | 'radio' | 'color_swatches' | 'image_swatches';
  terms: GlobalAttributeTerm[];
}

export type AdminPage =
  | 'feature-management'
  | 'dashboard'
  | 'products'
  | 'product-new'
  | 'product-edit'
  | 'categories'
  | 'attributes'
  | 'orders'
  | 'customers'
  | 'reviews'
  | 'audio-reviews'
  | 'contact-messages'
  | 'bundles'
  | 'bundle-new'
  | 'bundle-edit'
  | 'coupons'
  | 'reports'
  | 'settings'
  | 'routine-discounts'
  | 'best-sellers'
  | 'store-appearance';

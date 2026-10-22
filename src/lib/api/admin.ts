import { ApiError } from './client';
async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    try {
        const response = await fetch('/api/admin/' + path.replace(/^\/api\//, ''), { ...options, credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }, signal: AbortSignal.timeout(30000) });
        const body = await response.json();
        if (!response.ok)
            throw new ApiError(body.error || 'Unable to complete the request.', response.status, 'http');
        return body as T;
    }
    catch (error) {
        if (error instanceof ApiError)
            throw error;
        throw new ApiError('We could not reach the backend. Please try again.', 0, 'network');
    }
}
export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
}
export const isAdmin = (user: AdminUser) => ['admin', 'super_admin'].includes(user.role);
export interface AdminProduct {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    stockQuantity: number;
    trackInventory: boolean;
    inStock: boolean;
    isVisible: boolean;
    description: string;
    images: string[];
    imageThumbnailUrls?: string[];
    imagePublicIds?: string[];
    metaTitle?: string;
    metaDescription?: string;
    productType?: string;
    [key: string]: unknown;
}
export interface AdminOrder {
    orderId: string;
    customerName?: string;
    email?: string;
    phone?: string;
    total: number;
    status: string;
    createdAt: string;
    trackingNumber?: string;
    shippingAddress: Record<string, string>;
    items: {
        id: string;
        productName?: string;
        name?: string;
        quantity: number;
        price: number;
    }[];
    statusHistory?: {
        id: string;
        status: string;
        timestamp?: string;
        createdAt?: string;
        note?: string;
    }[];
}
export interface OrderPage {
    orders: AdminOrder[];
    totalCount: number;
    page: number;
    totalPages: number;
}
export const orderStatuses = ['Pending', 'Order Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const json = (method: string, body: unknown) => ({ method, body: JSON.stringify(body) });
export function normalizeAdminProduct(product: AdminProduct): AdminProduct { const result = { ...product }; for (const key of ["isVisible", "inStock", "trackInventory", "isFeatured", "isBestseller", "isNewArrival", "isSpotlight"]) {
    if (result[key] !== undefined)
        result[key] = result[key] === true || result[key] === 1 || result[key] === "1";
} return result; }
export const adminApi = {
    features: () => apiRequest<Record<string, boolean>>('/api/features'),
    me: () => apiRequest<AdminUser>('/api/auth/me'),
    login: async (email: string, password: string) => { const result = await apiRequest<{
        user: AdminUser;
    }>('/api/auth/login', json('POST', { email, password })); return result.user; },
    logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),
    products: async () => (await apiRequest<AdminProduct[]>('/api/products')).map(normalizeAdminProduct),
    product: async (id: string) => normalizeAdminProduct(await apiRequest<AdminProduct>('/api/products/' + encodeURIComponent(id))),
    saveProduct: (id: string | undefined, body: Partial<AdminProduct>) => apiRequest<AdminProduct>('/api/products' + (id ? '/' + encodeURIComponent(id) : ''), json(id ? 'PUT' : 'POST', body)),
    deleteProduct: (id: string) => apiRequest('/api/products/' + encodeURIComponent(id), { method: 'DELETE' }),
    orders: async () => {
        const first = await apiRequest<OrderPage>('/api/orders?page=1&limit=100');
        const orders = [...first.orders];
        for (let page = 2; page <= first.totalPages; page++) {
            const result = await apiRequest<OrderPage>('/api/orders?page=' + page + '&limit=100');
            orders.push(...result.orders);
        }
        return orders;
    },
    orderPage: (page: number, search: string, status: string) => apiRequest<OrderPage>('/api/orders?' + new URLSearchParams({ page: String(page), limit: '20', search, status })),
    order: (id: string) => apiRequest<AdminOrder>('/api/orders/' + encodeURIComponent(id)),
    status: (id: string, status: string, note: string) => apiRequest('/api/orders/' + encodeURIComponent(id) + '/status', json('PUT', { status, note })),
    tracking: (id: string, trackingNumber: string) => apiRequest('/api/orders/' + encodeURIComponent(id) + '/tracking', json('PUT', { trackingNumber })),
    customers: () => apiRequest<AdminUser[]>('/api/auth/users'),
};
/** Preserve parsed metadata on the backend's full replacement update route. */
export function productUpdate(current: AdminProduct, patch: Partial<AdminProduct>): Partial<AdminProduct> { const body = { ...current, ...patch }; delete body.variations; for (const key of ["images", "imageThumbnailUrls", "imagePublicIds"]) {
    if (JSON.stringify(body[key]) === JSON.stringify(current[key]))
        delete body[key];
} return body; }
export async function uploadAdminImage(file: File): Promise<{
    url: string;
    thumbnailUrl: string;
    publicId: string;
}> {
    if (file.size > 5 * 1024 * 1024)
        throw new Error('Choose an image smaller than 5 MB.');
    const data = new FormData();
    data.append('image', file);
    try {
        const response = await fetch('/api/admin/upload/image', { method: 'POST', credentials: 'include', body: data, signal: AbortSignal.timeout(20000) });
        const body = await response.json();
        if (!response.ok)
            throw new ApiError(body.error || 'Image upload failed.', response.status, 'http');
        return body;
    }
    catch (error) {
        if (error instanceof ApiError)
            throw error;
        throw new Error('Image upload failed. Please try again.');
    }
}
export const money = (value: number) => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(Number(value));

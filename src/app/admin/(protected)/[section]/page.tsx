import { Heading, Panel } from '@/components/admin/shared';
const names: Record<string, string> = { customers: 'Customers', reviews: 'Reviews', contact: 'Contact Messages', bundles: 'Bundles', coupons: 'Coupons', settings: 'Store Settings', features: 'Feature Toggles' };
export default async function Page({ params }: {
    params: Promise<{
        section: string;
    }>;
}) { const { section } = await params; return <><Heading title={names[section] || 'Admin'}/><Panel>{section === 'features' ? <p>Backend endpoint not available: GET /api/features. Feature controls and optional modules are hidden until the backend supports them.</p> : <p>This page is scheduled for the next batch.</p>}</Panel></>; }

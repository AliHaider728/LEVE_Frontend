import './admin.css';
import type { ReactNode } from 'react';
export const metadata = { title: 'LEVA Admin', robots: { index: false, follow: false } };
export default function Layout({ children }: {
    children: ReactNode;
}) { return <div className="admin-root">{children}</div>; }

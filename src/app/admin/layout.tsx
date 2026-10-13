import './admin.css';
import type {ReactNode} from 'react';
import {AdminUIProvider} from '@/admin-ui/context/AdminUIContext';
export const metadata={title:'LEVA Admin',robots:{index:false,follow:false}};
export default function Layout({children}:{children:ReactNode}){return <div className="admin-root"><AdminUIProvider>{children}</AdminUIProvider></div>;}

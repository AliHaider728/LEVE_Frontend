"use client";
import { use, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { adminApi, orderStatuses, money } from '@/lib/api/admin';
import { AdminButton, Panel, Heading, Loading, ErrorState, Empty } from '@/components/admin/shared';
export default function OrderDetail({ params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const { id } = use(params), cache = useQueryClient();
    const query = useQuery({ queryKey: ['admin-order', id], queryFn: () => adminApi.order(id) });
    const [status, setStatus] = useState(''), [tracking, setTracking] = useState(''), [note, setNote] = useState(''), [busy, setBusy] = useState(''), [error, setError] = useState('');
    useEffect(() => { if (query.data) {
        setStatus(query.data.status);
        setTracking(query.data.trackingNumber || '');
    } }, [query.data]);
    async function save(event: FormEvent, kind: string) { event.preventDefault(); setBusy(kind); setError(''); try {
        if (kind === 'status')
            await adminApi.status(id, status, note);
        else
            await adminApi.tracking(id, tracking);
        await query.refetch();
        void cache.invalidateQueries({ queryKey: ['admin-orders'] });
        void cache.invalidateQueries({ queryKey: ['admin-dashboard'] });
        setNote('');
        toast.success(kind === 'status' ? 'Order status updated' : 'Tracking saved');
    }
    catch (error) {
        setError(error instanceof Error ? error.message : 'Unable to update order');
    }
    finally {
        setBusy('');
    } }
    if (query.isPending)
        return <Loading />;
    if (query.isError)
        return <ErrorState error={query.error} retry={() => void query.refetch()}/>;
    const order = query.data;
    return <><Heading title={'Order ' + order.orderId}><Link href="/admin/orders" className="text-[#603344] underline">Back to orders</Link></Heading><div className="mb-5 flex flex-wrap gap-3"><span className="admin-pill">{order.status}</span><span className="admin-pill">COD</span><span className="admin-pill">{money(order.total)}</span></div>{error && <div className="mb-5"><ErrorState error={new Error(error)}/></div>}<div className="grid gap-5 xl:grid-cols-[2fr_1fr]"><div className="space-y-5"><Panel><h3>Items</h3><div className="mt-4 overflow-x-auto"><table className="w-full text-left"><thead><tr><th className="p-2">Product</th><th className="p-2">Quantity</th><th className="p-2">Price</th><th className="p-2">Total</th></tr></thead><tbody>{order.items.map((item, i) => <tr key={item.id || i} className="border-t border-[#ecdfe4]"><td className="p-2 min-w-36">{item.productName || item.name}</td><td className="p-2">{item.quantity}</td><td className="p-2 whitespace-nowrap">{money(item.price)}</td><td className="p-2 whitespace-nowrap">{money(item.price * item.quantity)}</td></tr>)}</tbody></table></div></Panel><Panel><h3>Status history</h3>{!order.statusHistory?.length ? <Empty>No status history available.</Empty> : <ol className="mt-4 space-y-4">{order.statusHistory.map((entry, i) => <li key={entry.id || i} className="border-l-2 border-[#ecdfe4] pl-4"><p className="font-medium">{entry.status}</p>{(entry.timestamp || entry.createdAt) && <p className="text-xs text-[#78666d]">{new Date(entry.timestamp || entry.createdAt || '').toLocaleString('en-PK')}</p>}{entry.note && <p className="mt-1">{entry.note}</p>}</li>)}</ol>}</Panel></div><div className="space-y-5"><Panel><h3>Customer & delivery address</h3><p className="mt-4 break-words">{order.customerName || order.shippingAddress.fullName || order.shippingAddress.name || 'Guest'}</p><p className="break-all">{order.email}</p><p>{order.phone || order.shippingAddress.phone}</p><address className="mt-3 space-y-1 not-italic">{Object.entries(order.shippingAddress).filter(([key]) => !['fullName', 'name', 'phone', 'email'].includes(key)).map(([key, value]) => <p key={key} className="break-words">{value}</p>)}</address></Panel><Panel><h3>Update status</h3><form onSubmit={e => void save(e, 'status')} className="mt-4 space-y-3"><label>Status<select className="mt-1" value={status} onChange={e => setStatus(e.target.value)}>{orderStatuses.map(value => <option key={value}>{value}</option>)}</select></label><label>History note<textarea rows={2} className="mt-1" value={note} onChange={e => setNote(e.target.value)}/></label><p className="text-xs text-[#78666d]">Status changes may send a customer email. Cancelling restores inventory.</p><AdminButton type="submit" disabled={!!busy || status === order.status}>{busy === 'status' ? 'Updating…' : 'Update status'}</AdminButton></form></Panel><Panel><h3>Tracking number</h3><form onSubmit={e => void save(e, 'tracking')} className="mt-4 space-y-3"><Input aria-label="Tracking number" value={tracking} onChange={e => setTracking(e.target.value)}/><AdminButton type="submit" disabled={!!busy}>{busy === 'tracking' ? 'Saving…' : 'Save tracking'}</AdminButton></form></Panel></div></div></>;
}

"use client";
import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { adminApi, productUpdate, uploadAdminImage, money, type AdminProduct } from '@/lib/api/admin';
import { AdminButton, Panel, Heading, Loading, ErrorState, Empty } from '@/components/admin/shared';
const blank: Partial<AdminProduct> = { name: '', slug: '', price: 0, originalPrice: 0, stockQuantity: 0, trackInventory: true, inStock: false, isVisible: true, description: '', images: [], imageThumbnailUrls: [], imagePublicIds: [], metaTitle: '', metaDescription: '' };
export default function Products() {
    const cache = useQueryClient();
    const query = useQuery({ queryKey: ['admin-products'], queryFn: adminApi.products });
    const [search, setSearch] = useState(''), [form, setForm] = useState<Partial<AdminProduct> | null>(null), [original, setOriginal] = useState<AdminProduct | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState(''), [editing, setEditing] = useState(false), [remove, setRemove] = useState<AdminProduct | null>(null), [pending, setPending] = useState('');
    const refresh = () => { void cache.invalidateQueries({ queryKey: ['admin-products'] }); void cache.invalidateQueries({ queryKey: ['admin-dashboard'] }); };
    async function edit(product: AdminProduct) { setEditing(true); setOriginal(null); setError(''); setForm({ ...blank }); try {
        const full = await adminApi.product(product.id);
        setOriginal(full);
        setForm(full);
    }
    catch (error) {
        setForm(null);
        toast.error(error instanceof Error ? error.message : 'Unable to load product');
    }
    finally {
        setEditing(false);
    } }
    async function visibility(product: AdminProduct, value: boolean) { setPending(product.id); try {
        const full = await adminApi.product(product.id);
        await adminApi.saveProduct(product.id, productUpdate(full, { isVisible: value }));
        refresh();
        toast.success('Visibility updated');
    }
    catch (error) {
        toast.error(error instanceof Error ? error.message : 'Update failed');
    }
    finally {
        setPending('');
    } }
    async function save(event: FormEvent) { event.preventDefault(); if (!form)
        return; setBusy(true); setError(''); try {
        const stock = Number(form.stockQuantity);
        const body = { ...form, price: Number(form.price), originalPrice: Number(form.originalPrice) || undefined, stockQuantity: stock, inStock: form.trackInventory ? stock > 0 : form.inStock, stockStatus: form.trackInventory ? (stock > 0 ? 'in_stock' : 'out_of_stock') : form.inStock ? 'in_stock' : 'out_of_stock' };
        await adminApi.saveProduct(original?.id, original ? productUpdate(original, body) : body);
        setForm(null);
        refresh();
        toast.success('Product saved');
    }
    catch (error) {
        setError(error instanceof Error ? error.message : 'Save failed');
    }
    finally {
        setBusy(false);
    } }
    async function upload(file: File) { setBusy(true); setError(''); try {
        const image = await uploadAdminImage(file);
        setForm(current => current ? { ...current, images: [...(current.images || []), image.url], imageThumbnailUrls: [...(current.imageThumbnailUrls || []), image.thumbnailUrl || image.url], imagePublicIds: [...(current.imagePublicIds || []), image.publicId] } : null);
        toast.success('Image uploaded');
    }
    catch (error) {
        setError(error instanceof Error ? error.message : 'Upload failed');
    }
    finally {
        setBusy(false);
    } }
    async function destroy() { if (!remove)
        return; setBusy(true); try {
        await adminApi.deleteProduct(remove.id);
        setRemove(null);
        refresh();
        toast.success('Product deleted');
    }
    catch (error) {
        toast.error(error instanceof Error ? error.message : 'Delete failed');
    }
    finally {
        setBusy(false);
    } }
    const patch = (key: string, value: unknown) => setForm(current => ({ ...current, [key]: value }));
    return <><Heading title="Products"><AdminButton onClick={() => { setOriginal(null); setError(''); setForm({ ...blank }); }}>Add product</AdminButton></Heading><Panel><Input aria-label="Search products" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} className="mb-4 max-w-sm"/>{query.isPending ? <Loading /> : query.isError ? <ErrorState error={query.error} retry={() => void query.refetch()}/> : !query.data.filter(p => (p.name + ' ' + p.slug).toLowerCase().includes(search.toLowerCase())).length ? <Empty>No products match your search.</Empty> : <Table><TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Visible</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{query.data.filter(p => (p.name + ' ' + p.slug).toLowerCase().includes(search.toLowerCase())).map(p => <TableRow key={p.id}><TableCell><div className="flex min-w-44 items-center gap-3">{p.images?.[0] ? <img src={p.imageThumbnailUrls?.[0] || p.images[0]} alt="" className="h-12 w-12 rounded-lg object-contain bg-[#FFF4F6]"/> : <div className="h-12 w-12 rounded-lg bg-[#FFF4F6]"/>}<div><p className="font-medium">{p.name}</p><p className="text-xs text-[#78666d]">{p.slug}</p></div></div></TableCell><TableCell className="whitespace-nowrap">{money(p.price)}</TableCell><TableCell>{p.trackInventory ? p.stockQuantity : p.inStock ? 'In stock' : 'Out of stock'}</TableCell><TableCell><Switch checked={Boolean(p.isVisible)} disabled={pending === p.id} onCheckedChange={value => void visibility(p, value)} aria-label={'Visibility for ' + p.name}/></TableCell><TableCell><div className="flex gap-2"><AdminButton secondary onClick={() => void edit(p)}>Edit</AdminButton><AdminButton secondary onClick={() => setRemove(p)}>Delete</AdminButton></div></TableCell></TableRow>)}</TableBody></Table>}</Panel>
 <Dialog open={form !== null} onOpenChange={open => { if (!open && !busy)
        setForm(null); }}><DialogContent className="admin-root admin-dialog max-h-[90dvh] max-w-2xl overflow-y-auto rounded-2xl"><DialogTitle>{original ? 'Edit product' : 'Add product'}</DialogTitle><DialogDescription>Product details, inventory, images and search appearance.</DialogDescription>{editing ? <Loading /> : form && <form onSubmit={save} className="space-y-4">{original?.productType === 'variable' && <p className="rounded-xl bg-[#FFF4F6] p-3 text-xs">Existing variations and product options are preserved.</p>}<div className="grid gap-4 sm:grid-cols-2">{[['name', 'Name'], ['slug', 'Slug'], ['price', 'Price (PKR)'], ['originalPrice', 'Original price (PKR)'], ['stockQuantity', 'Stock quantity']].map(([key, label]) => <label key={key}>{label}<Input className="mt-1" required={['name', 'slug', 'price', 'stockQuantity'].includes(key)} type={['price', 'originalPrice', 'stockQuantity'].includes(key) ? 'number' : 'text'} min={key === 'price' ? 0.01 : 0} step={key === 'stockQuantity' ? 1 : 0.01} value={String(form[key] ?? '')} onChange={e => patch(key, e.target.value)}/></label>)}</div><div className="flex flex-wrap gap-5">{[['trackInventory', 'Track inventory'], ['isVisible', 'Visible'], ...(!form.trackInventory ? [['inStock', 'In stock']] : [])].map(([key, label]) => <label key={key} className="flex items-center gap-2"><Switch checked={Boolean(form[key])} onCheckedChange={value => patch(key, value)}/>{label}</label>)}</div><label>Description<textarea rows={4} className="mt-1" value={form.description || ''} onChange={e => patch('description', e.target.value)}/></label><label>Images (up to 5 MB each)<Input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => { const file = e.target.files?.[0]; if (file)
        void upload(file); e.target.value = ''; }} className="mt-1"/></label><div className="flex flex-wrap gap-3">{form.images?.map((url, index) => <div key={url + index} className="w-24"><img src={url} alt={'Product image ' + (index + 1)} className="h-20 w-24 rounded-lg object-contain bg-[#FFF4F6]"/><button type="button" className="mt-2 text-xs underline" onClick={() => { setForm(current => current ? { ...current, images: current.images?.filter((_, i) => i !== index), imageThumbnailUrls: current.imageThumbnailUrls?.filter((_, i) => i !== index), imagePublicIds: current.imagePublicIds?.filter((_, i) => i !== index) } : null); }}>Remove image</button></div>)}</div><label>SEO title<Input value={form.metaTitle || ''} onChange={e => patch('metaTitle', e.target.value)} className="mt-1"/></label><label>SEO description<textarea rows={2} className="mt-1" value={form.metaDescription || ''} onChange={e => patch('metaDescription', e.target.value)}/></label>{error && <p role="alert" className="text-[#603344]">{error}</p>}<div className="flex gap-3"><AdminButton type="submit" disabled={busy || editing}>{busy ? 'Saving…' : 'Save product'}</AdminButton><AdminButton type="button" secondary disabled={busy} onClick={() => setForm(null)}>Cancel</AdminButton></div></form>}</DialogContent></Dialog>
 <Dialog open={!!remove} onOpenChange={open => { if (!open && !busy)
        setRemove(null); }}><DialogContent className="admin-root admin-dialog rounded-2xl"><DialogTitle>Delete product?</DialogTitle><DialogDescription>Delete {remove?.name}? This action cannot be undone.</DialogDescription><div className="flex gap-3"><AdminButton disabled={busy} onClick={() => void destroy()}>{busy ? 'Deleting…' : 'Delete product'}</AdminButton><AdminButton secondary disabled={busy} onClick={() => setRemove(null)}>Cancel</AdminButton></div></DialogContent></Dialog></>;
}

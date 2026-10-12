"use client";
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
export function AdminButton({ className, secondary, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & {
    secondary?: boolean;
}) { return <button {...props} className={cn(buttonVariants({ variant: secondary ? 'outline' : 'default' }), 'rounded-full normal-case tracking-normal text-sm shadow-none min-h-10', className)}/>; }
export function Panel({ children, className = '' }: {
    children: ReactNode;
    className?: string;
}) { return <Card className={'rounded-2xl border-[#ecdfe4] bg-white p-5 shadow-none ' + className}>{children}</Card>; }
export function Loading() { return <div aria-label="Loading" className="space-y-4"><Skeleton className="h-12 w-full rounded-xl"/><Skeleton className="h-48 w-full rounded-xl"/></div>; }
export function ErrorState({ error, retry }: {
    error: unknown;
    retry?: () => void;
}) { return <Panel><p role="alert" className="text-[#603344]">{error instanceof Error ? error.message : 'Unable to load this page.'}</p>{retry && <AdminButton secondary className="mt-3" onClick={retry}>Try again</AdminButton>}</Panel>; }
export function Empty({ children }: {
    children: ReactNode;
}) { return <p className="py-10 text-center text-[#78666d]">{children}</p>; }
export function Heading({ title, children }: {
    title: string;
    children?: ReactNode;
}) { return <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1>{title}</h1>{children}</div>; }

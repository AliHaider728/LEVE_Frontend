"use client";
import React from 'react';
import type { RoutineComponent } from '../types';
export function RoutineContents({ components }: {
    components?: RoutineComponent[];
}) {
    if (!components?.length)
        return null;
    return (<ul className="mt-2 space-y-1 text-xs leading-5 text-[#74665C]" aria-label="Included routine products">
      {components.map((c, i) => (<li key={`${c.productId}-${c.variationId || i}`}>
          {c.quantity} × {c.name}
          {c.selectedVariant ? ` (${c.selectedVariant})` : ''}
        </li>))}
    </ul>);
}

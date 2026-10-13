"use client";
import {uploadImage as uploadAdminAsset} from '@/admin-ui/api';
import React from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Trash2, Upload } from 'lucide-react';
import { getSafeImageSrc } from '../../utils/images';
interface Props {
    images: string[];
    onChange: (images: string[]) => void;
    onUploadingChange?: (uploading: boolean) => void;
    disabled?: boolean;
}
export function BundleGalleryImages({ images, onChange, disabled = false }: Props) {
    const upload = async (files: File[], replaceIndex?: number) => {
        try {
            if (disabled || !files.length)
                return;
            const uploaded = await Promise.all(files.map(async (f) => await uploadAdminAsset(f)));
            const next = [...images];
            if (replaceIndex === undefined)
                next.push(...uploaded);
            else
                next[replaceIndex] = uploaded[0];
            onChange(next);
        }
        catch {
        }
    };
    const move = (index: number, direction: -1 | 1) => {
        const next = [...images];
        [next[index], next[index + direction]] = [next[index + direction], next[index]];
        onChange(next);
    };
    return (<section aria-label="Bundle Gallery Images" className="md:col-span-2 border-t border-[#ecdfe4] pt-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Bundle Gallery Images</h3>
        <span className="text-xs text-gray-500">{images.length}/8</span>
      </div>
      <p className="mb-4 text-xs leading-5 text-gray-500">
        Optional extra photos for this bundle only. The bundle thumbnail stays first; gallery images follow in order.
      </p>

      <fieldset disabled={disabled} className="space-y-3 disabled:opacity-60">
        {images.length > 0 && (<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((url, index) => (<div key={`${index}-${url}`} className="overflow-hidden rounded-xl border border-[#ecdfe4] bg-[#FFF4F6]">
                <img src={getSafeImageSrc(url)} alt={`Bundle gallery preview ${index + 1}`} className="aspect-square w-full object-cover"/>
                <div className="flex items-center justify-between gap-1 p-2">
                  <span className="text-xs font-semibold text-[#673742]">{index + 1}</span>
                  <button type="button" disabled={disabled || index === 0} onClick={() => move(index, -1)} className="rounded-md p-1.5 hover:bg-[#FFF4F6] disabled:opacity-30">
                    <ArrowLeft className="h-3.5 w-3.5"/>
                  </button>
                  <button type="button" disabled={disabled || index === images.length - 1} onClick={() => move(index, 1)} className="rounded-md p-1.5 hover:bg-[#FFF4F6] disabled:opacity-30">
                    <ArrowRight className="h-3.5 w-3.5"/>
                  </button>
                  <button type="button" onClick={() => onChange(images.filter((_, i) => i !== index))} className="rounded-md p-1.5 text-red-500 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5"/>
                  </button>
                </div>
                <label className="flex cursor-pointer items-center justify-center gap-1.5 border-t border-[#ecdfe4] px-2 py-2 text-[11px] font-semibold text-[#673742] hover:bg-white">
                  <Upload size={12}/> Replace
                  <input type="file" accept="image/*" className="hidden" onChange={event => {
                    upload(Array.from(event.target.files || []), index);
                    event.target.value = '';
                }}/>
                </label>
              </div>))}
          </div>)}

        <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#ecdfe4] bg-white px-3 py-4 text-xs font-semibold text-[#673742] hover:border-[#673742] ${images.length >= 8 ? 'pointer-events-none opacity-50' : ''}`}>
          <ImagePlus className="h-4 w-4"/>
          Add Gallery Images
          <input type="file" multiple accept="image/*" disabled={disabled || images.length >= 8} className="hidden" onChange={event => {
            upload(Array.from(event.target.files || []));
            event.target.value = '';
        }}/>
        </label>
      </fieldset>
    </section>);
}

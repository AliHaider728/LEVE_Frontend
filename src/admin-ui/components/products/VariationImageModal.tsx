"use client";
import {uploadImage as uploadAdminAsset} from '@/admin-ui/api';
import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { getSafeImageSrc } from '../../utils/images';
interface VariationImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (image: {
        url: string;
        publicId?: string;
        alt?: string;
    } | undefined) => void;
    currentImage?: {
        url: string;
        publicId?: string;
        alt?: string;
    };
    productImages: {
        id: string;
        url: string;
        publicId?: string;
    }[];
}
export const VariationImageModal: React.FC<VariationImageModalProps> = ({ isOpen, onClose, onSave, currentImage, productImages }) => {
    const [selectedImage, setSelectedImage] = useState<{
        url: string;
        publicId?: string;
        alt?: string;
    } | undefined>(currentImage);
    const [altText, setAltText] = useState(currentImage?.alt || '');
    if (!isOpen)
        return null;
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file)
                return;
            const uploadedUrl = await uploadAdminAsset(file);
            setSelectedImage({
                url: uploadedUrl,
                publicId: `upload-${Date.now()}`,
                alt: altText
            });
        }
        catch {
        }
    };
    const handleSave = () => {
        if (selectedImage) {
            onSave({ ...selectedImage, alt: altText });
        }
        else {
            onSave(undefined);
        }
        onClose();
    };
    return (<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#382b31]/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-[#ecdfe4] bg-[#FFF4F6]">
          <h2 className="font-heading font-black text-lg text-[#382b31]">Variation Image</h2>
          <button type="button" onClick={onClose} className="p-2 text-[#382b31]/40 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[#382b31]/80 mb-3">Current Selection</h3>
            {selectedImage ? (<div className="relative rounded-xl border border-[#ecdfe4] overflow-hidden bg-[#FFF4F6] aspect-video flex items-center justify-center max-w-sm">
                <img src={getSafeImageSrc(selectedImage.url)} alt="Variation Preview" className="max-w-full max-h-full object-contain"/>
                <button type="button" onClick={() => setSelectedImage(undefined)} className="absolute top-2 right-2 p-1.5 bg-white rounded-md text-[#673742] shadow hover:bg-[#FFF4F6]" title="Remove Image">
                  <X className="w-4 h-4"/>
                </button>
              </div>) : (<div className="rounded-xl border-2 border-dashed border-[#ecdfe4] bg-[#FFF4F6] p-6 flex flex-col items-center justify-center text-[#382b31]/40">
                <ImageIcon className="w-8 h-8 mb-2 opacity-50"/>
                <p className="text-sm font-medium">No image selected</p>
                <p className="text-xs">Select from gallery or upload a new one</p>
              </div>)}
          </div>

          {selectedImage && (<div className="mb-6">
              <label className="block">
                <span className="block text-xs font-bold text-[#382b31]/80 mb-1.5">Alt Text</span>
                <input type="text" value={altText} onChange={e => setAltText(e.target.value)} placeholder="Describe the image for screen readers and SEO" className="w-full rounded-lg border border-[#ecdfe4] px-3 py-2 text-sm focus:border-[#673742] focus:ring-1 focus:ring-[#673742] outline-none"/>
              </label>
            </div>)}

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#ecdfe4]">
            <div>
              <h3 className="text-sm font-bold text-[#382b31]/80 mb-3">Upload New</h3>
              <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-[#673742] rounded-xl bg-[#FFF4F6] text-[#673742] hover:bg-[#FFF4F6] cursor-pointer transition-colors font-medium text-sm">
                <Upload className="w-5 h-5"/> Select File
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload}/>
              </label>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#382b31]/80 mb-3">Select from Gallery</h3>
              {productImages.length === 0 ? (<div className="p-4 text-center text-sm text-[#382b31]/50 bg-[#FFF4F6] rounded-xl border border-[#ecdfe4]">
                  No existing product images available.
                </div>) : (<div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {productImages.map((img, idx) => (<button type="button" key={img.id || idx} onClick={() => {
                    setSelectedImage({ url: img.url, publicId: img.publicId, alt: altText });
                }} className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage?.url === img.url ? 'border-[#673742] ring-2 ring-[#673742]/20' : 'border-transparent hover:border-[#ecdfe4]'}`}>
                      <img src={getSafeImageSrc(img.url)} className="w-full h-full object-cover" alt="Gallery option"/>
                      {idx === 0 && (<span className="absolute bottom-0 inset-x-0 bg-[#382b31]/60 text-[9px] text-white font-bold text-center py-0.5">Main</span>)}
                    </button>))}
                </div>)}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#ecdfe4] bg-[#FFF4F6] flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-[#382b31]/70 hover:bg-slate-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#673742] to-[#673742] hover:from-[#673742] hover:to-[#673742] rounded-xl shadow transition-colors">
            Confirm Image
          </button>
        </div>
      </div>
    </div>);
};

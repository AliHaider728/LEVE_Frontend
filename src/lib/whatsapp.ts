import {storeConfig} from '@/config/store';
import type {Product} from '@/data/products';
export function normalizeWhatsAppNumber(value:string){const digits=value.replace(/\D/g,'');const number=digits.startsWith('0')?'92'+digits.slice(1):digits;return /^[1-9]\d{7,14}$/.test(number)&&!number.endsWith('0000000')?number:null;}
export function whatsappLink(message:string,number:string=storeConfig.whatsappNumber){const normalized=normalizeWhatsAppNumber(number);return normalized?`https://wa.me/${normalized}?text=${encodeURIComponent(message)}`:'';}
export function productWhatsAppMessage(product:Product,url:string,quantity=1){const variant=product.selectedAttributes?Object.entries(product.selectedAttributes).map(([name,value])=>`${name}: ${value}`).join(', '):product.variationId||'';return `Hi LEVA, I would like to ask about ${product.name}${quantity>1?' x '+quantity:''}.${variant?'\nSelected variant: '+variant:''}\n${url}`;}

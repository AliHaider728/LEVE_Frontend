export const PLACEHOLDER_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23F5EDE4'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%239C4122'%3ENo Image%3C/text%3E%3C/svg%3E";

export const getSafeImageSrc = (source?: string | any | null, _options?: any): string => {
  if (source && typeof source === 'object' && source.src) source = source.src;
  const url = (typeof source === 'string' ? source.trim() : source);
  if (!url) return PLACEHOLDER_SVG;
  return url;
};

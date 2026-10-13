/**
 * Formats numeric price into PKR currency string format: "Rs. 2,500"
 */
export const formatPrice = (amount: number, _currency = 'PKR'): string => {
  const numericAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `Rs. ${numericAmount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
};

export const formatPKR = (amount: number): string => {
  return formatPrice(amount, 'PKR');
};

export const parsePriceNumber = (val: any): number => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatProductAgeGroups = (product: { ageGroups?: string[]; ageGroup?: string }): string => {
  if (product.ageGroups && product.ageGroups.length > 0) {
    return product.ageGroups.join(', ');
  }
  return product.ageGroup || 'All Ages';
};

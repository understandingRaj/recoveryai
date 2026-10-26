// Currency formatting for backend receipts and export logs

export const formatINR = (amount, includeSymbol = true) => {
  if (amount === undefined || amount === null || isNaN(amount)) return includeSymbol ? '₹0' : '0';
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(Math.round(amount));
  return includeSymbol ? `₹${formatted}` : formatted;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toISOString().split('T')[0];
  } catch (err) {
    return dateStr;
  }
};

// Currency and calculation utilities for RecoverAI

export const formatINR = (amount, includeSymbol = true) => {
  if (amount === undefined || amount === null || isNaN(amount)) return includeSymbol ? '₹0' : '0';
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(Math.round(amount));
  return includeSymbol ? `₹${formatted}` : formatted;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    return dateStr;
  }
};

export const calculateDaysOverdue = (dueDateStr, status) => {
  if (status === 'Paid') return 0;
  if (!dueDateStr) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = today - due;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const computeInvoiceStatus = (totalAmount, amountPaid, dueDateStr) => {
  const total = Number(totalAmount) || 0;
  const paid = Number(amountPaid) || 0;
  const remaining = Math.max(0, total - paid);

  if (remaining <= 0) {
    return 'Paid';
  }

  const daysOverdue = calculateDaysOverdue(dueDateStr, 'Pending');
  if (daysOverdue > 0) {
    return 'Overdue';
  }

  if (paid > 0 && remaining > 0) {
    return 'Partially Paid';
  }

  return 'Pending';
};

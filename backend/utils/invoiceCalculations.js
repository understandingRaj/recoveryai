// Financial calculation engine for RecoverAI

export const calculateRemainingAmount = (totalAmount, amountPaid) => {
  const total = Number(totalAmount) || 0;
  const paid = Number(amountPaid) || 0;
  return Math.max(0, Math.round((total - paid) * 100) / 100);
};

export const calculateDaysOverdue = (dueDateStr, status) => {
  if (status === 'Paid') return 0;
  if (!dueDateStr) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  if (isNaN(due.getTime())) return 0;

  const diffTime = today - due;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const computeInvoiceStatus = (totalAmount, amountPaid, dueDateStr) => {
  const total = Number(totalAmount) || 0;
  const paid = Number(amountPaid) || 0;
  const remaining = calculateRemainingAmount(total, paid);

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

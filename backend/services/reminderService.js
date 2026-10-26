import FollowUp from '../models/FollowUp.js';
import Activity from '../models/Activity.js';

export const scheduleInvoiceFollowUp = async ({
  businessId,
  customerId,
  customerName,
  invoiceId,
  invoiceNumber,
  amountDue,
  scheduledDate,
  priority = 'Medium',
  channel = 'Email',
  message = '',
  userName = 'System'
}) => {
  const followUp = await FollowUp.create({
    businessId,
    customerId,
    customerName,
    invoiceId,
    invoiceNumber,
    amountDue,
    scheduledDate: scheduledDate || new Date(),
    priority,
    channel,
    message,
    status: 'Pending'
  });

  await Activity.create({
    businessId,
    type: 'reminder_drafted',
    description: `Scheduled follow-up for ${customerName} (${channel})`,
    customerName,
    invoiceNumber,
    user: userName,
    status: 'drafted'
  });

  return followUp;
};

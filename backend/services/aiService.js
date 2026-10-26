import axios from 'axios';
import { formatINR, formatDate } from '../utils/currency.js';

export const generatePaymentReminder = async ({
  customerName = 'Customer',
  contactPerson = '',
  invoiceNumber = '',
  amountDue = 0,
  dueDate = '',
  daysOverdue = 0,
  tone = 'Professional',
  channel = 'Email',
  businessName = 'Apex FinTech Solutions'
}) => {
  const recipient = contactPerson || customerName;
  const formattedAmount = formatINR(amountDue);
  const formattedDueDate = formatDate(dueDate);

  // If OPENAI_API_KEY is configured with real key
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && apiKey !== 'your_openai_api_key_here' && apiKey !== 'mock-key-safe-mode') {
    try {
      const prompt = `You are an AI accounts receivable recovery assistant for "${businessName}".
Generate a ${tone.toLowerCase()} collection reminder for:
- Customer: ${recipient}
- Invoice Number: ${invoiceNumber}
- Amount Due: ${formattedAmount}
- Due Date: ${formattedDueDate}
- Days Overdue: ${daysOverdue} days
- Channel: ${channel}

Strict rules:
1. Only use the provided invoice facts. Never hallucinate amounts, dates, or terms.
2. Never make legal threats or hostile demands.
3. Keep it clear, polite, and action-oriented requesting transaction reference or payment timeline.`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 350
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          timeout: 7000
        }
      );

      const aiText = response.data.choices[0]?.message?.content;
      if (aiText) return aiText.trim();
    } catch (err) {
      console.warn('[AI Service] OpenAI API call fallback to deterministic synthesis:', err.message);
    }
  }

  // Deterministic synthesis engine (Zero-hallucination compliance)
  if (channel === 'WhatsApp' || channel === 'SMS') {
    if (tone === 'Friendly') {
      return `Hi ${recipient}, hope you're having a good day! Quick heads-up regarding invoice ${invoiceNumber} for ${formattedAmount}, which was due on ${formattedDueDate} (${daysOverdue > 0 ? `${daysOverdue} days ago` : 'due today'}). Let us know if you need any assistance with the payment details. Best, ${businessName}.`;
    }
    if (tone === 'Firm but polite') {
      return `Dear ${recipient}, this is an urgent reminder that payment of ${formattedAmount} for invoice ${invoiceNumber} is now ${daysOverdue} days past due (original due date: ${formattedDueDate}). Kindly arrange the settlement today or share the transaction reference. Regards, Accounts Team - ${businessName}.`;
    }
    return `Hello ${recipient}, this is a reminder regarding invoice ${invoiceNumber} for ${formattedAmount} due on ${formattedDueDate} (${daysOverdue > 0 ? `${daysOverdue} days overdue` : 'due'}). Please share the payment status or UTR number once processed. Thank you, ${businessName}.`;
  }

  // Email format
  if (tone === 'Friendly') {
    return `Dear ${recipient},

I hope you are doing well and having a productive week.

This is a friendly reminder that invoice ${invoiceNumber} for ${formattedAmount} was due on ${formattedDueDate}${daysOverdue > 0 ? ` (${daysOverdue} days ago)` : ''}.

We understand that billing cycles can get busy, so please let us know if you have any questions regarding the invoice or if you require any updated payment details.

Could you please confirm when we can expect the payment to be processed?

Thank you for your continued partnership.

Warm regards,
Accounts Receivable Team
${businessName}`;
  }

  if (tone === 'Firm but polite') {
    return `Dear ${recipient},

We are writing to follow up on overdue invoice ${invoiceNumber} for ${formattedAmount}, which was scheduled for payment on ${formattedDueDate}. As of today, this payment is ${daysOverdue} days past due.

Timely settlements ensure uninterrupted continuation of our services and support. Please prioritize this clearance and provide the transaction reference / UTR number at your earliest convenience.

If payment has already been initiated, please share the remittance advice so we can update our records.

Sincerely,
Finance & Collections Department
${businessName}`;
  }

  // Default: Professional
  return `Dear ${recipient},

I hope this message finds you well.

This is a formal reminder regarding outstanding invoice ${invoiceNumber} amounting to ${formattedAmount}, which matured on ${formattedDueDate}${daysOverdue > 0 ? ` and is currently ${daysOverdue} days overdue` : ''}.

Kindly review this invoice with your finance department and arrange for the settlement at your earliest convenience. Should you require an additional copy of the invoice or our bank details, please do not hesitate to reach out.

Thank you for your prompt attention to this matter.

Best regards,
Accounts Receivable
${businessName}`;
};

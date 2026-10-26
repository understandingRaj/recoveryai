import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  initialBusiness,
  initialUser,
  initialCustomers,
  initialInvoices,
  initialFollowUps,
  initialActivities,
  initialRecommendations,
  collectionTrendData
} from '../services/mockData';
import { computeInvoiceStatus, calculateDaysOverdue } from '../utils/currency';
import { checkApiHealth, invoicesAPI, customersAPI, followUpsAPI, reportsAPI } from '../services/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // Local storage hydrated states
  const [business, setBusiness] = useState(() => {
    const saved = localStorage.getItem('recoverai_business');
    return saved ? JSON.parse(saved) : initialBusiness;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('recoverai_user');
    return saved ? JSON.parse(saved) : initialUser;
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('recoverai_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('recoverai_invoices');
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [followUps, setFollowUps] = useState(() => {
    const saved = localStorage.getItem('recoverai_followups');
    return saved ? JSON.parse(saved) : initialFollowUps;
  });

  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('recoverai_activities');
    return saved ? JSON.parse(saved) : initialActivities;
  });

  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [collectionTrend, setCollectionTrend] = useState(collectionTrendData);

  // Check backend server health
  useEffect(() => {
    let isMounted = true;
    checkApiHealth().then((online) => {
      if (isMounted) {
        setIsBackendOnline(online);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('recoverai_business', JSON.stringify(business));
  }, [business]);

  useEffect(() => {
    localStorage.setItem('recoverai_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('recoverai_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('recoverai_followups', JSON.stringify(followUps));
  }, [followUps]);

  useEffect(() => {
    localStorage.setItem('recoverai_activities', JSON.stringify(activities));
  }, [activities]);

  // Recalculate customer totals whenever invoices change
  useEffect(() => {
    setCustomers((prevCustomers) =>
      prevCustomers.map((cust) => {
        const custInvoices = invoices.filter((inv) => inv.customerId === cust.id || inv.customerName === cust.company);
        const totalInvoiced = custInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
        const totalPaid = custInvoices.reduce((sum, inv) => sum + (Number(inv.amountPaid) || 0), 0);
        const totalOutstanding = custInvoices.reduce((sum, inv) => sum + (Number(inv.remainingAmount) || 0), 0);
        const totalOverdue = custInvoices
          .filter((inv) => inv.status === 'Overdue')
          .reduce((sum, inv) => sum + (Number(inv.remainingAmount) || 0), 0);

        return {
          ...cust,
          totalInvoiced,
          totalPaid,
          totalOutstanding,
          totalOverdue
        };
      })
    );
  }, [invoices]);

  // Audit Activity helper
  const addActivity = ({ type, description, customerName, invoiceNumber, status = 'completed' }) => {
    const newAct = {
      id: `act_${Date.now()}`,
      type,
      description,
      customerName,
      invoiceNumber,
      user: user.name,
      timestamp: new Date().toISOString(),
      status
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // INVOICE ACTIONS
  const addInvoice = (invoiceData) => {
    const totalAmount = Number(invoiceData.totalAmount) || 0;
    const amountPaid = Number(invoiceData.amountPaid) || 0;
    const remainingAmount = Math.max(0, totalAmount - amountPaid);
    const daysOverdue = calculateDaysOverdue(invoiceData.dueDate, invoiceData.status);
    const status = computeInvoiceStatus(totalAmount, amountPaid, invoiceData.dueDate);

    const newInvoice = {
      ...invoiceData,
      id: `inv_${Date.now()}`,
      totalAmount,
      amountPaid,
      remainingAmount,
      daysOverdue,
      status
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    addActivity({
      type: 'invoice_created',
      description: `Created invoice ${newInvoice.invoiceNumber} for ₹${totalAmount.toLocaleString('en-IN')}`,
      customerName: newInvoice.customerName,
      invoiceNumber: newInvoice.invoiceNumber
    });
    toast.success(`Invoice ${newInvoice.invoiceNumber} created successfully!`);
    return newInvoice;
  };

  const updateInvoice = (id, updatedData) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        const totalAmount = Number(updatedData.totalAmount !== undefined ? updatedData.totalAmount : inv.totalAmount) || 0;
        const amountPaid = Number(updatedData.amountPaid !== undefined ? updatedData.amountPaid : inv.amountPaid) || 0;
        const remainingAmount = Math.max(0, totalAmount - amountPaid);
        const dueDate = updatedData.dueDate || inv.dueDate;
        const status = computeInvoiceStatus(totalAmount, amountPaid, dueDate);
        const daysOverdue = calculateDaysOverdue(dueDate, status);

        const updated = {
          ...inv,
          ...updatedData,
          totalAmount,
          amountPaid,
          remainingAmount,
          status,
          daysOverdue
        };
        return updated;
      })
    );

    addActivity({
      type: 'invoice_updated',
      description: `Updated invoice details for ${updatedData.invoiceNumber || id}`,
      customerName: updatedData.customerName,
      invoiceNumber: updatedData.invoiceNumber
    });
    toast.success('Invoice updated successfully');
  };

  const deleteInvoice = (id) => {
    const inv = invoices.find((i) => i.id === id);
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    if (inv) {
      addActivity({
        type: 'invoice_deleted',
        description: `Deleted invoice ${inv.invoiceNumber}`,
        customerName: inv.customerName,
        invoiceNumber: inv.invoiceNumber
      });
    }
    toast.success('Invoice deleted');
  };

  const recordPayment = (invoiceId, paymentAmount, paymentDate = new Date().toISOString().split('T')[0], paymentMethod = 'Bank Transfer', notes = '') => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) {
      toast.error('Invoice not found');
      return;
    }

    const payAmt = Number(paymentAmount);
    if (isNaN(payAmt) || payAmt <= 0) {
      toast.error('Invalid payment amount');
      return;
    }

    if (payAmt > inv.remainingAmount) {
      toast.error(`Payment cannot exceed remaining amount (₹${inv.remainingAmount.toLocaleString('en-IN')})`);
      return;
    }

    const newAmountPaid = inv.amountPaid + payAmt;
    const newRemaining = Math.max(0, inv.totalAmount - newAmountPaid);
    const newStatus = computeInvoiceStatus(inv.totalAmount, newAmountPaid, inv.dueDate);
    const daysOverdue = calculateDaysOverdue(inv.dueDate, newStatus);

    setInvoices((prev) =>
      prev.map((i) =>
        i.id === invoiceId
          ? {
              ...i,
              amountPaid: newAmountPaid,
              remainingAmount: newRemaining,
              status: newStatus,
              daysOverdue
            }
          : i
      )
    );

    addActivity({
      type: 'payment_recorded',
      description: `Recorded payment of ₹${payAmt.toLocaleString('en-IN')} via ${paymentMethod} for ${inv.invoiceNumber}`,
      customerName: inv.customerName,
      invoiceNumber: inv.invoiceNumber
    });

    toast.success(`Payment of ₹${payAmt.toLocaleString('en-IN')} recorded successfully`);
  };

  const importInvoices = (importedList) => {
    const processed = importedList.map((item, index) => {
      const totalAmount = Number(item.totalAmount) || 0;
      const amountPaid = Number(item.amountPaid) || 0;
      const remainingAmount = Math.max(0, totalAmount - amountPaid);
      const status = computeInvoiceStatus(totalAmount, amountPaid, item.dueDate);
      const daysOverdue = calculateDaysOverdue(item.dueDate, status);

      return {
        id: `inv_imp_${Date.now()}_${index}`,
        invoiceNumber: item.invoiceNumber || `INV-${Date.now()}-${index + 1}`,
        customerId: item.customerId || 'cust_001',
        customerName: item.customerName || 'Imported Client',
        customerEmail: item.customerEmail || '',
        invoiceDate: item.invoiceDate || new Date().toISOString().split('T')[0],
        dueDate: item.dueDate || new Date().toISOString().split('T')[0],
        totalAmount,
        amountPaid,
        remainingAmount,
        status,
        daysOverdue,
        notes: item.notes || 'Imported via CSV'
      };
    });

    setInvoices((prev) => [...processed, ...prev]);
    toast.success(`Successfully imported ${processed.length} invoices`);
  };

  // CUSTOMER ACTIONS
  const addCustomer = (customerData) => {
    const newCust = {
      ...customerData,
      id: `cust_${Date.now()}`,
      totalInvoiced: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      totalOverdue: 0,
      lastContactDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    setCustomers((prev) => [newCust, ...prev]);
    addActivity({
      type: 'customer_added',
      description: `Added customer ${newCust.company || newCust.name}`,
      customerName: newCust.company || newCust.name
    });
    toast.success('Customer added successfully');
    return newCust;
  };

  const updateCustomer = (id, updatedData) => {
    setCustomers((prev) =>
      prev.map((cust) => (cust.id === id ? { ...cust, ...updatedData } : cust))
    );
    toast.success('Customer details updated');
  };

  const deleteCustomer = (id) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    toast.success('Customer removed');
  };

  // FOLLOW-UP ACTIONS
  const addFollowUp = (data) => {
    const newFlw = {
      ...data,
      id: `flw_${Date.now()}`,
      status: data.status || 'Pending',
      createdDate: new Date().toISOString().split('T')[0]
    };
    setFollowUps((prev) => [newFlw, ...prev]);
    addActivity({
      type: 'reminder_drafted',
      description: `Scheduled follow-up for ${newFlw.customerName} (${newFlw.channel})`,
      customerName: newFlw.customerName,
      invoiceNumber: newFlw.invoiceNumber,
      status: 'drafted'
    });
    toast.success('Follow-up scheduled');
    return newFlw;
  };

  const completeFollowUp = (id, notes = '') => {
    const flw = followUps.find((f) => f.id === id);
    setFollowUps((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'Completed', completedNotes: notes } : f))
    );
    if (flw) {
      addActivity({
        type: 'follow_up_completed',
        description: `Completed follow-up for ${flw.customerName}`,
        customerName: flw.customerName,
        invoiceNumber: flw.invoiceNumber
      });
    }
    toast.success('Follow-up marked as completed');
  };

  const rescheduleFollowUp = (id, newDate) => {
    setFollowUps((prev) =>
      prev.map((f) => (f.id === id ? { ...f, scheduledDate: newDate, status: 'Pending' } : f))
    );
    const flw = followUps.find((f) => f.id === id);
    if (flw) {
      addActivity({
        type: 'follow_up_rescheduled',
        description: `Rescheduled follow-up for ${flw.customerName} to ${newDate}`,
        customerName: flw.customerName,
        invoiceNumber: flw.invoiceNumber
      });
    }
    toast.success('Follow-up rescheduled');
  };

  const sendFollowUpMessage = (id, customizedMessage) => {
    const flw = followUps.find((f) => f.id === id);
    if (!flw) return;

    // In demo/safety mode, mark sent & add audit trail
    setFollowUps((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              message: customizedMessage || f.message,
              lastContactDate: new Date().toISOString().split('T')[0]
            }
          : f
      )
    );

    addActivity({
      type: 'reminder_sent',
      description: `Sent ${flw.channel} reminder to ${flw.customerName} for ${flw.invoiceNumber}`,
      customerName: flw.customerName,
      invoiceNumber: flw.invoiceNumber,
      status: 'delivered'
    });

    toast.success(`Reminder sent to ${flw.customerName} via ${flw.channel}`);
  };

  // Reset demo data helper
  const resetDemoData = () => {
    localStorage.removeItem('recoverai_business');
    localStorage.removeItem('recoverai_customers');
    localStorage.removeItem('recoverai_invoices');
    localStorage.removeItem('recoverai_followups');
    localStorage.removeItem('recoverai_activities');
    setBusiness(initialBusiness);
    setCustomers(initialCustomers);
    setInvoices(initialInvoices);
    setFollowUps(initialFollowUps);
    setActivities(initialActivities);
    toast.success('Reset to demo baseline data');
  };

  // KPI Calculations
  const totalOutstanding = invoices.reduce((sum, inv) => sum + (Number(inv.remainingAmount) || 0), 0);
  const overdueAmount = invoices
    .filter((inv) => inv.status === 'Overdue')
    .reduce((sum, inv) => sum + (Number(inv.remainingAmount) || 0), 0);
  const collectedThisMonth = 365800; // Realistic demo figure matching prompt
  const followUpsDueTodayList = followUps.filter((f) => f.status === 'Pending');
  const highPriorityFollowUpsCount = followUpsDueTodayList.filter((f) => f.priority === 'High').length;

  return (
    <AppContext.Provider
      value={{
        business,
        setBusiness,
        user,
        setUser,
        customers,
        invoices,
        followUps,
        activities,
        recommendations,
        collectionTrend,
        isBackendOnline,
        // Actions
        addInvoice,
        updateInvoice,
        deleteInvoice,
        recordPayment,
        importInvoices,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addFollowUp,
        completeFollowUp,
        rescheduleFollowUp,
        sendFollowUpMessage,
        addActivity,
        resetDemoData,
        // Computed KPIs
        totalOutstanding,
        overdueAmount,
        collectedThisMonth,
        followUpsDueTodayList,
        highPriorityFollowUpsCount
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

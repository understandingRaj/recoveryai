import FollowUp from '../models/FollowUp.js';
import Activity from '../models/Activity.js';

// @desc    Get follow-ups with queue and search filters
// @route   GET /api/follow-ups
export const getFollowUps = async (req, res) => {
  const { queue, search, channel, priority } = req.query;
  const query = { businessId: req.businessId };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (queue === 'today') {
    query.status = 'Pending';
    query.scheduledDate = { $gte: today, $lt: tomorrow };
  } else if (queue === 'upcoming') {
    query.status = 'Pending';
    query.scheduledDate = { $gte: tomorrow };
  } else if (queue === 'overdue') {
    query.status = 'Pending';
    query.scheduledDate = { $lt: today };
  } else if (queue === 'completed') {
    query.status = 'Completed';
  }

  if (channel && channel !== 'All') {
    query.channel = channel;
  }

  if (priority && priority !== 'All') {
    query.priority = priority;
  }

  if (search) {
    query.$or = [
      { customerName: { $regex: search, $options: 'i' } },
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } }
    ];
  }

  const followUps = await FollowUp.find(query).sort({ scheduledDate: 1, priority: 1 });

  res.json({
    success: true,
    count: followUps.length,
    data: followUps
  });
};

// @desc    Create new follow-up schedule
// @route   POST /api/follow-ups
export const createFollowUp = async (req, res) => {
  const { customerId, customerName, invoiceId, invoiceNumber, amountDue, scheduledDate, priority, channel, message } = req.body;

  if (!customerName || !scheduledDate) {
    return res.status(400).json({ message: 'Customer name and scheduled date are required' });
  }

  const followUp = await FollowUp.create({
    businessId: req.businessId,
    customerId,
    customerName,
    invoiceId,
    invoiceNumber: invoiceNumber || '',
    amountDue: Number(amountDue) || 0,
    scheduledDate: new Date(scheduledDate),
    priority: priority || 'Medium',
    channel: channel || 'Email',
    message: message || '',
    status: 'Pending'
  });

  await Activity.create({
    businessId: req.businessId,
    type: 'reminder_drafted',
    description: `Scheduled follow-up reminder for ${customerName} (${channel || 'Email'})`,
    customerName,
    invoiceNumber,
    user: req.user?.name || 'Alex Vance',
    status: 'drafted'
  });

  res.status(201).json({
    success: true,
    data: followUp
  });
};

// @desc    Update follow-up
// @route   PUT /api/follow-ups/:id
export const updateFollowUp = async (req, res) => {
  let followUp = await FollowUp.findOne({ _id: req.params.id, businessId: req.businessId });
  if (!followUp) {
    return res.status(404).json({ message: 'Follow-up not found' });
  }

  followUp = await FollowUp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    data: followUp
  });
};

// @desc    Update follow-up status (e.g. Completed, Rescheduled)
// @route   PATCH /api/follow-ups/:id/status
export const updateFollowUpStatus = async (req, res) => {
  const { status, scheduledDate, completedNotes, message } = req.body;

  const followUp = await FollowUp.findOne({ _id: req.params.id, businessId: req.businessId });
  if (!followUp) {
    return res.status(404).json({ message: 'Follow-up not found' });
  }

  if (status) followUp.status = status;
  if (scheduledDate) followUp.scheduledDate = new Date(scheduledDate);
  if (completedNotes !== undefined) followUp.completedNotes = completedNotes;
  if (message) followUp.message = message;

  await followUp.save();

  // Audit activity based on action
  if (status === 'Completed') {
    await Activity.create({
      businessId: req.businessId,
      type: 'follow_up_completed',
      description: `Completed follow-up for ${followUp.customerName} (${completedNotes || 'Resolved'})`,
      customerName: followUp.customerName,
      invoiceNumber: followUp.invoiceNumber,
      user: req.user?.name || 'Alex Vance',
      status: 'completed'
    });
  } else if (status === 'Rescheduled' || scheduledDate) {
    await Activity.create({
      businessId: req.businessId,
      type: 'follow_up_rescheduled',
      description: `Rescheduled follow-up for ${followUp.customerName} to ${new Date(scheduledDate || followUp.scheduledDate).toISOString().split('T')[0]}`,
      customerName: followUp.customerName,
      invoiceNumber: followUp.invoiceNumber,
      user: req.user?.name || 'Alex Vance',
      status: 'completed'
    });
  }

  res.json({
    success: true,
    data: followUp
  });
};

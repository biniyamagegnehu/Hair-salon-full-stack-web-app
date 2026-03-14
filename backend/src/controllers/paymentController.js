const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const SalonConfig = require('../models/SalonConfig');
const chapaService = require('../services/chapaService');
const ApiResponse = require('../utils/response');

const paymentController = {
  // Initialize payment for appointment
  initializePayment: async (req, res) => {
    try {
      const { appointmentId } = req.body;
      const customerId = req.user._id;

      if (!appointmentId) {
        return res.status(400).json(
          ApiResponse.error('Appointment ID is required')
        );
      }

      // Validate appointment
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        customer: customerId,
        status: 'PENDING_PAYMENT'
      }).populate('service');

      if (!appointment) {
        return res.status(404).json(
          ApiResponse.error('Appointment not found or already paid')
        );
      }

      // Get salon config for advance payment percentage
      const salonConfig = await SalonConfig.findOne();
      const advancePercentage = salonConfig?.advancePaymentPercentage || 50;

      // Calculate advance amount
      const advanceAmount = Math.ceil(appointment.payment.totalAmount * (advancePercentage / 100));

      if (advanceAmount <= 0) {
        return res.status(400).json(
          ApiResponse.error('Advance payment amount must be greater than zero')
        );
      }

      // Ensure customer has a valid email format for Chapa
      let customerEmail = req.user.email;
      if (!customerEmail) {
        const cleanPhone = req.user.phoneNumber ? req.user.phoneNumber.replace(/\D/g, '') : 'customer';
        customerEmail = `${cleanPhone}@xsalon.com`;
      }

      // Ensure valid name formatting
      const [firstName = 'Customer', ...lastNameParts] = req.user.fullName ? req.user.fullName.split(' ') : [];
      const lastName = lastNameParts.length > 0 ? lastNameParts.join(' ') : 'XSalon';

      // Format payment data for Chapa
      const paymentData = chapaService.formatPaymentData({
        amount: advanceAmount.toString(),
        email: customerEmail,
        phone_number: req.user.phoneNumber,
        first_name: firstName,
        last_name: lastName,
        callback_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/webhook`,
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/appointments/${appointmentId}/payment-callback`,
        customization: {
          title: 'X Mens Salon',
          description: `Advance payment for ${appointment.service.name.en}`
        }
      });

      // Initialize transaction with Chapa
      const chapaResponse = await chapaService.initializeTransaction(paymentData);

      if (!chapaResponse.success) {
        return res.status(400).json(
          ApiResponse.error(chapaResponse.error || 'Payment initialization failed')
        );
      }

      // Update appointment with transaction reference
      appointment.payment.chapaTransactionId = paymentData.tx_ref;
      appointment.payment.advanceAmount = advanceAmount;
      await appointment.save();

      // Return payment URL to frontend
      res.json(ApiResponse.success('Payment initialized', {
        paymentUrl: chapaResponse.data.data.checkout_url,
        transactionId: paymentData.tx_ref,
        advanceAmount,
        totalAmount: appointment.payment.totalAmount
      }));

    } catch (error) {
      console.error('Initialize payment error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Verify payment
  verifyPayment: async (req, res) => {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        return res.status(400).json(
          ApiResponse.error('Transaction ID is required')
        );
      }

      // Verify with Chapa
      const verification = await chapaService.verifyTransaction(transactionId);

      if (!verification.success) {
        return res.status(400).json(
          ApiResponse.error(verification.error || 'Payment verification failed')
        );
      }

      const paymentData = verification.data.data;

      // Find appointment with this transaction ID
      const appointment = await Appointment.findOne({
        'payment.chapaTransactionId': transactionId
      }).populate('service customer');

      if (!appointment) {
        return res.status(404).json(
          ApiResponse.error('Appointment not found for this transaction')
        );
      }

      // Update payment status based on Chapa response
      if (paymentData.status === 'success') {
        appointment.payment.paymentStatus = 'PARTIAL';
        appointment.payment.paymentDate = new Date();
        appointment.status = 'CONFIRMED';
        
        // Add to queue (calculate queue position)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const appointmentsToday = await Appointment.countDocuments({
          scheduledDate: { $gte: today },
          status: { $in: ['CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'] }
        });
        
        appointment.queuePosition = appointmentsToday + 1;
        
        await appointment.save();

        return res.json(ApiResponse.success('Payment verified and appointment confirmed', {
          appointmentId: appointment._id,
          status: appointment.status,
          queuePosition: appointment.queuePosition,
          paymentStatus: appointment.payment.paymentStatus
        }));
      } else {
        appointment.payment.paymentStatus = 'FAILED';
        await appointment.save();

        return res.json(ApiResponse.success('Payment failed', {
          appointmentId: appointment._id,
          status: appointment.status,
          paymentStatus: appointment.payment.paymentStatus
        }));
      }

    } catch (error) {
      console.error('Verify payment error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Chapa webhook handler
  handleWebhook: async (req, res) => {
    try {
      // Verify webhook signature
      const signature = req.headers['x-chapa-signature'] || req.headers['chapa-signature'];
      
      if (!signature) {
        console.error('Webhook missing signature header');
        return res.status(401).json({ error: 'Missing signature' });
      }

      // We added rawBody in express.json()
      const rawBody = req.rawBody || JSON.stringify(req.body);
      const isSignatureValid = chapaService.verifyWebhookSignature(signature, rawBody);

      if (!isSignatureValid) {
        console.error('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const webhookData = req.body;
      const transactionId = webhookData.tx_ref || webhookData.reference;
      const eventType = webhookData.event;

      console.log('--- Chapa Webhook Received ---');
      console.log('Event:', eventType);
      console.log('Transaction:', transactionId);
      console.log('Status:', webhookData.status);

      if (!transactionId) {
        console.error('Webhook missing transaction reference');
        return res.status(400).json({ error: 'Transaction reference is missing' });
      }

      // Find appointment
      const appointment = await Appointment.findOne({
        'payment.chapaTransactionId': transactionId
      });

      if (!appointment) {
        console.error('Appointment not found for transaction:', transactionId);
        return res.status(404).json({ error: 'Appointment not found' });
      }

      // Process webhook based on event type or status
      // Note: Chapa may send just status='success' if event is not defined sometimes
      const statusToProcess = eventType || (webhookData.status === 'success' ? 'charge.success' : 'charge.failure');

      switch (statusToProcess) {
        case 'charge.success':
        case 'success':
          appointment.payment.paymentStatus = 'PARTIAL';
          appointment.payment.paymentDate = new Date();
          appointment.status = 'CONFIRMED';
          console.log(`✅ Appointment ${appointment._id} confirmed via webhook`);
          break;

        case 'charge.failure':
        case 'failed':
          appointment.payment.paymentStatus = 'FAILED';
          console.log(`❌ Appointment ${appointment._id} payment failed via webhook`);
          break;

        case 'charge.completed':
          appointment.payment.paymentStatus = 'COMPLETED';
          console.log(`✅ Appointment ${appointment._id} payment fully completed via webhook`);
          break;

        case 'charge.refunded':
          appointment.payment.paymentStatus = 'REFUNDED';
          appointment.status = 'CANCELLED';
          console.log(`↩️ Appointment ${appointment._id} payment refunded via webhook`);
          break;
          
        default:
          console.log(`ℹ️ Unhandled webhook event/status: ${statusToProcess}`);
      }

      await appointment.save();
      console.log('--- Webhook processing finished ---');

      // Always return 200 OK to Chapa to acknowledge receipt
      res.status(200).json({ status: 'success' });

    } catch (error) {
      console.error('Webhook handler error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get payment methods
  getPaymentMethods: async (req, res) => {
    try {
      const methods = await chapaService.getPaymentMethods();

      if (!methods.success) {
        return res.status(400).json(
          ApiResponse.error(methods.error || 'Failed to fetch payment methods')
        );
      }

      res.json(ApiResponse.success('Payment methods fetched', methods.data));

    } catch (error) {
      console.error('Get payment methods error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Complete payment at salon (remaining amount)
  completePayment: async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const { amountPaid, paymentMethod = 'CASH' } = req.body;

      if (!amountPaid || isNaN(amountPaid) || amountPaid <= 0) {
        return res.status(400).json(
          ApiResponse.error('Valid payment amount is required')
        );
      }

      // Find appointment (admin can update any appointment)
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        status: { $in: ['CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED'] }
      });

      if (!appointment) {
        return res.status(404).json(
          ApiResponse.error('Appointment not found or not eligible for payment completion')
        );
      }

      // Calculate remaining amount
      const amountPaidSoFar = appointment.payment.advanceAmount || 0;
      const remainingAmount = appointment.payment.totalAmount - amountPaidSoFar;

      if (amountPaid < remainingAmount) {
        return res.status(400).json(
          ApiResponse.error(`Minimum remaining amount to pay: ${remainingAmount} ETB`)
        );
      }

      // Update payment
      appointment.payment.paymentStatus = 'COMPLETED';
      appointment.payment.paymentDate = new Date();
      
      // Store cash payment details
      appointment.payment.cashPayment = {
        amount: amountPaid,
        method: paymentMethod,
        receivedBy: req.user._id,
        receivedAt: new Date()
      };

      await appointment.save();

      res.json(ApiResponse.success('Payment completed', {
        appointmentId: appointment._id,
        paymentStatus: appointment.payment.paymentStatus,
        totalPaid: appointment.payment.totalAmount,
        changeGiven: amountPaid - remainingAmount
      }));

    } catch (error) {
      console.error('Complete payment error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  },

  // Refund payment (admin only)
  refundPayment: async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json(
          ApiResponse.error('Refund reason is required')
        );
      }

      // Find appointment
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        'payment.paymentStatus': { $in: ['PARTIAL', 'COMPLETED'] }
      });

      if (!appointment) {
        return res.status(404).json(
          ApiResponse.error('Appointment not found or not eligible for refund')
        );
      }

      // Update appointment status
      appointment.status = 'CANCELLED';
      appointment.payment.paymentStatus = 'REFUNDED';
      
      // Store refund details
      appointment.payment.refund = {
        amount: appointment.payment.advanceAmount,
        reason,
        processedBy: req.user._id,
        processedAt: new Date()
      };

      await appointment.save();

      // TODO: Integrate with Chapa API for actual refund if needed

      res.json(ApiResponse.success('Refund processed', {
        appointmentId: appointment._id,
        status: appointment.status,
        refundAmount: appointment.payment.advanceAmount
      }));

    } catch (error) {
      console.error('Refund payment error:', error);
      res.status(500).json(ApiResponse.serverError());
    }
  }
};

module.exports = paymentController;
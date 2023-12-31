const router = require('express').Router();
const authmiddleware = require('../middlewares/authmiddleware');
const Booking = require('../models/bookingsmodel');
const Bus = require('../models/busmodel');
const stripe = require('stripe')(process.env.stripe_key);
const { v4: uuidv4 } = require('uuid');

// book a seat

router.post('/book-seat', authmiddleware, async (req, res) => {
  try {
    const newBooking = new Booking({
      ...req.body,

      user: req.body.userId,
    });
    await newBooking.save();
    const bus = await Bus.findById(req.body.bus);
    bus.seatsBooked = [...bus.seatsBooked, ...req.body.seats];
    await bus.save();
    res.status(200).send({
      message: 'Booking successful',
      data: newBooking,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: 'Booking failed',
      data: error,
      success: false,
    });
  }
});

// make payment

router.post('/make-payment', authmiddleware, async (req, res) => {
  try {
    const { token, amount } = req.body;
    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
    });
    const payment = await stripe.paymentIntents.create(
      {
        amount: amount,
        currency: 'inr',
        customer: customer.id,
        receipt_email: token.email,
      },
      {
        idempotencyKey: uuidv4(),
      }
    );

    if (payment) {
      res.status(200).send({
        message: 'Payment successful',
        data: {
          transactionId: payment.id,
        },
        success: true,
      });
    } else {
      res.status(500).send({
        message: 'Payment failed',
        data: error,
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: 'Payment failed',
      data: error,
      success: false,
    });
  }
});
// get bookings by userid

router.post('/get-bookings-by-user-id', authmiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.body.userId })
      .populate('bus')
      .populate('user');
    res.status(200).send({
      message: 'Bookings fetched successfully',
      data: bookings,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: 'Bookings fetch failed',
      data: error,
      success: false,
    });
  }
});

module.exports = router;

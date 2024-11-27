const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const { check, validationResult } = require('express-validator');

// @route   GET api/transactions
// @desc    Get user's transactions
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/transactions
// @desc    Create a new transaction
// @access  Private
router.post('/', [
  auth,
  [
    check('amount', 'Amount is required').isFloat({ min: 0.01 }),
    check('cardNumber', 'Valid card number is required').isLength({ min: 16, max: 16 }),
    check('merchantName', 'Merchant name is required').not().isEmpty(),
    check('category', 'Valid category is required').isIn(['retail', 'entertainment', 'travel', 'food', 'other'])
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { amount, cardNumber, merchantName, category, timestamp } = req.body;

    // Create new transaction
    const transaction = new Transaction({
      user: req.user.id,
      amount,
      cardNumber,
      merchantName,
      category,
      timestamp: timestamp || Date.now(),
      status: 'completed' // Default status
    });

    await transaction.save();
    res.json(transaction);
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/transactions/:id
// @desc    Get transaction by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (err) {
    console.error('Error fetching transaction:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/transactions/:id/status
// @desc    Update transaction status
// @access  Private
router.put('/:id/status', [
  auth,
  check('status', 'Valid status is required').isIn(['pending', 'completed', 'flagged', 'declined'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    transaction.status = req.body.status;
    await transaction.save();

    res.json(transaction);
  } catch (err) {
    console.error('Error updating transaction status:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;

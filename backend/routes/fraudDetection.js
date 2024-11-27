const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');

// @route   POST api/fraud-detection
// @desc    Analyze transaction for potential fraud and store in database
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
    
    // Get user's transaction history
    const userTransactions = await Transaction.find({ 
      user: req.user.id,
      timestamp: { 
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    });

    // Calculate risk factors
    const riskAssessment = calculateRiskAssessment({
      amount,
      category,
      timestamp,
      merchantName,
      userTransactions,
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent']
    });

    // Create new transaction
    const transaction = new Transaction({
      user: req.user.id,
      amount,
      cardNumber,
      merchantName,
      category,
      timestamp: timestamp || Date.now(),
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent'],
      riskAssessment: riskAssessment,
      status: getRiskBasedStatus(riskAssessment.score),
      recommendations: generateRecommendations(riskAssessment.factors)
    });

    // Save transaction to database
    await transaction.save();

    // Return risk assessment results
    res.json({
      transactionId: transaction._id,
      riskLevel: riskAssessment.level,
      summary: generateSummary(riskAssessment),
      factors: riskAssessment.factors,
      recommendations: transaction.recommendations,
      status: transaction.status
    });

  } catch (err) {
    console.error('Fraud detection error:', err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/fraud-detection/history
// @desc    Get user's transaction history with risk assessments
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(transactions);
  } catch (err) {
    console.error('Transaction history error:', err);
    res.status(500).send('Server Error');
  }
});

// Helper functions
function calculateRiskAssessment({ amount, category, timestamp, merchantName, userTransactions, ipAddress, deviceInfo }) {
  let score = 0;
  const factors = [];
  
  // Amount-based risk
  if (amount > 1000) {
    score += 30;
    factors.push({ name: 'High Transaction Amount', impact: 'high' });
  } else if (amount > 500) {
    score += 20;
    factors.push({ name: 'Elevated Transaction Amount', impact: 'medium' });
  }

  // Category-based risk
  const highRiskCategories = ['entertainment', 'travel'];
  if (highRiskCategories.includes(category.toLowerCase())) {
    score += 20;
    factors.push({ name: 'High-Risk Category', impact: 'medium' });
  }

  // Time-based risk
  const txnHour = new Date(timestamp).getHours();
  if (txnHour < 6 || txnHour > 23) {
    score += 15;
    factors.push({ name: 'Unusual Transaction Time', impact: 'medium' });
  }

  // Frequency-based risk
  const recentTransactions = userTransactions.filter(t => 
    t.merchantName === merchantName && 
    new Date(t.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );
  if (recentTransactions.length >= 3) {
    score += 25;
    factors.push({ name: 'Unusual Transaction Frequency', impact: 'high' });
  }

  // Location/Device-based risk (basic implementation)
  const unusualDevice = !userTransactions.some(t => t.deviceInfo === deviceInfo);
  if (unusualDevice) {
    score += 15;
    factors.push({ name: 'New Device Detected', impact: 'medium' });
  }

  return {
    score,
    level: getRiskLevel(score),
    factors
  };
}

function getRiskLevel(score) {
  if (score >= 50) return 'High';
  if (score >= 30) return 'Medium';
  return 'Low';
}

function getRiskBasedStatus(score) {
  if (score >= 50) return 'flagged';
  if (score >= 30) return 'pending';
  return 'completed';
}

function generateSummary(riskAssessment) {
  const { score, level, factors } = riskAssessment;
  
  if (level === 'High') {
    return `This transaction has been flagged for high risk (score: ${score}). Multiple risk factors detected.`;
  } else if (level === 'Medium') {
    return `This transaction shows moderate risk indicators (score: ${score}). Additional verification may be required.`;
  }
  return `This transaction appears to be normal with low risk indicators (score: ${score}).`;
}

function generateRecommendations(factors) {
  const recommendations = new Set();

  factors.forEach(factor => {
    switch (factor.name) {
      case 'High Transaction Amount':
        recommendations.add('Verify transaction with cardholder');
        recommendations.add('Request additional identification');
        recommendations.add('Consider splitting large transactions');
        break;
      case 'Elevated Transaction Amount':
        recommendations.add('Monitor for subsequent high-value transactions');
        break;
      case 'High-Risk Category':
        recommendations.add('Enable enhanced monitoring for this category');
        recommendations.add('Consider implementing category-specific limits');
        break;
      case 'Unusual Transaction Time':
        recommendations.add('Confirm transaction timing with cardholder');
        recommendations.add('Review recent account activity');
        break;
      case 'Unusual Transaction Frequency':
        recommendations.add('Review pattern of transactions with this merchant');
        recommendations.add('Consider temporary merchant-specific limits');
        break;
      case 'New Device Detected':
        recommendations.add('Verify device with cardholder');
        recommendations.add('Enable additional authentication factors');
        break;
    }
  });

  return Array.from(recommendations);
}

module.exports = router;

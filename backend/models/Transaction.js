const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  cardNumber: {
    type: String,
    required: true,
    // Store last 4 digits only for security
    set: (number) => number.slice(-4),
    get: (last4) => `****-****-****-${last4}`
  },
  merchantName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['retail', 'entertainment', 'travel', 'food', 'other']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String,
    default: 'unknown'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'declined', 'flagged'],
    default: 'pending'
  },
  riskAssessment: {
    score: {
      type: Number,
      required: true
    },
    level: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true
    },
    factors: [{
      name: String,
      impact: {
        type: String,
        enum: ['low', 'medium', 'high']
      }
    }]
  },
  fraudulent: {
    type: Boolean,
    default: false
  },
  ipAddress: String,
  deviceInfo: String,
  recommendations: [String]
}, {
  timestamps: true
});

// Index for faster queries
TransactionSchema.index({ user: 1, timestamp: -1 });
TransactionSchema.index({ cardNumber: 1 });
TransactionSchema.index({ fraudulent: 1 });

module.exports = mongoose.model('transaction', TransactionSchema);

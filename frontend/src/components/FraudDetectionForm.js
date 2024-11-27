import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Card, Alert, ProgressBar } from 'react-bootstrap';
import { analyzeFraudRisk } from '../services/api';

const FraudDetectionForm = ({ onResultsReceived }) => {
  const initialFormData = {
    amount: '',
    cardNumber: '',
    merchantName: '',
    category: '',
    timestamp: new Date().toISOString()
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [realTimeRisk, setRealTimeRisk] = useState({
    score: 0,
    warnings: []
  });

  const assessRealTimeRisk = useCallback(() => {
    const warnings = [];
    let score = 0;

    // Amount-based assessment
    if (formData.amount) {
      const amount = parseFloat(formData.amount);
      if (amount > 1000) {
        warnings.push('High transaction amount detected');
        score += 30;
      } else if (amount > 500) {
        warnings.push('Moderate transaction amount');
        score += 15;
      }
    }

    // Category-based assessment
    if (formData.category) {
      const highRiskCategories = ['entertainment', 'travel'];
      if (highRiskCategories.includes(formData.category)) {
        warnings.push('High-risk category selected');
        score += 20;
      }
    }

    // Time-based assessment
    const currentHour = new Date().getHours();
    if (currentHour < 6 || currentHour > 23) {
      warnings.push('Unusual transaction time');
      score += 15;
    }

    setRealTimeRisk({ score, warnings });
  }, [formData]);

  // Real-time risk assessment
  useEffect(() => {
    assessRealTimeRisk();
  }, [assessRealTimeRisk]);

  const getRiskVariant = (score) => {
    if (score >= 50) return 'danger';
    if (score >= 30) return 'warning';
    return 'success';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate card number format
      if (!/^\d{16}$/.test(formData.cardNumber)) {
        throw new Error('Invalid card number format');
      }

      // Validate amount
      if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
        throw new Error('Invalid amount');
      }

      const results = await analyzeFraudRisk(formData);
      onResultsReceived(results);
      
      // Reset form if transaction is completed successfully
      if (results.status === 'completed') {
        setFormData(initialFormData);
        setRealTimeRisk({ score: 0, warnings: [] });
      }
    } catch (err) {
      setError(err.message || 'Error processing transaction. Please try again.');
      console.error('Fraud detection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Card number validation
    if (name === 'cardNumber') {
      const sanitizedValue = value.replace(/\D/g, '').slice(0, 16);
      setFormData(prev => ({
        ...prev,
        [name]: sanitizedValue,
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // Amount validation
    if (name === 'amount') {
      const sanitizedValue = value.replace(/[^\d.]/g, '');
      if (!sanitizedValue || /^\d*\.?\d{0,2}$/.test(sanitizedValue)) {
        setFormData(prev => ({
          ...prev,
          [name]: sanitizedValue,
          timestamp: new Date().toISOString()
        }));
      }
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
      timestamp: new Date().toISOString()
    }));
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h3>Transaction Details</h3>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        {realTimeRisk.warnings.length > 0 && (
          <Alert variant="warning" className="mb-3">
            <Alert.Heading>Risk Indicators:</Alert.Heading>
            <ul className="mb-0">
              {realTimeRisk.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Amount ($)</Form.Label>
            <Form.Control
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              placeholder="Enter transaction amount"
              isInvalid={formData.amount && (isNaN(formData.amount) || parseFloat(formData.amount) <= 0)}
            />
            <Form.Control.Feedback type="invalid">
              Please enter a valid amount greater than 0
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Card Number</Form.Label>
            <Form.Control
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              required
              placeholder="Enter 16-digit card number"
              isInvalid={formData.cardNumber && !/^\d{16}$/.test(formData.cardNumber)}
            />
            <Form.Control.Feedback type="invalid">
              Please enter a valid 16-digit card number
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Merchant Name</Form.Label>
            <Form.Control
              type="text"
              name="merchantName"
              value={formData.merchantName}
              onChange={handleChange}
              required
              placeholder="Enter merchant name"
              isInvalid={formData.merchantName && formData.merchantName.length < 2}
            />
            <Form.Control.Feedback type="invalid">
              Merchant name must be at least 2 characters
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              isInvalid={formData.category === ''}
            >
              <option value="">Select a category</option>
              <option value="retail">Retail</option>
              <option value="entertainment">Entertainment</option>
              <option value="travel">Travel</option>
              <option value="food">Food & Dining</option>
              <option value="other">Other</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              Please select a category
            </Form.Control.Feedback>
          </Form.Group>

          {realTimeRisk.score > 0 && (
            <div className="mb-3">
              <Form.Label>Real-time Risk Assessment</Form.Label>
              <ProgressBar
                variant={getRiskVariant(realTimeRisk.score)}
                now={realTimeRisk.score}
                label={`Risk Score: ${realTimeRisk.score}%`}
              />
            </div>
          )}

          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading}
            className="w-100"
          >
            {loading ? 'Analyzing...' : 'Analyze Transaction'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FraudDetectionForm;

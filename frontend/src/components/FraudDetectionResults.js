import React from 'react';
import { Card, Alert, ListGroup, Badge, Row, Col } from 'react-bootstrap';

const FraudDetectionResults = ({ results }) => {
  if (!results) return null;

  const getRiskLevelVariant = (riskLevel) => {
    switch (riskLevel.toLowerCase()) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'info';
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'success',
      pending: 'warning',
      flagged: 'danger',
      declined: 'danger'
    };
    return (
      <Badge bg={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h3>Fraud Detection Results</h3>
        {results.status && (
          <div>
            Transaction Status: {getStatusBadge(results.status)}
          </div>
        )}
      </Card.Header>
      <Card.Body>
        {/* Transaction ID */}
        {results.transactionId && (
          <Alert variant="info" className="mb-4">
            Transaction ID: {results.transactionId}
          </Alert>
        )}

        {/* Risk Assessment */}
        <Alert 
          variant={getRiskLevelVariant(results.riskLevel)}
          className="mb-4"
        >
          <Alert.Heading className="d-flex justify-content-between">
            <span>Risk Level: {results.riskLevel}</span>
          </Alert.Heading>
          <p className="mb-0">
            {results.summary}
          </p>
        </Alert>

        {/* Risk Factors */}
        {results.factors && results.factors.length > 0 && (
          <div className="mb-4">
            <h4>Risk Factors</h4>
            <ListGroup>
              {results.factors.map((factor, index) => (
                <ListGroup.Item 
                  key={index}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>{factor.name}</strong>
                    {factor.description && (
                      <p className="mb-0 text-muted small">{factor.description}</p>
                    )}
                  </div>
                  <Badge 
                    bg={factor.impact === 'high' ? 'danger' : 
                        factor.impact === 'medium' ? 'warning' : 'info'}
                    pill
                  >
                    {factor.impact}
                  </Badge>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}

        {/* Recommendations */}
        {results.recommendations && results.recommendations.length > 0 && (
          <div className="mt-4">
            <h4>Recommended Actions</h4>
            <Row>
              {results.recommendations.map((recommendation, index) => (
                <Col md={6} key={index} className="mb-3">
                  <Card className="h-100">
                    <Card.Body>
                      <Card.Text>{recommendation}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* Additional Information */}
        {results.additionalInfo && (
          <div className="mt-4">
            <h4>Additional Information</h4>
            <ListGroup variant="flush">
              {Object.entries(results.additionalInfo).map(([key, value], index) => (
                <ListGroup.Item key={index}>
                  <strong>{key}:</strong> {value}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-4 text-muted small">
          <p className="mb-0">
            This assessment is based on multiple risk factors and historical transaction patterns. 
            For additional security measures or to report suspicious activity, please contact support.
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default FraudDetectionResults;

import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import FraudDetectionForm from './FraudDetectionForm';
import FraudDetectionResults from './FraudDetectionResults';

const FraudDetection = () => {
  const [results, setResults] = useState(null);

  const handleResultsReceived = (detectionResults) => {
    setResults(detectionResults);
  };

  return (
    <Container>
      <div className="my-4">
        <h2 className="mb-4">Fraud Detection Analysis</h2>
        <div className="row">
          <div className="col-md-6">
            <FraudDetectionForm onResultsReceived={handleResultsReceived} />
          </div>
          <div className="col-md-6">
            {results && <FraudDetectionResults results={results} />}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default FraudDetection;

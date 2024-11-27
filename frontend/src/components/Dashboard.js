import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Badge, Spinner } from 'react-bootstrap';
import { getTransactions, formatTransaction, updateTransactionStatus } from '../services/api';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeVariant = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'flagged':
        return 'danger';
      case 'declined':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const handleMarkAsCompleted = async (transactionId) => {
    try {
      setUpdatingId(transactionId);
      await updateTransactionStatus(transactionId, 'completed');
      await fetchTransactions();
      setError(null);
    } catch (err) {
      setError('Failed to update transaction status. Please try again.');
      console.error('Error updating transaction:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleFlag = async (transactionId, currentStatus) => {
    try {
      setUpdatingId(transactionId);
      const newStatus = currentStatus === 'flagged' ? 'pending' : 'flagged';
      await updateTransactionStatus(transactionId, newStatus);
      await fetchTransactions();
      setError(null);
    } catch (err) {
      setError('Failed to update transaction status. Please try again.');
      console.error('Error updating transaction:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Container>
      <Card className="my-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>Transaction History</h2>
          <Button variant="primary" onClick={fetchTransactions}>
            Refresh
          </Button>
        </Card.Header>
        <Card.Body>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Table 
              responsive 
              striped 
              hover
              role="grid"
              aria-label="Transactions History Table"
            >
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Merchant</th>
                  <th scope="col">Category</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Risk Level</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => {
                    const formattedTx = formatTransaction(transaction);
                    return (
                      <tr 
                        key={formattedTx.id}
                        role="row"
                        tabIndex="0"
                        aria-label={`Transaction from ${formattedTx.merchantName} for ${formattedTx.amount}`}
                      >
                        <td>{formattedTx.timestamp}</td>
                        <td>{formattedTx.merchantName}</td>
                        <td>{formattedTx.category}</td>
                        <td>{formattedTx.amount}</td>
                        <td>
                          <Badge bg={getRiskBadgeVariant(formattedTx.riskLevel)}>
                            {formattedTx.riskLevel}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(formattedTx.status)}>
                            {formattedTx.status}
                          </Badge>
                        </td>
                        <td className="d-flex gap-2">
                          {formattedTx.status !== 'completed' && (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleMarkAsCompleted(formattedTx.id)}
                                disabled={updatingId === formattedTx.id}
                                aria-label={`Mark transaction from ${formattedTx.merchantName} as completed`}
                              >
                                {updatingId === formattedTx.id ? (
                                  <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  'Complete'
                                )}
                              </Button>
                              <Button
                                variant={formattedTx.status === 'flagged' ? 'warning' : 'danger'}
                                size="sm"
                                onClick={() => handleToggleFlag(formattedTx.id, formattedTx.status)}
                                disabled={updatingId === formattedTx.id}
                                aria-label={`${formattedTx.status === 'flagged' ? 'Unflag' : 'Flag'} transaction from ${formattedTx.merchantName}`}
                              >
                                {updatingId === formattedTx.id ? (
                                  <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  formattedTx.status === 'flagged' ? 'Unflag' : 'Flag'
                                )}
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Summary Section */}
      {transactions.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h3>Transaction Summary</h3>
          </Card.Header>
          <Card.Body>
            <div className="row">
              <div className="col-md-3 mb-3">
                <div className="card bg-primary text-white">
                  <div className="card-body">
                    <h5 className="card-title">Total Transactions</h5>
                    <h3>{transactions.length}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card bg-success text-white">
                  <div className="card-body">
                    <h5 className="card-title">Completed</h5>
                    <h3>
                      {transactions.filter(t => t.status === 'completed').length}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card bg-warning text-dark">
                  <div className="card-body">
                    <h5 className="card-title">Pending</h5>
                    <h3>
                      {transactions.filter(t => t.status === 'pending').length}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card bg-danger text-white">
                  <div className="card-body">
                    <h5 className="card-title">Flagged</h5>
                    <h3>
                      {transactions.filter(t => t.status === 'flagged').length}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Dashboard;

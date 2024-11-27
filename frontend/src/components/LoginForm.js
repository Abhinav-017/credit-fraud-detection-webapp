import React, { useState } from 'react';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import './components.css';

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await login(email, password);
      if (response.token) {
        setSuccess('Login successful! Redirecting to dashboard...');
        localStorage.setItem('token', response.token);
        onLogin && onLogin(response);
        // Add a small delay before redirecting to show the success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <div className="auth-form">
        <Card className="shadow">
          <Card.Body>
            <div className="hero-text mb-5">
              <h1 className="text-center mb-3">Trust and Safety with SecureNXT</h1>
              <h2 className="text-center mb-4">Identify Credit Card Fraud</h2>
              <p className="text-center text-muted">
                Protecting your financial transactions with advanced AI technology. 
                Your security is our top priority.
              </p>
            </div>
            <h3 className="text-center mb-4">Sign In to Your Account</h3>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </Form.Group>

              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 mt-3"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Form>
            <div className="text-center mt-3">
              <p>Don't have an account? <a href="/register">Register here</a></p>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default LoginForm;

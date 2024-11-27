import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import './components.css';

const NavigationBar = ({ isAuthenticated, onLogout }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <Navbar expand="lg" className="mb-4 custom-navbar">
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand-logo">
          <i className="fas fa-shield-alt me-2"></i>
          SecureNXT
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarNav" />
        <Navbar.Collapse id="navbarNav">
          {isAuthenticated ? (
            <>
              <Nav className="me-auto">
                <Nav.Link 
                  as={Link} 
                  to="/dashboard" 
                  className={isActive('/dashboard')}
                >
                  Dashboard
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/fraud-detection" 
                  className={isActive('/fraud-detection')}
                >
                  Fraud Detection
                </Nav.Link>
              </Nav>
              <Nav>
                <Nav.Link 
                  onClick={onLogout}
                  className="text-danger"
                >
                  Logout
                </Nav.Link>
              </Nav>
            </>
          ) : (
            <Nav className="ms-auto">
              <Nav.Link 
                as={Link} 
                to="/login" 
                className={isActive('/login')}
              >
                Login
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/register" 
                className={isActive('/register')}
              >
                Register
              </Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;

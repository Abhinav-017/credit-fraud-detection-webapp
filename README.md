# Credit Fraud Detection WebApp

A full-stack web application for credit card fraud detection and transaction management.

## Features

- Real-time fraud detection for credit card transactions
- Transaction history dashboard with filtering and sorting
- Transaction status management (Complete, Flag, Unflag)
- Risk assessment visualization
- Secure user authentication
- Responsive design

## Tech Stack

- Frontend:
  - React.js
  - React Bootstrap
  - Axios for API communication

- Backend:
  - Node.js
  - Express.js
  - MongoDB
  - JWT for authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/credit-fraud-detection-webapp.git
cd credit-fraud-detection-webapp
```

2. Install dependencies for both frontend and backend:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Create a .env file in the backend directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. Start the development servers:
```bash
# Start backend server (from backend directory)
npm run dev

# Start frontend server (from frontend directory)
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
├── backend/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   └── server.js      # Entry point
├── frontend/
│   ├── public/        # Static files
│   └── src/
│       ├── components/  # React components
│       ├── services/   # API services
│       └── assets/     # Images and styles
```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/transactions` - Get user transactions
- `POST /api/fraud-detection` - Analyze transaction risk
- `PUT /api/transactions/:id/status` - Update transaction status

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

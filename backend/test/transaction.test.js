const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../server'); // Adjust the path to your server file
const Transaction = require('../models/Transaction'); // Adjust the path as necessary

chai.use(chaiHttp);
const { expect } = chai;

before(async () => {
    // Clear the transactions collection
    await Transaction.deleteMany({});
    // Seed data
    const transactions = [
        { user: 'userId123', amount: 150.50, description: 'Grocery shopping', date: '2024-11-05' },
        { user: 'userId123', amount: 250.00, description: 'Electronics Purchase', date: '2024-11-04' },
        { user: 'userId123', amount: 50.25, description: 'Coffee Shop', date: '2024-11-03' },
        { user: 'userId456', amount: 75.00, description: 'Gas Station', date: '2024-11-02' },
        { user: 'userId456', amount: 100.75, description: 'Clothing Store', date: '2024-11-01' }
    ];
    await Transaction.insertMany(transactions);
});

describe('Transactions', () => {
    it('should retrieve all transactions', (done) => {
        chai.request(app)
            .get('/api/transactions')
            .set('x-auth-token', '<Your JWT Token>') // Make sure to replace this with a valid token
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                expect(res.body.length).to.be.greaterThan(0);
                done();
            });
    });
});
// tests/authRouterTest.js
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const app = require('../app.js');

chai.use(chaiHttp);

describe('Auth Router', function() {
  it('should create a new user on POST /register', function(done) {
    chai.request(app)
      .post('/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        companyName: 'ABC Inc.',
        title: 'Director of Operations',
        phone: '555-555-5555',
        email: 'test@example.com',
        // ... other fields
      })
      .end(function(err, res) {
        expect(res).to.have.status(200);
        // ... other assertions
        done();
      });
  });
});


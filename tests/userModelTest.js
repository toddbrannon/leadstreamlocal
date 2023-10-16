// tests/userModelTest.js
const chai = require('chai');
const expect = chai.expect;
const User = require('../models/user.js');

describe('User Model', function() {
  it('should hash the password before saving', async function() {
    const user = new User({ email: 'test@example.com', password: 'password123' });
    await user.save();
    expect(user.password).to.not.equal('password123');
  });

  it('should match the password correctly', async function() {
    const user = new User({ email: 'test@example.com', password: 'password123' });
    await user.save();
    const isMatch = await user.matchPassword('password123');
    expect(isMatch).to.be.true;
  });
});

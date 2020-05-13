'use strict';

require('dotenv').config();

// module.exports = {
//   PORT: process.env.PORT || 8080,
//   CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3001',
//   DATABASE_URL:
//       process.env.DATABASE_URL || 
//       // 'mongodb://testuser:testpassword@ds127015.mlab.com:27015/react-capstone',
//       "mongodb://blake:blake1@ds131903.mlab.com:31903/node-capstone",
//   TEST_DATABASE_URL:
//         process.env.TEST_DATABASE_URL ||
//         'mongodb://localhost/thinkful-backend-test',
//   JWT_SECRET: process.env.JWT_SECRET || 'random-secret-key',
//   JWT_EXPIRY: process.env.JWT_EXPIRY || '7d' 
// };

exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3001';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://blake:blake1@ds131903.mlab.com:31903/node-capstone'
// exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/hyperloop-test';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
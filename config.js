'use strict';

require('dotenv').config();

exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3001';
// exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://blake:blake1@ds131903.mlab.com:31903/node-capstone'
exports.DATABASE_URL = process.env.DATABASE_URL || "mongodb+srv://blake:password222@node-capstone.3r04t.mongodb.net/node-capstone?retryWrites=true&w=majority";
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
exports.NODE_OPTIONS="--max_old_space_size=4096"
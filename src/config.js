const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
  path: path.resolve(__dirname, `./env/${process.env.NODE_ENV}.env`),
});

module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  NODE_PORT: process.env.NODE_PORT || '3001',
  privateKey: 'PalavraSecreta2023',
  corsOptions: {
    origin: ['http://127.0.0.1:4200', 'http://localhost:4200'],
    exposedHeaders: ['X-Total-Count'],
  },
};

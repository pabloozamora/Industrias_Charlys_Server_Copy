const dotenv = require('dotenv');

dotenv.config(); // hace accesibles las variables de entorno

module.exports = {
  host: 'http://localhost:5173',
  dbName: process.env.DB_DEVELOP_NAME,
  allowInsecureConnections: true,
};

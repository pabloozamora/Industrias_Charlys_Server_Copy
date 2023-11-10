const dotenv = require('dotenv');

dotenv.config(); // hace accesibles las variables de entorno

module.exports = {
  dbName: process.env.DB_DEVELOP_NAME,
  allowInsecureConnections: true,
};

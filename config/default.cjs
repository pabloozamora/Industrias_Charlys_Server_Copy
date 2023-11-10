const dotenv = require('dotenv');

dotenv.config(); // hace accesibles las variables de entorno

module.exports = {
  port: 3000,
  host: '',
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbPort: process.env.DB_PORT,
  allowInsecureConnections: true,
  jwtKey: process.env.KEY,
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  awsBucketAccess: process.env.AWS_BUCKET_ACCESS,
  awsBucketSecret: process.env.AWS_BUCKET_SECRET,
  bucketName: process.env.BUCKET_NAME,
};

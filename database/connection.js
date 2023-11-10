import pgPkg from 'pg';
import config from 'config';

const { Pool } = pgPkg;

const dbUser = config.get('dbUser');
const dbHost = config.get('dbHost');
const dbName = config.get('dbName');
const dbPassword = config.get('dbPassword');
const dbPort = config.get('dbPort');

// Coloca aquí tus credenciales
const pool = new Pool({
  user: dbUser,
  host: dbHost,
  database: dbName,
  password: dbPassword,
  port: dbPort,
});

export default pool;

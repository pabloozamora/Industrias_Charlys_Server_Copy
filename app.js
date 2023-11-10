import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import routes from './routes/index.js';
import getDirname from './utils/dirname.js';

config(); // hace accesibles las variables de entorno

const app = express();

global.dirname = getDirname(import.meta.url);

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('./public'));
app.use(routes);

process.on('unhandledRejection', (error) => {
  // eslint-disable-next-line no-console
  console.log('=== UNHANDLED REJECTION ===', error);
});

export default app;

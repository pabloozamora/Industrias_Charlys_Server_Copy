import express from 'express';
import { getOrderRequestImageController, getProductImageController } from './image.controller.js';
import ensureAdminOrClientAuth from '../../middlewares/ensureAdminOrClientAuth.js';

const imageRouter = express.Router();

imageRouter.get('/orderRequest/:id', ensureAdminOrClientAuth, getOrderRequestImageController);
imageRouter.get('/order/:id', ensureAdminOrClientAuth, getOrderRequestImageController);
imageRouter.get('/product/:id', ensureAdminOrClientAuth, getProductImageController);
imageRouter.get('/productModel/:id', ensureAdminOrClientAuth, getProductImageController);

export default imageRouter;

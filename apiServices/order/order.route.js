import express from 'express';
import validateBody from '../../middlewares/validateBody.js';
import newOrderSchema from './validationSchemas/newOrderSchema.js';
import updatePhaseSchema from './validationSchemas/updatePhaseSchema.js';
import {
  getOrderByIdController,
  getOrdersController,
  newOrderController,
  updateOrderPhaseController,
  getOrdersInProductionController,
  deleteOrderController,
  isFinishedOrderController,
  getOrdersFinishedController,
} from './order.controller.js';
import ensureAdminAuth from '../../middlewares/ensureAdminAuth.js';
import ensureAdminOrClientAuth from '../../middlewares/ensureAdminOrClientAuth.js';
import deleteOrderSchema from './validationSchemas/deleteOrderSchema.js';
import updateStatusSchema from './validationSchemas/updateStatusSchema.js';

const orderRouter = express.Router();

orderRouter.post(
  '/',
  ensureAdminAuth,
  validateBody(newOrderSchema),
  newOrderController,
);

orderRouter.get(
  '/',
  ensureAdminAuth,
  getOrdersController,
);

orderRouter.get('/inProduction', ensureAdminAuth, getOrdersInProductionController);
orderRouter.get('/finished', ensureAdminAuth, getOrdersFinishedController);

orderRouter.get(
  '/:orderId?',
  ensureAdminOrClientAuth,
  getOrderByIdController,
);

orderRouter.put(
  '/phase',
  ensureAdminAuth,
  validateBody(updatePhaseSchema),
  updateOrderPhaseController,
);

orderRouter.put(
  '/status',
  ensureAdminAuth,
  validateBody(updateStatusSchema),
  isFinishedOrderController,
);
orderRouter.delete('/', ensureAdminAuth, validateBody(deleteOrderSchema), deleteOrderController);

export default orderRouter;

import express from 'express';
import validateBody from '../../middlewares/validateBody.js';
import newOrderDetailSchema from '../../utils/validationSchemas/newOrderDetailSchema.js';
import {
  getProgressLogController,
  newOrderDetailController,
  updateProductProgressController,
} from './orderDetail.controller.js';
import ensureAdminAuth from '../../middlewares/ensureAdminAuth.js';
import updateProductProgressSchema from './validationSchemas/updateProductProgressSchema.js';
import getLogSchema from './validationSchemas/getLogSchema.js';

const orderDetailRouter = express.Router();

orderDetailRouter.post('/', validateBody(newOrderDetailSchema), newOrderDetailController);
orderDetailRouter.put(
  '/',
  ensureAdminAuth,
  validateBody(updateProductProgressSchema),
  updateProductProgressController,
);
orderDetailRouter.get(
  '/log/:idOrder',
  ensureAdminAuth,
  validateBody(getLogSchema),
  getProgressLogController,
);

export default orderDetailRouter;

import express from 'express';
import validateBody from '../../middlewares/validateBody.js';
import { confirmTemporaryClientController } from './temporaryClient.controller.js';
import confirmTemporaryClientSchema from '../orderRequest/validationSchemas/confirmTemporaryClientSchema.js';

const temporaryClientRouter = express.Router();

temporaryClientRouter.post(
  '/:temporaryClientId/confirm',
  validateBody(confirmTemporaryClientSchema),
  confirmTemporaryClientController,
);

export default temporaryClientRouter;

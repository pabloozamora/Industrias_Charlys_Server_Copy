import express from 'express';
import validateBody from '../../middlewares/validateBody.js';
import newColorSchema from './validationSchema/newColorSchema.js';
import deleteColorSchema from './validationSchema/deleteColorSchema.js';
import ensureAdminAuth from '../../middlewares/ensureAdminAuth.js';
import {
  deleteColorController,
  getColorsByOrganizationController,
  getColorsController,
  newColorController,
} from './color.controller.js';
import ensureAdminOrClientAuth from '../../middlewares/ensureAdminOrClientAuth.js';

const colorRouter = express.Router();

colorRouter.post('/', ensureAdminAuth, validateBody(newColorSchema), newColorController);
colorRouter.get('/', ensureAdminAuth, getColorsController);
colorRouter.delete('/', ensureAdminAuth, validateBody(deleteColorSchema), deleteColorController);
colorRouter.get('/organization/:idOrganization', ensureAdminOrClientAuth, getColorsByOrganizationController);

export default colorRouter;

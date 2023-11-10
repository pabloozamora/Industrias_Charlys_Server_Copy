import express from 'express';
import ensureAdminAuth from '../../middlewares/ensureAdminAuth.js';
import ensureAdminOrClientAuth from '../../middlewares/ensureAdminOrClientAuth.js';
import {
  getClientsController,
  newOrganizationController,
  updateOrganizationController,
  deleteOrganizationController,
  getOrganizationsController,
  getOrderRequestsController,
  getOrganizationByIdController,
  getOrdersController,
} from './organization.controller.js';
import validateBody from '../../middlewares/validateBody.js';
import newOrganizationSchema from '../../utils/validationSchemas/newOrganizationSchema.js';
import updateOrganizationSchema from '../../utils/validationSchemas/updateOrganizationSchema.js';

const organizationRouter = express.Router();

organizationRouter.get('/clients/:idOrganization', ensureAdminAuth, getClientsController);

organizationRouter.get(
  '/orderRequests/:idClient?',
  ensureAdminOrClientAuth,
  getOrderRequestsController,
);

organizationRouter.get(
  '/orders/:idClient?',
  ensureAdminOrClientAuth,
  getOrdersController,
);

organizationRouter.get('/', ensureAdminAuth, getOrganizationsController);
organizationRouter.post('/newOrganization', ensureAdminAuth, validateBody(newOrganizationSchema), newOrganizationController);
organizationRouter.put('/updateOrganization', ensureAdminAuth, validateBody(updateOrganizationSchema), updateOrganizationController);
organizationRouter.delete('/:id', ensureAdminAuth, deleteOrganizationController);
organizationRouter.get('/:idClient', ensureAdminAuth, getOrganizationByIdController);
export default organizationRouter;

import express from 'express';
import validateBody from '../../middlewares/validateBody.js';
import newProductTypeSchema from '../../utils/validationSchemas/newProductTypeSchema.js';
import newProductRequirementSchema from '../../utils/validationSchemas/newProductRequirementSchema.js';
import newProductSchema from '../../utils/validationSchemas/newProductSchema.js';
import {
  getProductModelByIdController,
  getProductRequirementsController,
  getProductsController,
  getProuctTypesByOrganizationController,
  getProductsbyOrganizationController,
  getProuctTypesController,
  newProductController,
  newProductModelController,
  newProductRequirementController,
  newProuctTypeController,
  updateProductModelController,
  getProductByIdController,
} from './product.controller.js';
import ensureAdminAuth from '../../middlewares/ensureAdminAuth.js';
import ensureAdminOrClientAuth from '../../middlewares/ensureAdminOrClientAuth.js';
import multerMiddleware from '../../middlewares/multerMiddleware.js';
import uploadImage from '../../services/uploadFiles/uploadImage.js';
import newProductModelSchema from './validationSchemas/newProductModelSchema.js';
import updateProductModelSchema from './validationSchemas/updateProductModelSchema.js';

const productRouter = express.Router();

productRouter.post(
  '/model',
  ensureAdminOrClientAuth,
  multerMiddleware(uploadImage.any()),
  validateBody(newProductModelSchema),
  newProductModelController,
);
productRouter.post('/type', validateBody(newProductTypeSchema), newProuctTypeController);
productRouter.get('/type', ensureAdminOrClientAuth, getProuctTypesController);
productRouter.get('/type/by-organization/:idOrganization', ensureAdminOrClientAuth, getProuctTypesByOrganizationController);
productRouter.post('/requirement', validateBody(newProductRequirementSchema), newProductRequirementController);
productRouter.get('/requirement', ensureAdminAuth, getProductRequirementsController);
productRouter.post('/', validateBody(newProductSchema), newProductController);
productRouter.get('/', ensureAdminOrClientAuth, getProductsController);
productRouter.get('/:idProduct', ensureAdminOrClientAuth, getProductByIdController);
productRouter.get('/model/:idProductModel', ensureAdminOrClientAuth, getProductModelByIdController);
productRouter.post('/model/by-organization/:idClient', ensureAdminOrClientAuth, getProductsbyOrganizationController);
productRouter.put(
  '/model',
  ensureAdminAuth,
  multerMiddleware(uploadImage.any()),
  validateBody(updateProductModelSchema),
  updateProductModelController,
);

export default productRouter;

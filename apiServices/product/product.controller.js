import fs from 'fs';
import uploadFileToBucket from '../../services/cloudStorage/uploadFileToBucket.js';
import consts from '../../utils/consts.js';
import CustomError from '../../utils/customError.js';
import randomString from '../../utils/randomString.js';
import {
  addProductModelColor,
  addProductModelMedia,
  getProductModelById,
  getProductTypes,
  getProductTypesByOrganization,
  getProducts,
  getProductModelsbyOrganization,
  getRequirements,
  newProduct,
  newProductModel,
  newProductType,
  newRequeriment,
  updateProductModel,
  verifyProductModelOwner,
  verifyProductOwner,
  getProductById,
  removeProductModelMedia,
} from './product.model.js';
import { begin, commit, rollback } from '../../database/transactions.js';
import deleteFileInBucket from '../../services/cloudStorage/deleteFileInBucket.js';
import { isMemberController } from '../organization/organization.controller.js';

const newProuctTypeController = async (req, res) => {
  const { name } = req.body;

  try {
    const { id } = await newProductType({ name });
    res.send({ id });
  } catch (ex) {
    let err = 'Ocurrio un error al registrar el tipo de producto.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const getProuctTypesController = async (req, res) => {
  try {
    const result = await getProductTypes();

    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al obtener los tipos de producto disponibles.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const getProuctTypesByOrganizationController = async (req, res) => {
  const { idOrganization } = req.params;
  try {
    const result = await getProductTypesByOrganization({ idOrganization });

    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al obtener los tipos de producto disponibles por organización.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const newProductController = async (req, res) => {
  const { type, client, color } = req.body;

  try {
    const { id } = await newProduct({ type, client, color });
    res.send({ id });
  } catch (ex) {
    let err = 'Ocurrio un error al registrar el nuevo producto.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const getProductsController = async (req, res) => {
  const { search } = req.query;

  try {
    const result = await getProducts(search);

    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al obtener los productos disponibles.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const getProductsbyOrganizationController = async (req, res) => {
  const { idClient } = req.params;
  const { search } = req.query;
  const userId = req.session.role === consts.role.client ? req.session.userId : undefined;
  const { colors, types } = req.body;
  try {
    if (userId) await isMemberController({ userId, idClient });
    const result = await getProductModelsbyOrganization({
      idClient,
      colors,
      types,
      search,
    });
    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al obtener los modelos de producto de esta organización.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const newProductRequirementController = async (req, res) => {
  const {
    product, size, material, fabric, quantityPerUnit,
  } = req.body;

  try {
    const { id } = await newRequeriment({
      product,
      size,
      material,
      fabric,
      quantityPerUnit,
    });
    res.send({ id });
  } catch (ex) {
    let err = `Ocurrio un error al registrar el nuevo requerimiento para el producto ${product}.`;
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const getProductRequirementsController = async (req, res) => {
  const { product, search } = req.query;

  try {
    const result = await getRequirements(product, search);

    res.send(result);
  } catch (ex) {
    let err = `Ocurrio un error al obtener los requerimientos del producto ${product}.`;
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const saveProductModelMedia = async ({ files, idProductModel }) => {
  let uploadError = false;
  const filesUploadedToBucket = [];

  for (const file of files) {
    const filePath = `${global.dirname}/files/${file.fileName}`;

    // subir archivos
    if (!uploadError) {
      const fileId = `${idProductModel}-${randomString(15)}-${Date.now()}.${file.type}`;
      const fileKey = `${consts.bucketRoutes.product}/${fileId}`;

      try {
        // eslint-disable-next-line no-await-in-loop
        await uploadFileToBucket(fileKey, filePath, file.type);

        // save file url in db
        // eslint-disable-next-line no-await-in-loop
        await addProductModelMedia({ idProductModel, name: fileId });
        filesUploadedToBucket.push(fileKey);
      } catch (ex) {
        uploadError = true;
      }
    }

    // eliminar archivos temporales

    fs.unlink(filePath, () => {});
  }

  if (uploadError) {
    await rollback();

    // eliminar archivos cargados al bucket
    filesUploadedToBucket.forEach((key) => deleteFileInBucket(key).catch(() => {
      // eslint-disable-next-line no-console
      console.log('Ocurrió un error al eliminar archivos de modelo de producto en el bucket.');
    }));

    throw new CustomError('No se pudieron guardar imagenes en el servidor.', 500);
  }
};

const newProductModelController = async (req, res) => {
  const { role } = req.session;
  const userId = role === consts.role.client ? req.session.userId : undefined;
  const {
    type, idClientOrganization, name, details, color,
  } = req.body;
  try {
    if (userId) await isMemberController({ userId, idClient: idClientOrganization });
    await begin();

    // crear modelo del producto
    const idProductModel = await newProductModel({
      type,
      idClientOrganization,
      name,
      details,
    });

    // guardar colores
    if (Array.isArray(color) && role === 'ADMIN') {
      for (const idColor of color) {
        // eslint-disable-next-line no-await-in-loop
        await addProductModelColor({ idProductModel, idColor });
      }
    }

    // subir multimedia
    if (req.uploadedFiles) {
      await saveProductModelMedia({ files: req.uploadedFiles, idProductModel });
    }

    await commit();

    res.send({ id: idProductModel });
  } catch (ex) {
    let err = 'Ocurrió un error al crear modelo de producto.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const updateProductModelController = async (req, res) => {
  const {
    idProductModel, type, idClientOrganization, name, details, imagesToRemove,
  } = req.body;

  try {
    begin(); // begin transaction

    await updateProductModel({
      idProductModel,
      type,
      idClientOrganization,
      name,
      details,
    });

    // save files
    if (Array.isArray(req.uploadedFiles)) {
      await saveProductModelMedia({ files: req.uploadedFiles, idProductModel });
    }

    // remover media
    if (imagesToRemove) {
      const mediaKeys = [];

      // remover en la bd
      for (const imageUrl of imagesToRemove) {
        const urlParts = imageUrl.split('/');
        const mediaKey = urlParts[urlParts.length - 1];
        // eslint-disable-next-line no-await-in-loop
        await removeProductModelMedia({ idProductModel, name: mediaKey });
        mediaKeys.push(mediaKey);
      }

      // Delete al files in bucket
      await Promise.all(
        mediaKeys.map(async (mediaKey) => deleteFileInBucket(`${consts.bucketRoutes.product}/${mediaKey}`)),
      );
    }
    await commit();

    res.send({ idProductModel });
  } catch (ex) {
    await rollback();
    let err = 'Ocurrio un error al actualizar el modelo de producto.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const getProductModelByIdController = async (req, res) => {
  const { idProductModel } = req.params;
  try {
    if (req.session.role === consts.role.client) {
      await verifyProductModelOwner({
        idClientOrganization: req.session.clientOrganizationId,
        idProductModel,
      });
    }
    const result = await getProductModelById({ idProductModel });
    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al obtener la información del product model.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const getProductByIdController = async (req, res) => {
  const { idProduct } = req.params;
  try {
    if (req.session.role === consts.role.client) {
      await verifyProductOwner({
        idClientOrganization: req.session.clientOrganizationId,
        idProduct,
      });
    }
    const result = await getProductById({ idProduct });
    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al obtener la información del producto.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

export {
  newProuctTypeController,
  getProuctTypesController,
  newProductController,
  getProductsController,
  getProductsbyOrganizationController,
  newProductRequirementController,
  getProductRequirementsController,
  newProductModelController,
  getProuctTypesByOrganizationController,
  getProductModelByIdController,
  updateProductModelController,
  getProductByIdController,
};

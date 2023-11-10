import fs from 'fs';
import { begin, commit, rollback } from '../../database/transactions.js';
import uploadFileToBucket from '../../services/cloudStorage/uploadFileToBucket.js';
import consts from '../../utils/consts.js';
import CustomError from '../../utils/customError.js';
import randomString from '../../utils/randomString.js';
import {
  addOrderRequestMedia,
  addProductRequirement,
  clearOrderRequestRequirements,
  deleteOrderRequest,
  getOrderRequestById,
  getOrderRequestTemporaryClientId,
  getOrderRequests,
  newOrderRequest,
  newOrderRequestRequirement,
  removeOrderRequestMedia,
  replaceTemporaryClientWithOrganization,
  updateOrderRequest,
} from './orderRequest.model.js';
import {
  createTemporaryClient,
  deleteTemporaryClient,
  getTemporaryClient,
} from '../temporaryClient/temporaryClient.model.js';
import { isMemberController } from '../organization/organization.controller.js';
import { getOrganizationById } from '../organization/organization.model.js';
import deleteFileInBucket from '../../services/cloudStorage/deleteFileInBucket.js';

const saveOrderRequestMedia = async ({ files, id }) => {
  let uploadError = false;
  const promises = [];

  for (const file of files) {
    const filePath = `${global.dirname}/files/${file.fileName}`;

    // subir archivos
    if (!uploadError) {
      const fileId = `${id}-${randomString(15)}-${Date.now()}.${file.type}`;
      const fileKey = `${consts.bucketRoutes.orderRequest}/${fileId}`;

      try {
        // eslint-disable-next-line no-await-in-loop
        await uploadFileToBucket(fileKey, filePath, file.type);

        // save file url in db
        promises.push(addOrderRequestMedia(id, fileId));
      } catch (ex) {
        uploadError = true;
      }
    }

    // eliminar archivos temporales

    fs.unlink(filePath, () => { });
  }

  await Promise.all(promises);

  if (uploadError) {
    await rollback();
    throw new CustomError('No se pudieron guardar imagenes en el servidor.', 500);
  }
};

const deleteOrderRequestMedia = async ({ files }) => {
  let deleteError = false;
  const promises = [];

  for (const file of files) {
    // subir archivos
    if (!deleteError) {
      const fileKey = file.name;

      try {
        // eslint-disable-next-line no-await-in-loop
        await deleteFileInBucket(fileKey);
      } catch (ex) {
        deleteError = true;
      }
    }
  }

  await Promise.all(promises);

  if (deleteError) {
    await rollback();
    throw new CustomError('No se pudieron eliminar las imágenes del servidor.', 500);
  }
};

const addOrderRequestRequirement = async ({ products, idOrderRequest }) => {
  let updateError = false;

  for (const product of products) {
    if (!updateError) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await addProductRequirement({
          idOrderRequest,
          idProductModel: product.idProductModel,
          size: product.size,
          quantity: product.quantity,
          unitCost: product.price,
        });
      } catch (ex) {
        updateError = true;
      }
    }
  }

  if (updateError) {
    await rollback();
    throw new CustomError('No se ha podido actualizar el detalle de la orden.', 500);
  }
};

const newOrderRequestController = async (req, res) => {
  const {
    name, email, phone, address, description,
  } = req.body;

  try {
    begin(); // begin transaction

    const { id: idTemporaryClient } = await createTemporaryClient({
      name,
      email,
      phone,
      address,
    });

    const { id } = await newOrderRequest({
      description,
      idTemporaryClient,
    });

    // save files
    if (Array.isArray(req.uploadedFiles)) {
      await saveOrderRequestMedia({ files: req.uploadedFiles, id });
    }

    await commit();

    res.send({ id });
  } catch (ex) {
    await rollback();
    let err = 'Ocurrio un error al registrar intención de compra.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};
const deleteOrderRequestController = async (req, res) => {
  const { idOrderRequest } = req.body;

  try {
    begin(); // begin transaction

    const result = await deleteOrderRequest({ idOrderRequest });

    // delete files
    if (result && result.length > 0) {
      await deleteOrderRequestMedia({ files: result });
    }

    await commit();

    res.send(true);
  } catch (ex) {
    await rollback();
    let err = 'Ocurrio un error al eliminar la intención de compra.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const updateOrderRequestController = async (req, res) => {
  const {
    description, deadline, details, idOrderRequest, products, imagesToRemove,
  } = req.body;

  try {
    begin(); // begin transaction

    await updateOrderRequest({
      idOrderRequest,
      description,
      deadline,
      details,
    });

    if (products) {
      // Eliminar productos anteriores
      clearOrderRequestRequirements({ idOrderRequest });
      // Añadir actualizados
      await addOrderRequestRequirement({ products, idOrderRequest });
    }

    // remover media
    if (imagesToRemove) {
      const mediaKeys = [];

      // remover en la bd
      for (const imageUrl of imagesToRemove) {
        const urlParts = imageUrl.split('/');
        const mediaKey = urlParts[urlParts.length - 1];
        // eslint-disable-next-line no-await-in-loop
        await removeOrderRequestMedia({ idOrderRequest, name: mediaKey });
        mediaKeys.push(mediaKey);
      }

      // Delete al files in bucket
      await Promise.all(
        mediaKeys.map(async (mediaKey) => deleteFileInBucket(`${consts.bucketRoutes.product}/${mediaKey}`)),
      );
    }

    // save files
    if (Array.isArray(req.uploadedFiles)) {
      await saveOrderRequestMedia({ files: req.uploadedFiles, id: idOrderRequest });
    }
    await commit();

    res.send({ idOrderRequest });
  } catch (ex) {
    await rollback();
    let err = 'Ocurrio un error al actualizar la solicitud de pedido.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const newLoggedOrderRequestController = async (req, res) => {
  const userId = req.session.role === consts.role.client ? req.session.userId : undefined;
  const idClientOrganization = req.session.role === consts.role.client
    ? req.session.clientOrganizationId
    : req.body.idClientOrganization;
  const {
    description, products, deadline, details,
  } = req.body;

  try {
    if (userId) await isMemberController({ userId, idClient: idClientOrganization });
    begin(); // begin transaction

    const { id } = await newOrderRequest({
      description,
      idClientOrganization,
      deadline,
      details,
    });

    // guardar requerimientos de productos de la orden
    for (const product of products) {
      const {
        idProductModel, size, quantity, price,
      } = product;
      // eslint-disable-next-line no-await-in-loop
      await newOrderRequestRequirement({
        idOrderRequest: id,
        idProductModel,
        size,
        quantity,
        price: req.session.role === consts.role.admin ? price : undefined,
      });
    }

    // save files
    if (Array.isArray(req.uploadedFiles)) {
      await saveOrderRequestMedia({ files: req.uploadedFiles, id });
    }

    await commit();

    res.send({ id });
  } catch (ex) {
    await rollback();
    let err = 'Ocurrio un error al registrar intención de compra de un cliente ya registrado.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const getOrderRequestsController = async (req, res) => {
  const { search } = req.query;

  try {
    const result = await getOrderRequests(search);

    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al obtener solicitudes de pedido.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const getOrderRequestByIdController = async (req, res) => {
  const { orderRequestId } = req.params;
  const userId = req.session.role === consts.role.client ? req.session.userId : undefined;

  try {
    const result = await getOrderRequestById(orderRequestId);

    if (userId) {
      // Verificar (si es cliente) que sea dueño de la solicitud
      const idClient = result.clientOrganization;
      await isMemberController({ userId, idClient });
    }

    if (result.temporaryClient) {
      // añadir datos de cliente temporal
      result.temporaryClient = await getTemporaryClient(result.temporaryClient);
    } else if (result.clientOrganization) {
      result.clientOrganization = await getOrganizationById({
        idClient: result.clientOrganization,
      });
    }
    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al obtener la información de esta solicitud.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const confirmTemporaryClientController = async (req, res) => {
  const { orderRequestId } = req.params;
  const { organizationId } = req.body;

  try {
    await begin();

    const temporaryClientId = await getOrderRequestTemporaryClientId(orderRequestId);

    await replaceTemporaryClientWithOrganization({ orderRequestId, organizationId });

    await deleteTemporaryClient(temporaryClientId);

    await commit();
    res.send('El cliente temporal fue confirmado como organización.');
  } catch (ex) {
    await rollback();
    let err = 'Ocurrio un error al confirmar cliente temporal como organización.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status ?? 500;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

// eslint-disable-next-line import/prefer-default-export
export {
  newOrderRequestController,
  getOrderRequestsController,
  getOrderRequestByIdController,
  newLoggedOrderRequestController,
  updateOrderRequestController,
  confirmTemporaryClientController,
  deleteOrderRequestController,
};

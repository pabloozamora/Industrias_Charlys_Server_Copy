import CustomError from '../../utils/customError.js';
import consts from '../../utils/consts.js';
import {
  newOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizations,
  getClients,
  getOrderRequests,
  getOrganizationById,
  getOrders,
  isMember,
} from './organization.model.js';

const getOrganizationByIdController = async (req, res) => {
  const { idClient } = req.params;
  try {
    const result = await getOrganizationById({ idClient });
    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al obtener la información del cliente.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const isMemberController = async ({ userId, idClient }) => {
  const result = await isMember({ userId, idClient });
  if (!result) throw new CustomError('Acceso denegado.', 403);
  return null;
};

const getOrderRequestsController = async (req, res) => {
  const userId = req.session.role === consts.role.client ? req.session.userId : undefined;
  const idClient = req.session.role === consts.role.client
    ? req.session.clientOrganizationId : req.params.idClient;
  const {
    page, search, startDeadline, endDeadline, startDatePlaced, endDatePlaced, idProduct,
  } = req.query;
  try {
    if (!userId && !idClient) throw new CustomError('Debe especificar el id de la organización', 400);
    if (userId) await isMemberController({ userId, idClient });
    const result = await getOrderRequests({
      idClient, page, idProduct, startDatePlaced, endDatePlaced, startDeadline, endDeadline, search,
    });

    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al obtener las solicitudes de orden de este cliente.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const getOrdersController = async (req, res) => {
  const userId = req.session.role === consts.role.client ? req.session.userId : undefined;
  const idClient = req.session.role === consts.role.client
    ? req.session.clientOrganizationId : req.params.idClient;
  const {
    page, search, startDeadline, endDeadline, idProduct,
  } = req.query;
  try {
    if (!userId && !idClient) throw new CustomError('Debe especificar el id de la organización', 400);
    if (userId) await isMemberController({ userId, idClient });
    const result = await getOrders({
      idClient, page, idProduct, startDeadline, endDeadline, search,
    });

    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al obtener los pedidos de este cliente.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const getClientsController = async (req, res) => {
  const { idOrganization } = req.params;
  const { page, search } = req.query;
  try {
    const result = await getClients({ idOrganization, page, search });

    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al obtener los clientes para esta organización.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const newOrganizationController = async (req, res) => {
  const {
    name, email, phone, address,
  } = req.body;
  try {
    const organizationId = await newOrganization({
      name, email, phone, address,
    });
    res.send({ id: organizationId });
  } catch (ex) {
    let err = 'La información ingresada no es válida al registrar la organización.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const updateOrganizationController = async (req, res) => {
  const {
    id, name, email, phone, address,
  } = req.body;
  try {
    await updateOrganization({
      id, name, email, phone, address,
    });
    res.send({ id });
  } catch (ex) {
    let err = 'La información ingresada no es válida al actualizar la organización.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const deleteOrganizationController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteOrganization({ id });
    res.send({ id });
  } catch (ex) {
    let err = 'No se encontró el id de la organización';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const getOrganizationsController = async (req, res) => {
  const { page, search } = req.query;
  try {
    const result = await getOrganizations({ page, search });
    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al obtener las organizaciones.';
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
  // eslint-disable-next-line import/prefer-default-export
  getClientsController,
  getOrderRequestsController,
  newOrganizationController,
  updateOrganizationController,
  deleteOrganizationController,
  getOrganizationsController,
  getOrganizationByIdController,
  getOrdersController,
  isMemberController,
};

import {
  getOrderById,
  getOrders,
  newOrder,
  updateOrderPhase,
  getOrdersInProduction,
  deleteOrder,
  isFinishedOrder,
} from './order.model.js';
import CustomError from '../../utils/customError.js';
import OrderAcceptedEmail from '../../services/email/OrderAcceptedEmail.js';
import consts from '../../utils/consts.js';
import { isMemberController } from '../organization/organization.controller.js';

const newOrderController = async (req, res) => {
  const { idOrderRequest } = req.body;

  try {
    const {
      id, users, detail, total,
    } = await newOrder({ idOrderRequest });

    const emailPromises = users.map(async (user) => {
      const emailSender = new OrderAcceptedEmail({
        addresseeEmail: user.email, name: user.name, idOrderRequest, idOrder: id, detail, total,
      });
      await emailSender.sendEmail();
    });

    await Promise.all(emailPromises);

    res.send({ id });
  } catch (ex) {
    let err = 'Ocurrio un error al generar el pedido.';
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
  const {
    page, search, startDeadline, endDeadline, idProduct,
  } = req.query;
  try {
    const result = await getOrders({
      idProduct, startDeadline, endDeadline, page, search,
    });
    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al obtener las ordenes aprobadas.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const deleteOrderController = async (req, res) => {
  const {
    idOrder: orderId,
  } = req.body;
  try {
    const result = await deleteOrder({ orderId });
    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al eliminar el registro.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const getOrderByIdController = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.session.role === consts.role.client ? req.session.userId : undefined;
  try {
    const result = await getOrderById(orderId);
    if (userId) {
      const idClient = result.idClientOrganization;
      await isMemberController({ userId, idClient });
    }

    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al obtener la información de este pedido.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};
const getOrdersInProductionController = async (req, res) => {
  try {
    const result = await getOrdersInProduction();

    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al obtener la información de los pedidos en producción.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const updateOrderPhaseController = async (req, res) => {
  const { phase, idOrder } = req.body;
  try {
    if (parseInt(phase, 10) > consts.orderPhases.length) throw new CustomError(`La fase de una orden debe encontrarse entre 0 y ${consts.orderPhases.length - 1}.`, 400);

    await updateOrderPhase({ phase, idOrder });
    res.send({ id: idOrder });
  } catch (ex) {
    let err = 'Ocurrio un error al actualizar la fase del pedido.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};
const isFinishedOrderController = async (req, res) => {
  const { idOrder: orderId, isFinished: finished } = req.body;
  try {
    const result = await isFinishedOrder({ orderId, finished });
    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al actualizar estado de la orden.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const getOrdersFinishedController = async (req, res) => {
  const {
    page, search, startDeadline, endDeadline, client,
  } = req.query;

  try {
    const result = await getOrders({
      idClientOrganization: client, startDeadline, endDeadline, page, search, onlyFinished: true,
    });

    res.send(result);
  } catch (ex) {
    let err = 'Ocurrió un error al obtener órdenes finalizadas.';
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
  newOrderController,
  getOrdersController,
  getOrderByIdController,
  updateOrderPhaseController,
  getOrdersInProductionController,
  deleteOrderController,
  isFinishedOrderController,
  getOrdersFinishedController,
};

import { begin, commit, rollback } from '../../database/transactions.js';
import CustomError from '../../utils/customError.js';
import {
  getProgressLog,
  newOrderDetail,
  updateProductProgress,
} from './orderDetail.model.js';

const newOrderDetailController = async (req, res) => {
  const {
    noOrder, product, size, quantity,
  } = req.body;

  try {
    const { id } = await newOrderDetail({
      noOrder, product, size, quantity,
    });
    res.send({ id });
  } catch (ex) {
    let err = `Ocurrio un error al agregar el elemento a la orden ${noOrder}.`;
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const updateProductProgressController = async (req, res) => {
  const {
    idOrder, idProduct, completed,
  } = req.body;
  try {
    await begin();

    for (const productVariant of completed) {
      // eslint-disable-next-line no-await-in-loop
      await updateProductProgress({
        completed: productVariant.quantity, idOrder, idProduct, size: productVariant.size,
      });
    }

    await commit();
    res.send({ id: idOrder });
  } catch (ex) {
    await rollback();
    let err = 'Ocurrio un error al actualizar la cantidad de unidades completadas.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const getProgressLogController = async (req, res) => {
  const { idOrder } = req.params;
  const { idProduct } = req.body;

  try {
    const result = await getProgressLog({
      idOrder, idProduct,
    });
    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error obtener los registros de la bitácora.';
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
  newOrderDetailController, updateProductProgressController,
  getProgressLogController,
};

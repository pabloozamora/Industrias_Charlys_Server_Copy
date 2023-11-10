import getFileFromBucket from '../../services/cloudStorage/getFileFromBucket.js';
import consts from '../../utils/consts.js';
import CustomError from '../../utils/customError.js';
import { verifyProductImageOwnership } from './image.model.js';

const getOrderRequestImageController = async (req, res) => {
  const { id } = req.params;

  try {
    const fileResult = await getFileFromBucket(`${consts.bucketRoutes.orderRequest}/${id}`);
    res.write(fileResult, 'binary');
    res.end(null, 'binary');
  } catch (ex) {
    res.sendStatus(404);
  }
};

const getProductImageController = async (req, res) => {
  const { id } = req.params;

  try {
    // verificar permiso de acceso al recurso
    if (req.session.role === consts.role.client) {
      await verifyProductImageOwnership({ imageName: id, idUser: req.session.userId });
    }

    const fileResult = await getFileFromBucket(`${consts.bucketRoutes.product}/${id}`);
    res.write(fileResult, 'binary');
    res.end(null, 'binary');
  } catch (ex) {
    let status = 404;
    if (ex instanceof CustomError) {
      res.statusMessage = ex.message;
      status = ex.status;
    }
    res.sendStatus(status);
  }
};

export { getOrderRequestImageController, getProductImageController };

import CustomError from '../../utils/customError.js';
import {
  deleteSize,
  getFabrics,
  getMaterials, getSizes, newFabric, newMaterial, newSize,
} from './generalInfo.model.js';

const newSizeController = async (req, res) => {
  const { size } = req.body;

  try {
    const { id } = await newSize({ size });
    res.send({ id });
  } catch (ex) {
    let err = 'Ocurrio un error al crear la talla.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const deleteSizeController = async (req, res) => {
  const { size: sizeId } = req.body;

  try {
    const result = await deleteSize({ sizeId });
    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al eliminar la talla.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const getSizesController = async (req, res) => {
  const { search } = req.query;
  try {
    const result = await getSizes({ search });

    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al obtener las tallas disponibles.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const newMaterialController = async (req, res) => {
  const { description } = req.body;

  try {
    const { id } = await newMaterial({ description });
    res.send({ id });
  } catch (ex) {
    let err = 'Ocurrio un error al registrar el nuevo material.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const getMaterialsController = async (req, res) => {
  const { search } = req.query;
  try {
    const result = await getMaterials(search);

    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al obtener los materiales disponibles.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const newFabricController = async (req, res) => {
  const { fabric, color } = req.body;

  try {
    const { id } = await newFabric({ fabric, color });
    res.send({ id });
  } catch (ex) {
    let err = 'Ocurrio un error al registrar la nueva tela.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const getFabricsController = async (req, res) => {
  const { search } = req.query;
  try {
    const result = await getFabrics(search);

    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al obtener las telas disponibles.';
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
  newSizeController,
  getSizesController,
  newMaterialController,
  getMaterialsController,
  newFabricController,
  getFabricsController,
  deleteSizeController,
};

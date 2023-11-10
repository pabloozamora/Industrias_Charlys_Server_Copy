import { begin, commit, rollback } from '../../database/transactions.js';
import CustomError from '../../utils/customError.js';
import {
  addProductToInventory,
  getInventory,
  getInventorybyId,
  getMaterialsTypeList,
  newInventoryElement,
  newMaterial,
  newMaterialType,
  updateInventoryElement,
  updateMaterial,
} from './inventory.model.js';

const newMaterialController = async (req, res) => {
  const {
    name, supplier, color, type, quantity, measurementUnit, details,
  } = req.body;

  try {
    await begin();

    const materialId = await newMaterial({
      name,
      supplier,
      color,
      typeId: type,
    });

    const inventoryId = await newInventoryElement({
      materialId,
      productId: null,
      quantity,
      measurementUnit,
      details,
    });

    await commit();

    res.send({ id: inventoryId });
  } catch (ex) {
    await rollback();
    let err = 'La información ingresada no es válida al insertar nuevo material.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const updateMaterialController = async (req, res) => {
  const {
    inventoryId, name, supplier, color, type, quantity, measurementUnit, details,
  } = req.body;

  try {
    await begin();

    await updateMaterial({
      inventoryId, name, supplier, color, typeId: type,
    });

    await updateInventoryElement({
      inventoryId, quantity, measurementUnit, details,
    });

    await commit();

    res.send({ id: inventoryId });
  } catch (ex) {
    await rollback();
    let err = 'La información ingresada no es válida al actualizar el material.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const getInventoryController = async (req, res) => {
  const { search, id, type } = req.query;

  try {
    const result = await getInventory({ id, type, search });
    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al obtener registros del inventario.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const getInventorybyIdController = async (req, res) => {
  const { search } = req.query;

  try {
    const result = await getInventorybyId(search);
    res.send(result);
  } catch (ex) {
    let err = 'Ocurrio un error al obtener la información del inventario.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const newMaterialTypeController = async (req, res) => {
  try {
    const { name } = req.body;

    const materialTypeId = await newMaterialType(name);

    res.send({ id: materialTypeId });
  } catch (ex) {
    let err = 'No fue posible crear un nuevo tipo de material.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const getMaterialsTypeController = async (req, res) => {
  try {
    const result = await getMaterialsTypeList();

    res.send({ result });
  } catch (ex) {
    let err = 'Ocurrió un error al obtener los tipos de material.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};
const addProductToInventoryController = async (req, res) => {
  const { idProduct, quantity, size } = req.body;
  try {
    await addProductToInventory({ idProduct, quantity, size });

    res.send({ ok: true });
  } catch (ex) {
    let err = 'Ocurrió un error al insertar producto al inventario.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const updateInventoryProductController = async (req, res) => {
  const {
    idInventory, quantity,
  } = req.body;
  try {
    await updateInventoryElement({
      inventoryId: idInventory, quantity,
    });

    res.send({ ok: true });
  } catch (ex) {
    await rollback();
    let err = 'No se pudo actualizar el producto en inventario.';
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
  newMaterialController,
  getInventoryController,
  getInventorybyIdController,
  newMaterialTypeController,
  getMaterialsTypeController,
  updateMaterialController,
  addProductToInventoryController,
  updateInventoryProductController,
};

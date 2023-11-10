import query from '../../database/query.js';
import CustomError from '../../utils/customError.js';

const newSize = async ({ size }) => {
  const sql = 'INSERT INTO "size"("size") VALUES($1) RETURNING "size", "sequence" as id, "sequence";';

  try {
    const { result, rowCount } = await query(sql, size);

    if (rowCount !== 1) throw new CustomError('No se pudo registrar la talla', 500);

    return result[0];
  } catch (ex) {
    if (ex?.code === '23505') throw new CustomError('Esta talla ya existe.', 400);
    const error = 'Datos no válidos.';
    throw new CustomError(error, 400);
  }
};

const deleteSize = async ({ sizeId }) => {
  const sql = 'DELETE FROM "size" WHERE "size" = $1;';
  try {
    const { rowCount } = await query(sql, sizeId);

    if (rowCount !== 1) throw new CustomError('No se ha encontrado la talla especificada.', 404);
    return true;
  } catch (ex) {
    if (ex?.code === '23503') throw new CustomError('Esta talla ya se encuentra en uso.', 400);
    throw ex;
  }
};

const getSizes = async ({ search = '' }) => {
  const queryResult = await query('select * from size where "size" ilike $1 order by "sequence" asc', `%${search}%`);

  const { result, rowCount } = queryResult;

  if (rowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  return result.map((val) => ({
    id: val.id_size,
    size: val.size,
  }));
};

const newMaterial = async ({ description }) => {
  const sql = 'INSERT INTO material(description) VALUES($1) RETURNING id_material as id;';

  try {
    const { result, rowCount } = await query(sql, description);

    if (rowCount !== 1) throw new CustomError('No se pudo registrar el material', 500);

    return result[0];
  } catch (ex) {
    const error = 'Datos no válidos.';
    throw new CustomError(error, 400);
  }
};

const getMaterials = async (searchQuery) => {
  let queryResult;
  if (searchQuery) {
    const sql = `select i.id_inventory, mat.id_material, mat.description, i.quantity,
                              i.measurement_unit, i.supplier, i.details
                              from inventory i
                              inner join material mat on i.material = mat.id_material
                              where i.id_inventory ilike $1 or mat.description ilike $1
                                or i.measurement_unit ilike $1 or i.supplier ilike $1 or i.details ilike $1`;
    queryResult = await query(sql, `%${searchQuery}%`);
  } else {
    const sql = `select i.id_inventory, mat.id_material, mat.description, i.quantity,
                              i.measurement_unit, i.supplier, i.details
                              from inventory i inner join material mat on i.material = mat.id_material`;
    queryResult = await query(sql);
  }

  const { result, rowCount } = queryResult;

  if (rowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  return result.map((val) => ({
    id: val.id_inventory,
    description: val.description,
    quantity: val.quantity,
    measurementUnit: val.measurement_unit,
    supplier: val.supplier,
    details: val.details,
  }));
};

const newFabric = async ({ fabric, color }) => {
  const sql = 'INSERT INTO fabric(fabric, color) VALUES($1,$2) RETURNING id_fabric as id;';

  try {
    const { result, rowCount } = await query(sql, fabric, color);

    if (rowCount !== 1) throw new CustomError('No se pudo registrar la tela', 500);

    return result[0];
  } catch (ex) {
    const error = 'Datos no válidos.';
    throw new CustomError(error, 400);
  }
};

const getFabrics = async (searchQuery) => {
  let queryResult;
  if (searchQuery) {
    const sql = `select i.id_inventory, f.id_fabric, f.fabric, f.color, i.quantity,
                              i.measurement_unit, i.supplier, i.details
                              from inventory i inner join fabric f on i.fabric = f.id_fabric
                              where i.id_inventory ilike $1 or f.fabric ilike $1 or f.color ilike $1
                                or i.measurement_unit ilike $1 or i.supplier ilike $1 or i.details ilike $1`;
    queryResult = await query(sql, `%${searchQuery}%`);
  } else {
    const sql = `select i.id_inventory, f.id_fabric, f.fabric, f.color, i.quantity,
                              i.measurement_unit, i.supplier, i.details
                              from inventory i inner join fabric f on i.fabric = f.id_fabric`;
    queryResult = await query(sql);
  }

  const { result, rowCount } = queryResult;

  if (rowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  return result.map((val) => ({
    id: val.id_inventory,
    fabric: val.fabric,
    color: val.color,
    quantity: val.quantity,
    measurementUnit: val.measurement_unit,
    supplier: val.supplier,
    details: val.details,
  }));
};

export {
  getSizes,
  newSize,
  getMaterials,
  newMaterial,
  getFabrics,
  newFabric,
  deleteSize,
};

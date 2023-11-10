import query from '../../database/query.js';
import CustomError from '../../utils/customError.js';

const newColor = async ({
  name, red, green, blue,
}) => {
  const sql = 'insert into color values(default,$1,$2,$3,$4) RETURNING id_color as id;';

  try {
    const { result, rowCount } = await query(sql, name, red, green, blue);

    if (rowCount !== 1) throw new CustomError('No se pudo registrar el color', 500);

    return result[0];
  } catch (err) {
    if (err instanceof CustomError) throw err;

    if (err?.constraint === 'color_values_check') {
      throw new CustomError('El valor para cada color debe ser un número entre 0 y 255.', 400);
    }
    if (err?.code === '23505') throw new CustomError('El nombre del color ya existe.', 400);
    throw err;
  }
};

const getColors = async ({ search }) => {
  let queryResult;
  if (search) {
    const sql = `select * from color
                where name ilike $1`;
    queryResult = await query(sql, `%${search}%`);
  } else {
    const sql = 'select * from color';
    queryResult = await query(sql);
  }

  const { result, rowCount } = queryResult;

  if (rowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  return result.map((val) => ({
    id: val.id_color,
    name: val.name,
    red: val.red,
    green: val.green,
    blue: val.blue,
  }));
};

const getColorsByOrganization = async ({ idOrganization, search = '' }) => {
  const sqlQuery = `SELECT DISTINCT C.id_color as id, C.name, C.red, C.green, C.blue FROM color C
  INNER JOIN product_model_color CM ON CM.id_color = C.id_color
  INNER JOIN product_model M ON M.id_product_model = CM.id_product_model
  INNER JOIN client_organization O ON M.id_client_organization = O.id_client_organization
  WHERE O.id_client_organization = $1 and (C.name ilike $2)`;

  const queryResult = await query(sqlQuery, idOrganization, `%${search}%`);

  const { result, rowCount } = queryResult;

  if (rowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  return result;
};

const deleteColor = async ({ colorId }) => {
  const sql = 'delete from color where id_color =$1';
  try {
    const { rowCount } = await query(sql, colorId);
    if (rowCount === 0) throw new CustomError('No se ha encontrado el color.', 404);
    return true;
  } catch (ex) {
    if (ex?.code === '23503') throw new CustomError('Este color ya se encuentra en uso.', 400);
    throw ex;
  }
};

export {
  getColors,
  newColor,
  getColorsByOrganization,
  deleteColor,
};

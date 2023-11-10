import query from '../../database/query.js';
import CustomError from '../../utils/customError.js';

const newOrderDetail = async ({
  noOrder, product, size, quantity,
}) => {
  const sql = 'INSERT INTO order_detail values($1,$2,$3,$4) RETURNING no_order as id;';

  try {
    const { result, rowCount } = await query(
      sql,
      noOrder,
      product,
      size,
      quantity,
    );

    if (rowCount !== 1) throw new CustomError(`No se pudo agregar el elemento a la orden ${noOrder}`, 500);

    return result[0];
  } catch (err) {
    if (err instanceof CustomError) throw err;
    const { code } = err;
    let error = 'Datos no válidos.';
    if (code === '23505') {
      error = 'Este producto ya se ha agregado a la orden especificada.';
    }

    throw new CustomError(error, 400);
  }
};

const getProgressLog = async ({
  idOrder, idProduct,
}) => {
  const sql = `select date, description, size from order_progress where id_order = $1
  and id_product = $2 order by date desc;`;
  const { result, rowCount } = await query(sql, idOrder, idProduct);
  if (rowCount === 0) throw new CustomError('No se han encontrado registros.', 404);

  return {
    id_order: idOrder,
    id_product: idProduct,
    logs: result,
  };
};

const updateProductProgress = async ({
  completed, idOrder, idProduct, size,
}) => {
  const sql = `update order_detail set quantity_completed = $1 where id_order = $2
    and id_product = $3 and size = $4`;
  try {
    const { rowCount } = await query(sql, completed, idOrder, idProduct, size);
    if (rowCount === 0) throw new CustomError('No se encontró el registro.', 400);
  } catch (ex) {
    if (ex?.code === '22P02') { throw new CustomError('El valor ingresado no es válido.', 400); }
    if (ex?.code === 'P0001') { throw new CustomError(ex.message, 400); }
    throw ex;
  }
};

export {
  newOrderDetail,
  updateProductProgress,
  getProgressLog,
};

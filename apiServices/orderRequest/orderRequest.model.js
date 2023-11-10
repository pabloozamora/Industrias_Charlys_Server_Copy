import query from '../../database/query.js';
import consts from '../../utils/consts.js';
import CustomError from '../../utils/customError.js';
import { getProductModelColors, getProductModelMedia } from '../product/product.model.js';

const newOrderRequest = async ({
  description,
  idClientOrganization = null,
  idTemporaryClient = null,
  deadline = null,
  details = null,
}) => {
  const sql = `INSERT INTO order_request(description, date_placed, id_client_organization, id_temporary_client, deadline, aditional_details)
                VALUES ($1, now(), $2, $3, $4, $5) RETURNING id_order_request as id;`;

  try {
    const { result, rowCount } = await query(
      sql,
      description,
      idClientOrganization,
      idTemporaryClient,
      deadline,
      details,
    );

    if (rowCount !== 1) throw new CustomError('No se pudo registrar la solicitud de orden', 500);

    return result[0];
  } catch (ex) {
    if (ex?.code === '23503') {
      if (ex.detail?.includes('id_client_organization')) {
        throw new CustomError('La organización cliente no existe.', 400);
      }
      if (ex.detail?.includes('id_temporary_client')) {
        throw new CustomError('El cliente temporal no existe.', 400);
      }
    }
    throw ex;
  }
};
const deleteOrderRequest = async ({ idOrderRequest }) => {
  const mediaSQL = 'select * from order_request_media where id_order_request = $1';
  const sql = 'delete from order_request where id_order_request = $1';

  const { result, rowCount: mediaCount } = await query(mediaSQL, idOrderRequest);
  const { rowCount } = await query(sql, idOrderRequest);
  if (rowCount !== 1) throw new CustomError('No se encontró solicitud de orden', 404);

  if (mediaCount !== 0) {
    return result.map((file) => ({
      name: file.name,
    }));
  }

  return true;
};

const newOrderRequestRequirement = async ({
  idOrderRequest,
  idProductModel,
  size,
  quantity,
  price,
}) => {
  const sql = `INSERT INTO order_request_requirement(id_order_request, id_product_model, "size", quantity, unit_cost)
                VALUES ($1, $2, $3, $4, $5)`;

  try {
    const { result, rowCount } = await query(
      sql,
      idOrderRequest,
      idProductModel,
      size,
      quantity,
      price,
    );

    if (rowCount !== 1) {
      throw new CustomError(
        'No se pudo registrar el requerimiento para la solicitud de orden.',
        500,
      );
    }

    return result[0];
  } catch (ex) {
    if (ex?.code === '23514') { throw new CustomError('El modelo del producto no pertenece a esta organización.', 400); }
    if (ex?.code === '23505') {
      throw new CustomError(
        'No se permiten requerimientos duplicados con el mismo modelo de producto y talla.',
        400,
      );
    }
    if (ex?.code === '23503') {
      if (ex.detail?.includes('id_order_request')) {
        throw new CustomError('La solicitud de orden no existe.', 400);
      }
      if (ex.detail?.includes('id_product_model')) {
        throw new CustomError('El modelo de producto no existe.', 400);
      }
      if (ex.detail?.includes('size')) {
        throw new CustomError('La talla proporcionada no existe.', 400);
      }
    }
    throw ex;
  }
};

const updateOrderRequest = async ({
  idOrderRequest, description, deadline, details,
}) => {
  const sqlGet = 'select * from order_request where id_order_request = $1;';
  const { result: resultGet, rowCount: rowCountGet } = await query(sqlGet, idOrderRequest);

  if (rowCountGet === 0) {
    throw new CustomError('No se han encontrado registros con el id proporcionado.', 404);
  }

  const sqlUpdate = `update order_request set description = $1, deadline = $2,
    aditional_details = $3 where id_order_request = $4`;
  await query(
    sqlUpdate,
    description || resultGet[0].description,
    deadline || resultGet[0].deadline,
    details || resultGet[0].aditional_details,
    idOrderRequest,
  );
};

const getOrderRequests = async (searchQuery) => {
  let queryResult;
  if (searchQuery) {
    const sql = `
      SELECT * FROM (
      SELECT O.*, CO.name AS client FROM order_request O
      INNER JOIN client_organization CO ON O.id_client_organization = CO.id_client_organization
      UNION
      SELECT O.*, TC.name AS client FROM order_request O
      INNER JOIN temporary_client TC ON O.id_temporary_client = TC.id_temporary_client
      ) AS sub_query
      WHERE client ILIKE $1 OR description ILIKE $1 ORDER BY date_placed DESC
    `;
    queryResult = await query(sql, `%${searchQuery}%`);
  } else {
    queryResult = await query(`
      SELECT O.*, CO.name AS client FROM order_request O
      INNER JOIN client_organization CO ON O.id_client_organization = CO.id_client_organization
      UNION
      SELECT O.*, TC.name AS client FROM order_request O
      INNER JOIN temporary_client TC ON O.id_temporary_client = TC.id_temporary_client
    `);
  }

  const { result, rowCount } = queryResult;

  if (rowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  return result.map((val) => ({
    id: val.id_order_request,
    client: val.client,
    description: val.description,
    datePlaced: val.date_placed,
    clientOrganization: val.id_client_organization ?? undefined,
    temporaryClient: val.id_temporary_client ?? undefined,
  }));
};

const addOrderRequestMedia = async (orderRequestId, name) => {
  const sql = 'INSERT INTO order_request_media(id_order_request, name) VALUES ($1, $2) ;';

  const { rowCount } = await query(sql, orderRequestId, name);

  if (rowCount !== 1) {
    throw new CustomError('No se pudo guardar el recurso para la solicitud de orden.', 500);
  }
};

const getOrderRequestMedia = async (orderRequestId) => {
  const sql = 'SELECT name FROM order_request_media WHERE id_order_request = $1';
  const { result, rowCount } = await query(sql, orderRequestId);

  return rowCount > 0 ? result.map((val) => `${consts.imagePath.orderRequest}/${val.name}`) : null;
};

const getOrderRequestById = async (orderRequestId) => {
  let total = 0;
  const sql = `select "or".id_order_request, "or".description, "or".date_placed, "or".id_client_organization,
  "or".id_temporary_client, "or".deadline, "or".aditional_details, orq.size, orq.quantity, orq.unit_cost,
  pm.id_product_model, pm.name, pm.details, pt.name "type"
  from order_request "or"
  left join order_request_requirement orq on "or".id_order_request = orq.id_order_request
  left join product_model pm on orq.id_product_model = pm.id_product_model
  left join product_type pt on pt.id_product_type = pm.type
  left join "size" on "size".size = orq.size
  where "or".id_order_request = $1
  order by "size".sequence;`;
  const { result: queryResult, rowCount } = await query(sql, orderRequestId);

  if (rowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  const transformedData = await queryResult.reduce(async (accPromise, current) => {
    const acc = await accPromise;

    if (current.id_product_model === null) return acc;

    const currentProduct = acc.find(
      (item) => current.id_product_model === item.id
        && current.name === item.product
        && current.type === item.type,
    );

    total += current.quantity * current.unit_cost;
    if (currentProduct) {
      currentProduct.sizes.push({
        size: current.size,
        quantity: current.quantity,
        unit_price: current.unit_cost,
      });
    } else {
      const newProduct = {
        id: current.id_product_model,
        product: current.name,
        type: current.type,
        media: await getProductModelMedia(current.id_product_model),
        colors: await getProductModelColors(current.id_product_model),
        sizes: [
          {
            size: current.size,
            quantity: current.quantity,
            unit_price: current.unit_cost,
          },
        ],
      };

      acc.push(newProduct);
    }

    return acc;
  }, []);

  const media = await getOrderRequestMedia(orderRequestId);

  const result = {
    id: queryResult[0].id_order_request,
    clientOrganization: queryResult[0].id_client_organization,
    temporaryClient: queryResult[0].id_temporary_client,
    description: queryResult[0].description,
    datePlaced: queryResult[0].date_placed,
    deadline: queryResult[0].deadline,
    details: queryResult[0].aditional_details,
    media,
    detail: transformedData.length > 0 ? transformedData : null,
    total,
  };

  return result;
};

const getOrderRequestTemporaryClientId = async (orderRequestId) => {
  const sqlQuery = 'SELECT id_temporary_client FROM order_request WHERE id_order_request = $1;';

  const { result, rowCount } = await query(sqlQuery, orderRequestId);

  if (rowCount === 0) throw new CustomError('No se encontró la solicidut de orden.', 404);
  if (!result || !result[0]?.id_temporary_client) { throw new CustomError('La solicitud de orden no cuenta con un cliente temporal', 400); }

  return result[0].id_temporary_client;
};

const replaceTemporaryClientWithOrganization = async ({ orderRequestId, organizationId }) => {
  try {
    const sqlQuery = `UPDATE order_request SET id_client_organization = $1, id_temporary_client = NULL 
    WHERE id_order_request = $2`;

    const { rowCount } = await query(sqlQuery, organizationId, orderRequestId);

    if (rowCount === 0) throw new CustomError('No se encontró la solicidut de orden.', 404);
  } catch (ex) {
    if (ex?.code === '22001' || ex?.code === '23503') { throw new CustomError('La organización con el id proporcionado no existe.', 400); }
    throw ex;
  }
};

const addProductRequirement = async ({
  idOrderRequest,
  idProductModel,
  size,
  quantity,
  unitCost,
}) => {
  const sql = 'insert into order_request_requirement values($1,$2,$3,$4,$5) RETURNING id_order_request as id;';

  try {
    const { result, rowCount } = await query(
      sql,
      idOrderRequest,
      idProductModel,
      size,
      quantity,
      unitCost,
    );
    if (rowCount !== 1) throw new CustomError('No se ha podido añadir el producto al detalle de la intención de pedido.');

    return result[0];
  } catch (ex) {
    if (ex?.code === '23505') {
      const sqlUpdate = `update order_request_requirement set quantity = $1, unit_cost = $2
      where id_order_request = $3
        and id_product_model = $4
        and "size" = $5 RETURNING id_order_request as id;`;

      const { result: updateResult, rowCount: updateCount } = await query(
        sqlUpdate,
        quantity,
        unitCost,
        idOrderRequest,
        idProductModel,
        size,
      );
      if (updateCount !== 1) throw new CustomError('No se ha podido actualizar el registro en el detalle de intención de pedido.');

      return updateResult[0];
    }
    throw ex;
  }
};

const clearOrderRequestRequirements = async ({ idOrderRequest }) => {
  const sqlQuery = 'DELETE FROM order_request_requirement WHERE id_order_request = $1 ';
  await query(sqlQuery, idOrderRequest);
};

const removeOrderRequestMedia = async ({ idOrderRequest, name }) => {
  const sql = 'DELETE FROM order_request_media WHERE id_order_request = $1 AND name = $2';

  const { rowCount } = await query(sql, idOrderRequest, name);

  if (rowCount === 0) throw new CustomError('No se encontró el recurso multimedia para el modelo de producto.', 404);
};

export {
  newOrderRequest,
  getOrderRequests,
  addOrderRequestMedia,
  getOrderRequestById,
  updateOrderRequest,
  newOrderRequestRequirement,
  getOrderRequestTemporaryClientId,
  replaceTemporaryClientWithOrganization,
  deleteOrderRequest,
  addProductRequirement,
  clearOrderRequestRequirements,
  removeOrderRequestMedia,
};

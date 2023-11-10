/* eslint-disable no-nested-ternary */
import query from '../../database/query.js';
import CustomError from '../../utils/customError.js';
import consts from '../../utils/consts.js';
import { getProductColors, getProductMedia } from '../product/product.model.js';

const getOrderMedia = async (orderId) => {
  const sql = 'SELECT name FROM order_media WHERE id_order = $1';
  const { result, rowCount } = await query(sql, orderId);

  return rowCount > 0 ? result.map((val) => `${consts.imagePath.order}/${val.name}`) : null;
};

const isFinishedOrder = async ({ orderId, finished = true }) => {
  const sql = 'update "order" set is_finished = $1 where id_order = $2';

  const { rowCount } = await query(sql, finished, orderId);
  if (rowCount === 0) throw CustomError('No se ha encontrado la orden especificada.', 404);
  return true;
};

const getOrderById = async (orderId) => {
  const sql = `select o.id_order, o.description, o.id_client_organization,
  o.deadline, o.production_phase, od.size, od.quantity, od.quantity_completed, od.unit_cost,
  p.id_product, p.name, p.details, pt.name "type", co.name client
  from "order" o
  left join order_detail od on o.id_order = od.id_order
  left join product p on od.id_product = p.id_product
  left join product_type pt on pt.id_product_type = p.type
  left join client_organization co on co.id_client_organization = o.id_client_organization
  left join "size" on "size".size = od.size
  where o.id_order = $1
  order by "size".sequence;`;
  const { result: queryResult, rowCount } = await query(sql, orderId);

  if (rowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  const transformedData = await queryResult.reduce(async (accPromise, current) => {
    const acc = await accPromise;

    if (current.id_product === null) return acc;

    const currentProduct = acc.find(
      (item) => current.id_product === item.id
        && current.name === item.product
        && current.type === item.type,
    );

    if (currentProduct) {
      currentProduct.sizes.push({
        size: current.size,
        quantity: current.quantity,
        completed: current.quantity_completed || 0,
        unit_price: current.unit_cost,
      });
    } else {
      const newProduct = {
        id: current.id_product,
        product: current.name,
        type: current.type,
        media: await getProductMedia(current.id_product),
        colors: await getProductColors(current.id_product),
        sizes: [
          {
            size: current.size,
            quantity: current.quantity,
            completed: current.quantity_completed || 0,
            unit_price: current.unit_cost,
          },
        ],
      };

      acc.push(newProduct);
    }

    return acc;
  }, []);

  const media = await getOrderMedia(orderId);

  const result = {
    id: queryResult[0].id_order,
    idClientOrganization: queryResult[0].id_client_organization,
    clientOrganization: queryResult[0].client,
    description: queryResult[0].description,
    phase: {
      id: queryResult[0].production_phase,
      name: consts.orderPhases[queryResult[0].production_phase] ?? null,
    },
    deadline: queryResult[0].deadline,
    media,
    detail: transformedData.length > 0 ? transformedData : null,
  };

  return result;
};

const newOrder = async ({ idOrderRequest }) => {
  const sql = 'insert into "order"(id_order, id_order_request) values(default, $1) RETURNING id_order as id';
  const sql2 = `select ua.email, ua.name from order_request "or"
    natural join client_organization co
    inner join user_account ua on ua.id_client_organization = "or".id_client_organization
    where id_order_request = $1 and ua.enabled = true;`;
  const sql3 = `select pr.name, od.size, od.quantity, od.unit_cost from order_detail od
    natural join "order" o 
    inner join product pr on od.id_product = pr.id_product
    where o.id_order_request = $1;`;
  const sql4 = `select SUM(od.quantity * od.unit_cost) total from order_detail od
    natural join "order" o
    where o.id_order_request = $1;`;

  try {
    const { result: users } = await query(sql2, idOrderRequest);
    const { result, rowCount } = await query(sql, idOrderRequest);
    const { result: detail } = await query(sql3, idOrderRequest);
    const { result: total } = await query(sql4, idOrderRequest);

    if (rowCount !== 1) throw new CustomError('No se pudo generar la orden.', 500);

    result[0].users = users;
    result[0].detail = detail;
    result[0].total = total[0].total;

    return result[0];
  } catch (ex) {
    if (ex?.code === '23503') {
      throw new CustomError('La solicitud de pedido no existe.', 400);
    }
    if (ex?.code === '42P02') {
      throw new CustomError(ex.message, 400);
    }
    throw ex;
  }
};

const getOrders = async ({
  idProduct,
  startDeadline,
  endDeadline,
  page,
  search = '',
  onlyFinished = false,
  idClientOrganization,
}) => {
  const offset = page * consts.pageLength;
  const conditions = {
    count: [],
    query: [],
  };
  const params = [consts.pageLength, `%${search}%`];

  if (idProduct !== undefined) {
    conditions.count.push(`"p".id_product = $${params.length + 1}`);
    conditions.query.push(`"p".id_product = $${params.length}`);
    params.push(idProduct);
  }
  if (startDeadline !== undefined) {
    conditions.count.push(`o.deadline >= $${params.length + 1}`);
    conditions.query.push(`o.deadline >= $${params.length}`);
    params.push(startDeadline);
  }
  if (endDeadline !== undefined) {
    conditions.count.push(`o.deadline <= $${params.length + 1}`);
    conditions.query.push(`o.deadline <= $${params.length}`);
    params.push(endDeadline);
  }

  if (endDeadline !== undefined) {
    conditions.count.push(`o.deadline <= $${params.length + 1}`);
    conditions.query.push(`o.deadline <= $${params.length}`);
    params.push(endDeadline);
  }
  if (idClientOrganization !== undefined) {
    conditions.count.push(`o.id_client_organization = $${params.length + 1}`);
    conditions.query.push(`o.id_client_organization = $${params.length}`);
    params.push(idClientOrganization);
  }

  const sqlCount = `select ceiling(count(*) / $1:: numeric) from(
    select distinct o.id_order, o.deadline, o.description, o.production_phase, co.name client from "order" o
    inner join client_organization co on co.id_client_organization = o.id_client_organization
    left join order_detail od on o.id_order = od.id_order
    left join product "p" on od.id_product = "p".id_product
    where (o.description ilike $2 or "p".name ilike $2 or co.name ilike $2)
    ${onlyFinished ? 'AND is_finished = true ' : ''}
    ${conditions.count.length > 0 ? `AND ${conditions.count.join(' and ')}` : ''}
    ) subquery`;

  const pages = (await query(sqlCount, ...params)).result[0].ceiling;
  if (pages === 0) throw new CustomError('No se encontraron resultados.', 404);

  if (page !== undefined) params.push(consts.pageLength, offset);

  const sql = `select distinct o.id_order, o.deadline, o.description, o.production_phase, co.name client from "order" o
  inner join client_organization co on co.id_client_organization = o.id_client_organization
  left join order_detail od on o.id_order = od.id_order
  left join product "p" on od.id_product = "p".id_product
  where (o.description ilike $1 or "p".name ilike $1 or co.name ilike $1)
  ${onlyFinished ? 'AND is_finished = true ' : ''}
  ${conditions.query.length > 0 ? `AND ${conditions.query.join(' and ')}` : ''}
  ORDER BY o.id_order
  ${page !== undefined ? `LIMIT $${params.length - 2} OFFSET $${params.length - 1}` : ''}`;

  const { result, rowCount } = await query(sql, ...params.slice(1));

  if (rowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  const response = result.map((val) => ({
    id: val.id_order,
    description: val.description,
    client: val.client,
    deadline: val.deadline,
    phase: {
      id: val.production_phase,
      name: consts.orderPhases[val.production_phase] ?? null,
    },
  }));
  return { result: response, count: pages };
};

const updateOrderPhase = async ({ phase, idOrder }) => {
  const sql = `update "order" set production_phase = $1
    where id_order = $2;`;

  const { rowCount } = await query(sql, phase, idOrder);
  if (rowCount === 0) { throw new CustomError('No ha sido posible actualizar la fase del pedido.', 400); }
};

const deleteOrder = async ({ orderId }) => {
  const sql = 'delete from "order" where id_order = $1';
  const { rowCount } = await query(sql, orderId);
  if (rowCount === 0) throw new CustomError('No se ha encontrado la orden indicada.', 404);
  return true;
};

const getOrdersInProduction = async () => {
  const sqlQuery = `
  SELECT O.id_order, O.deadline, O.description, CO.name AS client, PU.pending_units
  FROM "order" O
  INNER JOIN client_organization CO ON O.id_client_organization = CO.id_client_organization
  LEFT JOIN (
    SELECT O.id_order, SUM(COALESCE(OD.quantity, 0) - COALESCE(OD.quantity_completed,0)) AS pending_units
    FROM "order" O
    INNER JOIN order_detail OD ON OD.id_order = O.id_order
    GROUP BY O.id_order
    HAVING SUM(COALESCE(OD.quantity, 0) - COALESCE(OD.quantity_completed,0)) > 0
  ) PU ON O.id_order = PU.id_order
  WHERE O.is_finished = false
  ORDER BY O.deadline, COALESCE(PU.pending_units,0) DESC,  O.id_order
  `;

  const { result, rowCount } = await query(sqlQuery);

  if (rowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  return result.map((res) => ({
    orderId: res.id_order,
    deadline: res.deadline,
    description: res.description,
    client: res.client,
    pendingUnits: res.pending_units,
  }));
};

export {
  newOrder,
  getOrders,
  getOrderById,
  updateOrderPhase,
  getOrdersInProduction,
  deleteOrder,
  isFinishedOrder,
};

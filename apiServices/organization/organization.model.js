import query from '../../database/query.js';
import consts from '../../utils/consts.js';
import CustomError from '../../utils/customError.js';

const getOrganizationById = async ({ idClient }) => {
  const sqlOrg = 'SELECT * FROM client_organization where id_client_organization = $1;';

  const { result, rowCount } = await query(sqlOrg, idClient);

  if (rowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  return result.map((val) => ({
    id: val.id_client_organization,
    name: val.name,
    email: val.email,
    phone: val.phone,
    address: val.address,
  }))[0];
};

const getOrderRequests = async ({
  idClient, page, idProduct, startDatePlaced, endDatePlaced, startDeadline, endDeadline, search = '',
}) => {
  const offset = page * consts.pageLength;
  const conditions = {
    count: [],
    query: [],
  };
  const params = [consts.pageLength, idClient, `%${search}%`];

  if (idProduct !== undefined) {
    conditions.count.push(`pm.id_product_model = $${params.length + 1}`);
    conditions.query.push(`pm.id_product_model = $${params.length}`);
    params.push(idProduct);
  }
  if (startDeadline !== undefined) {
    conditions.count.push(`"or".deadline >= $${params.length + 1}`);
    conditions.query.push(`"or".deadline >= $${params.length}`);
    params.push(startDeadline);
  }
  if (endDeadline !== undefined) {
    conditions.count.push(`"or".deadline <= $${params.length + 1}`);
    conditions.query.push(`"or".deadline <= $${params.length}`);
    params.push(endDeadline);
  }
  if (startDatePlaced !== undefined) {
    conditions.count.push(`"or".date_placed >= $${params.length + 1}`);
    conditions.query.push(`"or".date_placed >= $${params.length}`);
    params.push(startDatePlaced);
  }
  if (endDatePlaced !== undefined) {
    conditions.count.push(`"or".date_placed <= $${params.length + 1}`);
    conditions.query.push(`"or".date_placed <= $${params.length}`);
    params.push(endDatePlaced);
  }

  const sqlCount = `select ceiling(count(*) / $1::numeric) from(
    select distinct "or".id_order_request, "or".description, "or".date_placed, "or".deadline from order_request "or"
      left join order_request_requirement orq on "or".id_order_request = orq.id_order_request
      left join product_model pm on orq.id_product_model = pm.id_product_model
      where ("or".id_client_organization = $2 or "or".id_temporary_client = $2)
        and ("or".description ilike $3 or "or".aditional_details ilike $3 or pm.name ilike $3)
        ${conditions.count.length > 0 ? `AND ${conditions.count.join(' and ')}` : ''}
  ) as subquery;`;

  const pages = (await query(sqlCount, ...params)).result[0].ceiling;

  if (pages === 0) throw new CustomError('No se encontraron resultados.', 404);

  if (page !== undefined) params.push(consts.pageLength, offset);

  const sql = `select distinct "or".id_order_request, "or".description, "or".date_placed, "or".deadline from order_request "or"
  left join order_request_requirement orq on "or".id_order_request = orq.id_order_request
  left join product_model pm on orq.id_product_model = pm.id_product_model
  where ("or".id_client_organization = $1 or "or".id_temporary_client = $1)
    and ("or".description ilike $2 or "or".aditional_details ilike $2 or pm.name ilike $2)
    ${conditions.query.length > 0 ? `AND ${conditions.query.join(' and ')}` : ''}
    ${page !== undefined ? `LIMIT $${params.length - 2} OFFSET $${params.length - 1}` : ''}`;

  const { result, rowCount } = await query(sql, ...params.slice(1));

  if (rowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  const response = result.map((val) => ({
    id: val.id_order_request,
    description: val.description,
    date_placed: val.date_placed,
    deadline: val.deadline,
  }));
  return { result: response, count: pages };
};

const isMember = async ({ userId, idClient }) => {
  const sql = `select $1 in (
      select id_user from user_account where id_client_organization = $2
    ) exists`;

  const { result } = await query(sql, userId, idClient);
  return result[0].exists;
};

const getOrders = async ({
  idClient, page, idProduct, startDeadline, endDeadline, search = '',
}) => {
  const offset = page * consts.pageLength;
  const conditions = {
    count: [],
    query: [],
  };
  const params = [consts.pageLength, idClient, `%${search}%`];

  if (idProduct !== undefined) {
    conditions.count.push(`p.id_product = $${params.length + 1}`);
    conditions.query.push(`p.id_product = $${params.length}`);
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

  const sqlCount = `select ceiling(count(*) / $1::numeric) from(
    select distinct o.id_order, o.description, o.deadline from "order" o
      left join order_detail od on o.id_order = od.id_order
      left join product p on od.id_product = p.id_product
      where o.id_client_organization = $2
        and (o.description ilike $3 or p.name ilike $3)      
        ${conditions.count.length > 0 ? `AND ${conditions.count.join(' and ')}` : ''}
  ) as subquery;`;

  const pages = (await query(sqlCount, ...params)).result[0].ceiling;

  if (pages === 0) throw new CustomError('No se encontraron resultados.', 404);

  if (page !== undefined) params.push(consts.pageLength, offset);

  const sql = `select distinct o.id_order, o.description, o.deadline from "order" o
  left join order_detail od on o.id_order = od.id_order
  left join product p on od.id_product = p.id_product
  where o.id_client_organization = $1
  and (o.description ilike $2 or p.name ilike $2)
    ${conditions.query.length > 0 ? `AND ${conditions.query.join(' and ')}` : ''}
    ${page !== undefined ? `LIMIT $${params.length - 2} OFFSET $${params.length - 1}` : ''}`;

  const { result, rowCount } = await query(sql, ...params.slice(1));

  if (rowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  const response = result.map((val) => ({
    id: val.id_order,
    description: val.description,
    deadline: val.deadline,
  }));
  return { result: response, count: pages };
};

const getClients = async ({ idOrganization, page, search = '' }) => {
  const offset = page * consts.pageLength;
  const sqlCount = `select ceiling(count(*) / $1::numeric) from user_account
    where id_client_organization = $2 and enabled = true
    and("name" ilike $3 or lastname ilike $3 or email ilike $3
    or phone ilike $3); `;

  const pages = (await query(sqlCount, consts.pageLength, idOrganization, `%${search}%`)).result[0].ceiling;
  const sql = `select * from user_account where id_client_organization = $1 AND enabled = true
    and("name" ilike $2 or lastname ilike $2 or email ilike $2
    or phone ilike $2) ${page !== undefined ? 'LIMIT $3 OFFSET $4;' : ''}`;

  const { result, rowCount } = page === undefined
    ? await query(sql, idOrganization, `%${search}%`)
    : await query(sql, idOrganization, `%${search}%`, consts.pageLength, offset);

  if (rowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  const response = result.map((val) => ({
    id: val.id_user,
    name: val.name,
    lastname: val.lastname,
    email: val.email,
    phone: val.phone,
    sex: val.sex,
  }));
  return { result: response, count: pages };
};

const newOrganization = async ({
  name, email, phone, address,
}) => {
  try {
    const sql = `INSERT INTO client_organization(name, email, phone, address, enabled) VALUES($1, $2, $3, $4, true)
                RETURNING id_client_organization AS id`;

    const { result, rowCount } = await query(sql, name, email, phone, address);
    if (rowCount !== 1) throw new CustomError('Ocurrió un error al insertar la organización.', 500);

    return result[0].id;
  } catch (ex) {
    if (ex instanceof CustomError) throw ex;
    throw ex;
  }
};

const updateOrganization = async ({
  id, name, email, phone, address,
}) => {
  try {
    const sql = `UPDATE client_organization SET name = $2, email = $3, phone = $4, address = $5
                        WHERE id_client_organization = $1`;
    const { rowCount } = await query(sql, id, name, email, phone, address);
    if (rowCount !== 1) throw new CustomError('No se encontró la organización.', 400);
  } catch (ex) {
    if (ex instanceof CustomError) throw ex;
    throw ex;
  }
};

const deleteOrganization = async ({ id }) => {
  try {
    const sql = 'DELETE FROM client_organization WHERE id_client_organization = $1';
    const { rowCount } = await query(sql, id);
    if (rowCount !== 1) throw new CustomError('No se encontró la organización.', 400);
  } catch (ex) {
    // Si falla por una FK
    if (ex?.code === '23503') {
      const sqlDisable = 'UPDATE client_organization SET enabled = false WHERE id_client_organization = $1';
      await query(sqlDisable, id);
    } else throw ex;
  }
};

const getOrganizations = async ({ page, search = '' }) => {
  const offset = page * consts.pageLength;
  const sqlCount = `SELECT ceiling(count(*)/$1::numeric) FROM client_organization
    WHERE enabled = true and (
    name ilike $2 or email ilike $2 or phone ilike $2 or
    address ilike $2)`;
  const pages = (await query(sqlCount, consts.pageLength, `%${search}%`)).result[0].ceiling;

  const sql = `SELECT * FROM client_organization WHERE enabled = true and (
    name ilike $1 or email ilike $1 or phone ilike $1 or address ilike $1) ORDER BY id_client_organization
    ${page !== undefined ? 'LIMIT $2 OFFSET $3' : ''} `;

  const { result, rowCount } = page === undefined
    ? await query(sql, `%${search}%`)
    : await query(sql, `%${search}%`, consts.pageLength, offset);

  if (rowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  const response = result.map((val) => ({
    id: val.id_client_organization,
    name: val.name,
    email: val.email,
    phone: val.phone,
    address: val.address,
    enabled: val.enabled,
  }));
  return { result: response, count: pages };
};

export {
  // eslint-disable-next-line import/prefer-default-export
  getClients,
  getOrderRequests,
  newOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizations,
  getOrganizationById,
  getOrders,
  isMember,
};

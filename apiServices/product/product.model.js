import query from '../../database/query.js';
import consts from '../../utils/consts.js';
import CustomError from '../../utils/customError.js';

const getProductColors = async (productId) => {
  const sql = `select c."name", c.red r, c.green g, c.blue b from product_color pc
    natural join color c
    where pc.id_product = $1;`;
  const { result, rowCount } = await query(sql, productId);
  return rowCount > 0 ? result : null;
};

const getProductModelColors = async (productModelId) => {
  const sql = `select c."name", c.red r, c.green g, c.blue b from product_model_color pmc
    natural join color c
    where pmc.id_product_model = $1;`;
  const { result, rowCount } = await query(sql, productModelId);
  return rowCount > 0 ? result : null;
};

const getProductMedia = async (productId) => {
  const sql = 'SELECT name FROM product_media WHERE id_product = $1';
  const { result, rowCount } = await query(sql, productId);

  return rowCount > 0
    ? result.map((val) => `${consts.imagePath.product}/${val.name}`)
    : null;
};

const getProductModelMedia = async (productModelId) => {
  const sql = 'SELECT name FROM product_model_media WHERE id_product_model = $1';
  const { result, rowCount } = await query(sql, productModelId);

  return rowCount > 0
    ? result.map((val) => `${consts.imagePath.productModel}/${val.name}`)
    : null;
};

const newProductType = async ({ name }) => {
  const sql = 'INSERT INTO product_type("name") VALUES($1) RETURNING id_product_type as id;';

  try {
    const { result, rowCount } = await query(sql, name);

    if (rowCount !== 1) throw new CustomError('No se pudo registrar el tipo de producto', 500);

    return result[0];
  } catch (ex) {
    const error = 'Datos no válidos.';
    throw new CustomError(error, 400);
  }
};

const getProductTypes = async () => {
  const queryResult = await query('select * from product_type');

  const { result, rowCount } = queryResult;

  if (rowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  return result.map((val) => ({
    id: val.id_product_type,
    name: val.name,
  }));
};

const getProductTypesByOrganization = async ({ idOrganization }) => {
  const sql = `SELECT DISTINCT T.name AS name, T.id_product_type AS id FROM product_type T
  INNER JOIN product_model M ON T.id_product_type = M.type
  INNER JOIN client_organization O ON M.id_client_organization = O.id_client_organization
  WHERE O.id_client_organization = $1
  `;
  const queryResult = await query(sql, idOrganization);

  const { result, rowCount } = queryResult;

  if (rowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  return result;
};

const newProduct = async ({ type, client, color }) => {
  const sql = 'INSERT INTO product("type", client, color) VALUES($1, $2, $3) RETURNING id_product as id;';

  try {
    const { result, rowCount } = await query(sql, type, client, color);

    if (rowCount !== 1) throw new CustomError('No se pudo registrar el producto', 500);

    return result[0];
  } catch (ex) {
    const error = 'Datos no válidos.';
    throw new CustomError(error, 400);
  }
};

const getProducts = async (searchQuery) => {
  let queryResult;
  if (searchQuery) {
    const sql = `select prod.id_product, pt.name product, prod.client client_id, co.name client, prod.color from product prod
                inner join product_type pt on prod.type = pt.id_product_type
                inner join client_organization co on prod.client = co.id_client_organization
                where prod.client ilike $1
                or prod.id_product ilike $1
                or pt.name ilike $1
                or prod.color ilike $1`;
    queryResult = await query(sql, `%${searchQuery}%`);
  } else {
    const sql = `select prod.id_product, pt.name product, prod.client client_id, co.name client, prod.color from product prod
                inner join product_type pt on prod.type = pt.id_product_type
                inner join client_organization co on prod.client = co.id_client_organization`;
    queryResult = await query(sql);
  }

  const { result, rowCount } = queryResult;

  if (rowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  return result.map((val) => ({
    id: val.id_product,
    product: val.product,
    client_id: val.client_id,
    client: val.client,
    color: val.color,
  }));
};

const getProductModelsbyOrganization = async ({
  idClient, colors, types, search = '',
}) => {
  const placeholders = types !== undefined
    ? types.map((_, index) => `$${index + 3}`).join(',')
    : undefined;

  const infoSql = `select id_product_model, pt.id_product_type "id_product_type", pt.name "type", id_client_organization, pm.name description, details from product_model pm
  inner join product_type pt on pm.type = pt.id_product_type
  where id_client_organization = $1 and pm.name ilike $2
  ${types !== undefined && types.length > 0 ? `and pt.id_product_type in (${placeholders})` : ''};`;

  const { result: infoResult, rowCount: infoRowCount } = types !== undefined && types.length > 0
    ? await query(infoSql, idClient, `%${search}%`, ...types)
    : await query(infoSql, idClient, `%${search}%`);

  if (infoRowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  const mediaSql = `select pmed.id_product_model, pmed."name"
  from product_model pm
  inner join product_type pt on pm.type = pt.id_product_type
  inner join product_model_media pmed on pmed.id_product_model = pm.id_product_model
  where id_client_organization = $1; `;

  const { result: mediaResult } = await query(mediaSql, idClient);

  const colorSql = `select *
  from product_model pm
  inner join product_type pt on pm.type = pt.id_product_type
  inner join product_model_color pc on pc.id_product_model = pm.id_product_model
  inner join color "c" on pc.id_color = "c".id_color
  where id_client_organization = $1; `;

  const { result: colorResult } = await query(colorSql, idClient);

  infoResult.forEach((product) => {
    const colorList = [];
    const mediaList = [];
    colorResult.forEach((c) => {
      if (c.id_product_model === product.id_product_model) colorList.push(c);
    });
    mediaResult.forEach((m) => {
      if (m.id_product_model === product.id_product_model) mediaList.push(m);
    });
    // eslint-disable-next-line no-param-reassign
    product.colors = colorList;
    // eslint-disable-next-line no-param-reassign
    product.media = mediaList;
  });

  const infoMaped = infoResult.map((val) => {
    const colorList = val.colors.map((c) => ({
      id: c.id_color,
      color: c.name,
      red: c.red,
      green: c.green,
      blue: c.blue,
    }));

    const media = val.media.map((m) => (
      `${consts.imagePath.product}/${m.name}`
    ));

    return {
      id: val.id_product_model,
      id_product_type: val.id_product_type,
      type: val.type,
      client: val.id_client_organization,
      description: val.description,
      details: val.details,
      colors: colorList,
      media,
    };
  });

  const response = colors !== undefined && colors.length > 0 ? infoMaped.filter((r) => (
    colors.every((targetColorId) => (r.colors.some((color) => (color.id === targetColorId))))
  )) : infoMaped;

  if (response.length < 1) throw new CustomError('No se encontraron resultados.', 404);
  return response;
};

const newRequeriment = async ({
  product, size, material, fabric, quantityPerUnit,
}) => {
  const sql = `INSERT INTO requirements VALUES($1, $2, $3, $4, $5)
    RETURNING product as id; `;

  try {
    const { result, rowCount } = await query(
      sql,
      product,
      size,
      material,
      fabric,
      quantityPerUnit,
    );

    if (rowCount !== 1) throw new CustomError('No se pudo registrar requerimiento para el producto', 500);

    return result[0];
  } catch (err) {
    if (err instanceof CustomError) throw err;

    if (err?.constraint === 'check_requirement') {
      throw new CustomError('Solo puede agregar un tipo de material a la vez.', 400);
    }
    const error = 'Datos no válidos.';

    throw new CustomError(error, 400);
  }
};

const getRequirements = async (product, searchQuery) => {
  let queryResult;
  if (searchQuery) {
    const sql = `select r.product id_product, s.size, COALESCE(mat.description, f.fabric) material,
  r.quantity_per_unit from requirements r
                inner join product prod on r.product = prod.id_product
                inner join product_type pt on prod.type = pt.id_product_type
                inner join client_organization co on prod.client = co.id_client_organization
                inner join "size" s on r.size = s.id_size
                left join material mat on r.material = mat.id_material
                left join fabric f on r.fabric = f.id_fabric
                where r.product = $1
AND(s.size ilike $2 or mat.description ilike $2 or f.fabric ilike $2); `;
    queryResult = await query(sql, product, `% ${searchQuery}% `);
  } else {
    const sql = `select r.product id_product, s.size, COALESCE(mat.description, f.fabric) material,
  r.quantity_per_unit from requirements r
                inner join product prod on r.product = prod.id_product
                inner join product_type pt on prod.type = pt.id_product_type
                inner join client_organization co on prod.client = co.id_client_organization
                inner join "size" s on r.size = s.id_size
                left join material mat on r.material = mat.id_material
                left join fabric f on r.fabric = f.id_fabric
                where r.product = $1`;
    queryResult = await query(sql, product);
  }

  const { result, rowCount } = queryResult;

  if (rowCount === 0) throw new CustomError('No se encontraron resultados.', 404);

  return result.map((val) => ({
    id: val.id_product,
    size: val.size,
    material: val.material,
    quantity: val.quantity_per_unit,
  }));
};

const newProductModel = async ({
  type, idClientOrganization, name, details,
}) => {
  try {
    const sql = 'INSERT INTO product_model("type", id_client_organization, "name", details) VALUES($1, $2, $3, $4) RETURNING id_product_model as id;';

    const { result, rowCount } = await query(sql, type, idClientOrganization, name, details);

    if (rowCount !== 1) throw new CustomError('No se pudo registrar el modelo del producto.', 500);

    return result[0].id;
  } catch (ex) {
    if (ex?.code === '23503') {
      if (ex?.detail.includes('type')) throw new CustomError('El tipo de producto no existe.', 400);
      if (ex?.detail.includes('id_client_organization')) throw new CustomError('La organización del cliente no existe.', 400);
    }
    throw ex;
  }
};

const addProductModelColor = async ({ idProductModel, idColor }) => {
  try {
    const sql = 'INSERT INTO product_model_color(id_product_model, id_color) VALUES($1, $2);';

    const { rowCount } = await query(sql, idProductModel, idColor);

    if (rowCount !== 1) throw new CustomError('No se pudo agregar el color al modelo del producto.', 500);
  } catch (ex) {
    if (ex?.code === '23503') {
      if (ex?.detail.includes('id_product_model')) throw new CustomError('El modelo de producto proporcionado no existe.', 400);
      if (ex?.detail.includes('id_color')) throw new CustomError('El color proporcionado no existe.', 400);
    }
    throw ex;
  }
};

const addProductModelMedia = async ({ idProductModel, name }) => {
  try {
    const sql = 'INSERT INTO product_model_media(id_product_model, name) VALUES($1, $2);';

    const { rowCount } = await query(sql, idProductModel, name);

    if (rowCount !== 1) throw new CustomError('No se pudo guardar el recurso multimedia para el modelo de producto.', 500);
  } catch (ex) {
    if (ex?.code === '23503') throw new CustomError('El modelo de producto proporcionado no existe.', 400);
    throw ex;
  }
};

const getProductModelById = async ({ idProductModel }) => {
  const infoSql = `select id_product_model, pt.id_product_type "id_product_type", pt.name "type", pm.id_client_organization,
  c.name as client, pm.name description, details 
  from product_model pm
  inner join product_type pt on pm.type = pt.id_product_type
  inner join client_organization c on pm.id_client_organization = c.id_client_organization
  where id_product_model = $1`;

  const { result: infoResult, rowCount: infoRowCount } = await query(infoSql, idProductModel);

  if (infoRowCount === 0) throw new CustomError('No se encontraron resultados para el ID proporcionado.', 404);

  const mediaSql = `select * from product_model_media
    where id_product_model = $1; `;

  const { result: mediaResult } = await query(mediaSql, idProductModel);

  const colorSql = `select * from product_model_color
    natural join color
    where id_product_model = $1; `;

  const response = infoResult.map((val) => ({
    id: val.id_product_model,
    id_product_type: val.id_product_type,
    type: val.type,
    id_client_organization: val.id_client_organization,
    client: val.client,
    description: val.description,
    details: val.details,
  }));

  const { result: colorResult } = await query(colorSql, idProductModel);

  const colors = colorResult.map((val) => ({
    id: val.id_color,
    color: val.name,
    red: val.red,
    green: val.green,
    blue: val.blue,
  }));

  const media = mediaResult.map((val) => (`${consts.imagePath.product}/${val.name}`));

  response[0].media = media;
  response[0].colors = colors;

  return response[0];
};

const getProductById = async ({ idProduct }) => {
  const infoSql = `select id_product, pt.id_product_type "id_product_type", pt.name "type", pm.id_client_organization,
  c.name as client, pm.name description, details 
  from product pm
  inner join product_type pt on pm.type = pt.id_product_type
  inner join client_organization c on pm.id_client_organization = c.id_client_organization
  where id_product = $1`;

  const { result: infoResult, rowCount: infoRowCount } = await query(infoSql, idProduct);

  if (infoRowCount === 0) throw new CustomError('No se encontraron resultados para el ID proporcionado.', 404);

  const mediaSql = `select * from product_media
    where id_product = $1; `;

  const { result: mediaResult } = await query(mediaSql, idProduct);

  const colorSql = `select c.* from product_color pc
  inner join color c on pc.id_color = c.id_color
  where pc.id_product = $1 `;

  const response = infoResult.map((val) => ({
    id: val.id_product,
    id_product_type: val.id_product_type,
    type: val.type,
    id_client_organization: val.id_client_organization,
    client: val.client,
    description: val.description,
    details: val.details,
  }));

  const { result: colorResult } = await query(colorSql, idProduct);

  const colors = colorResult.map((val) => ({
    id: val.id_color,
    color: val.name,
    red: val.red,
    green: val.green,
    blue: val.blue,
  }));

  const media = mediaResult.map((val) => (`${consts.imagePath.product}/${val.name}`));

  response[0].media = media;
  response[0].colors = colors;

  return response[0];
};

const updateProductModel = async ({
  idProductModel, type, idClientOrganization, name, details,
}) => {
  const sqlGet = 'select * from product_model where id_product_model = $1;';
  const { result: resultGet, rowCount: rowCountGet } = await query(sqlGet, idProductModel);

  if (rowCountGet === 0) { throw new CustomError('No se han encontrado registros con el id proporcionado.', 404); }

  const sqlUpdate = `update product_model
    set "type" = $1,
      id_client_organization = $2,
      "name" = $3,
      details = $4
    where id_product_model = $5`;
  await query(
    sqlUpdate,
    type || resultGet[0].type,
    idClientOrganization || resultGet[0].id_client_organization,
    name || resultGet[0].name,
    details || resultGet[0].details,
    idProductModel,
  );
};

const removeProductModelMedia = async ({ idProductModel, name }) => {
  const sql = 'DELETE FROM product_model_media WHERE id_product_model = $1 AND name = $2';

  const { rowCount } = await query(sql, idProductModel, name);

  if (rowCount === 0) throw new CustomError('No se encontró el recurso multimedia para el modelo de producto.', 404);
};

const verifyProductModelOwner = async ({ idClientOrganization, idProductModel }) => {
  const sqlQuery = 'SELECT 1 FROM product_model WHERE id_product_model = $1 AND id_client_organization = $2';

  const { rowCount } = await query(sqlQuery, idProductModel, idClientOrganization);

  if (rowCount === 0) throw new CustomError('Acceso denegado a datos del modelo de producto.', 403);
};

const verifyProductOwner = async ({ idClientOrganization, idProduct }) => {
  const sqlQuery = 'SELECT 1 FROM product WHERE id_product = $1 AND id_client_organization = $2';

  const { rowCount } = await query(sqlQuery, idProduct, idClientOrganization);

  if (rowCount === 0) throw new CustomError('Acceso denegado a datos del producto.', 403);
};

export {
  getProductTypes,
  newProductType,
  getProducts,
  getProductModelsbyOrganization,
  newProduct,
  getRequirements,
  newRequeriment,
  newProductModel,
  addProductModelColor,
  addProductModelMedia,
  getProductTypesByOrganization,
  getProductModelById,
  updateProductModel,
  verifyProductModelOwner,
  getProductById,
  verifyProductOwner,
  removeProductModelMedia,
  getProductMedia,
  getProductModelMedia,
  getProductColors,
  getProductModelColors,
};

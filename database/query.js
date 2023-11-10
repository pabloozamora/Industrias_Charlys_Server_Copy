import connection from './connection.js';

/**
 * @param query Query sql.
 * @param params Parametros a inyectar en el query, utilizando $1,$2,$3...
 * @returns Object \{result} filas resultantes de query.
 * @returns Object \{rowCount} filas encontradas/modificadas.
 */
export default async (query, ...params) => {
  const queryResult = await connection.query(
    query,
    params.length > 0 ? [...params] : null,
  );
  const { rows: result, rowCount } = queryResult;

  return { result, rowCount };
};

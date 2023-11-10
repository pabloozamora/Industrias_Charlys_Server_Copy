import query from '../../database/query.js';
import CustomError from '../../utils/customError.js';

const createTemporaryClient = async ({
  name, email, phone = null, address,
}) => {
  const sql = `INSERT INTO temporary_client(name, email, phone, address)
                VALUES ($1, $2, $3, $4) RETURNING id_temporary_client as id;`;

  try {
    const { result, rowCount } = await query(
      sql,
      name,
      email,
      phone,
      address,
    );

    if (rowCount !== 1) throw new CustomError('No se pudo registrar lel cliente temporal.', 500);

    return result[0];
  } catch (ex) {
    if (ex?.constraint === 'temp_client_check_email') { throw new CustomError('El formato del email es inválido.', 400); }
    throw ex;
  }
};

const getTemporaryClient = async (temporaryClientId) => {
  const sql = `SELECT id_temporary_client as id, name, email, phone, address FROM temporary_client 
              WHERE id_temporary_client = $1;`;
  const { result, rowCount } = await query(sql, temporaryClientId);

  return rowCount > 0
    ? result[0]
    : null;
};

const deleteTemporaryClient = async (temporaryClientId) => {
  const sql = 'DELETE FROM temporary_client WHERE id_temporary_client = $1';
  const { rowCount } = await query(sql, temporaryClientId);
  if (rowCount !== 1) throw new CustomError('No se encontró el cliente temporal a eliminar.', 404);
};

export { createTemporaryClient, getTemporaryClient, deleteTemporaryClient };

import query from '../../database/query.js';
import CustomError from '../../utils/customError.js';
import consts from '../../utils/consts.js';

const createUser = async ({
  name,
  lastName,
  email,
  phone,
  sex,
  passwordHash,
  idClientOrganization,
  idEmployee,
}) => {
  try {
    const sql = `INSERT INTO user_account(name, lastname, email, phone, password, sex, 
        id_client_organization, id_employee) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_user as id`;
    const { rowCount, result } = await query(
      sql,
      name,
      lastName,
      email,
      phone,
      passwordHash,
      sex,
      idClientOrganization ?? null,
      idEmployee ?? null,
    );

    if (rowCount !== 1) {
      throw new CustomError('No se pudo registrar el usuario.', 500);
    }

    return result[0].id;
  } catch (err) {
    if (err instanceof CustomError) throw err;
    const { code, detail } = err;
    let error = 'Datos no válidos.';
    // LLave repetida
    if (code === '23505') {
      if (detail?.includes('(email)')) error = 'El email ya se encuentra asignado a otro usuario.';
    }

    throw new CustomError(error, 400);
  }
};

const createAdmin = async ({
  name, lastName, email, phone, sex, passwordHash,
}) => {
  try {
    await query('BEGIN');

    // crear registro de empleado admin
    const resEmployee = await query(
      'INSERT INTO employee(role) VALUES($1) RETURNING id_employee as id',
      consts.role.admin,
    );

    if (resEmployee.rowCount !== 1) {
      throw new CustomError('No se pudo registrar el empleado admin.', 500);
    }

    const idEmployee = resEmployee.result[0].id;

    // insertar al usuario
    const userId = await createUser({
      name,
      lastName,
      email,
      phone,
      sex,
      passwordHash,
      idEmployee,
    });

    await query('COMMIT');

    return userId;
  } catch (ex) {
    await query('ROLLBACK');

    throw ex;
  }
};

const removeOrganizationMember = async ({ idUser }) => {
  try {
    const sql = 'delete from user_account where id_user = $1 and id_client_organization is not null;';
    const { rowCount } = await query(sql, idUser);
    if (rowCount !== 1) throw new CustomError('No se encontró el usuario.', 400);
  } catch (ex) {
    if (ex?.code === '23503') {
      const sqlQuery = 'UPDATE user_account SET enabled = false WHERE id_user = $1 and id_client_organization is not null;';
      const { rowCount } = await query(sqlQuery, idUser);
      if (rowCount !== 1) throw new CustomError('No se encontró el usuario.', 400);
    } else throw ex;
  }
};

const createOrganizationMember = async ({
  name,
  lastName,
  email,
  phone,
  sex,
  idClientOrganization,
}) => {
  try {
    const sqlQuery = `
  INSERT INTO user_account (name, lastname, email, phone, sex, id_client_organization)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING id_user AS id
  `;

    const { rowCount, result } = await query(
      sqlQuery,
      name,
      lastName,
      email,
      phone,
      sex,
      idClientOrganization,
    );

    if (rowCount !== 1) {
      throw new CustomError('No se pudo registrar al nuevo miembro.', 500);
    }

    return result[0];
  } catch (ex) {
    if (ex?.code === '23503') { throw new CustomError('La organización del nuevo miembro no existe.', 400); }
    if (ex?.code === '23505') { throw new CustomError('El correo ingresado ya existe', 400); }
    throw ex;
  }
};

const saveRegisterToken = async ({ idUser, token }) => {
  const sqlQuery = 'INSERT INTO alter_user_token (id_user, token) VALUES ($1, $2)';

  const { rowCount } = await query(sqlQuery, idUser, token);

  if (rowCount !== 1) {
    throw new CustomError('No se pudo almacenar el token de miembro.', 500);
  }
};

const validateAlterUserToken = async ({ idUser, token }) => {
  const sqlQuery = 'SELECT 1 FROM alter_user_token WHERE id_user = $1 AND token = $2';

  const { rowCount } = await query(sqlQuery, idUser, token);

  if (rowCount !== 1) {
    throw new CustomError('El token de autorización no es válido.', 401);
  }
};

const updateUserPassword = async ({ idUser, passwordHash }) => {
  const sqlQuery = 'UPDATE user_account SET password = $1 WHERE id_user = $2';
  const { rowCount } = await query(sqlQuery, passwordHash, idUser);

  if (rowCount !== 1) {
    throw new CustomError('No se pudo actualizar la contraseña del usuario.', 500);
  }
};

const deleteAlterUserToken = async ({ token }) => {
  const sqlQuery = 'DELETE FROM alter_user_token WHERE token = $1';
  const { rowCount } = await query(sqlQuery, token);

  if (rowCount === 0) {
    throw new CustomError('No se eliminó el token de usuario.', 404);
  }
};

const deleteAllUserAlterTokens = async ({ idUser }) => {
  const sqlQuery = 'DELETE FROM alter_user_token WHERE id_user = $1';
  const { rowCount } = await query(sqlQuery, idUser);

  if (rowCount === 0) {
    throw new CustomError('No se eliminaron los token de usuario.', 404);
  }
};

export {
  createAdmin,
  createOrganizationMember,
  saveRegisterToken,
  validateAlterUserToken,
  updateUserPassword,
  deleteAllUserAlterTokens,
  deleteAlterUserToken,
  removeOrganizationMember,
};

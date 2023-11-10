import query from '../../database/query.js';
import CustomError from '../../utils/customError.js';

const verifyProductImageOwnership = async ({ imageName, idUser }) => {
  const sqlQuery = `SELECT 1 FROM product_model_media PM
  INNER JOIN product_model P ON PM.id_product_model = P.id_product_model
  INNER JOIN user_account U ON P.id_client_organization = U.id_client_organization
  WHERE PM.name = $1 AND U.id_user = $2`;

  const { rowCount } = await query(sqlQuery, imageName, idUser);

  if (rowCount === 0) throw new CustomError('No estás autorizado para acceder a este recurso.', 403);
};

// eslint-disable-next-line import/prefer-default-export
export { verifyProductImageOwnership };

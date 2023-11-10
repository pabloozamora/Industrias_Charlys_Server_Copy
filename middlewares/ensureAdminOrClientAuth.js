import { validateSessionToken } from '../apiServices/session/session.model.js';
import { validateToken } from '../services/jwt.js';
import consts from '../utils/consts.js';

const ensureAdminOrClientAuth = async (req, res, next) => {
  const authToken = req.headers?.authorization;

  if (!authToken) {
    res.statusMessage = 'No se ha especificado el token de autorización.';
    return res.sendStatus(401);
  }

  try {
    const userData = validateToken(authToken);

    await validateSessionToken({
      userId: userData.userId,
      token: authToken,
      type: consts.token.access,
    });

    if (userData.type !== consts.token.access) {
      res.statusMessage = 'El token de autorización no es de tipo access.';
      return res.sendStatus(401);
    }

    if (userData.role !== consts.role.admin && userData.role !== consts.role.client) {
      res.statusMessage = 'No se cuenta con los privilegios necesarios para realizar esta acción.';
      return res.sendStatus(403);
    }

    req.session = userData;
    next();
  } catch (ex) {
    res.statusMessage = 'El token de autorización no es válido o ha expirado.';
    res.sendStatus(401);
  }

  return null;
};

export default ensureAdminOrClientAuth;

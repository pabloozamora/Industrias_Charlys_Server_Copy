import sha256 from 'js-sha256';
import moment from 'moment';
import config from 'config';
import CustomError from '../../utils/customError.js';
import {
  authenticate, deleteSessionTokenByUserId, storeSessionToken, validateSessionToken,
} from './session.model.js';
import { signAccessToken, signRefreshToken, validateToken } from '../../services/jwt.js';
import consts from '../../utils/consts.js';

const allowInsecureConnections = config.get('allowInsecureConnections');

const saveRefreshTokenInCookies = (res, token) => {
  res.cookie('refreshToken', token, {
    secure: !allowInsecureConnections,
    httpOnly: true,
    expires: moment().add(1, 'weeks').toDate(),
  });
};

const loginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    const passwordHash = sha256(password);
    const {
      userId, name, lastName, sex, role, clientOrganizationId,
    } = await authenticate({ email, passwordHash });

    const refreshToken = await signRefreshToken({
      userId, name, lastName, sex, role, clientOrganizationId,
    });

    // guardar refresh token en bd
    await storeSessionToken({ userId, token: refreshToken, type: consts.token.refresh });

    // almacenar token en cookies
    saveRefreshTokenInCookies(res, refreshToken);
    // crea un access token
    const accessToken = await signAccessToken({
      userId, name, lastName, sex, role, clientOrganizationId,
    });

    // guardar access token en bd
    await storeSessionToken({ userId, token: accessToken, type: consts.token.access });

    res.send({ accessToken });
  } catch (ex) {
    let err = 'Ocurrio un error al intentar loggearse.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const refreshAccessTokenController = async (req, res) => {
  const {
    userId, name, lastName, sex, role, clientOrganizationId,
  } = req.session;

  const { refreshToken } = req.cookies;

  try {
    // validar refresh token en bd
    await validateSessionToken({ userId, token: refreshToken, type: consts.token.refresh });

    // create access token
    const accessToken = await signAccessToken({
      userId, name, lastName, sex, role, clientOrganizationId,
    });

    await storeSessionToken({ userId, token: accessToken, type: consts.token.access });

    res.send({ accessToken });
  } catch (ex) {
    let err = 'Ocurrio un error al refrescar access token.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const logoutController = async (req, res) => {
  const { refreshToken } = req.cookies;

  try {
    // Eliminar token de bd y cookie
    res.clearCookie('refreshToken');

    const { userId } = validateToken(refreshToken);

    await deleteSessionTokenByUserId(userId);

    res.sendStatus(200);
  } catch (ex) {
    let err = 'Ocurrio un error al cerrar sesión.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

export { loginController, refreshAccessTokenController, logoutController };

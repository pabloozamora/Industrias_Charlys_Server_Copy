import sha256 from 'js-sha256';
import CustomError from '../../utils/customError.js';
import {
  createAdmin,
  createOrganizationMember,
  deleteAllUserAlterTokens,
  removeOrganizationMember,
  saveRegisterToken,
  updateUserPassword,
  validateAlterUserToken,
} from './user.model.js';
import { begin, rollback, commit } from '../../database/transactions.js';
import { signRegisterToken } from '../../services/jwt.js';
import NewUserEmail from '../../services/email/NewUserEmail.js';

const removeOrganizationMemberController = async (req, res) => {
  const { idUser } = req.params;
  try {
    await removeOrganizationMember({ idUser });
    res.send(idUser);
  } catch (ex) {
    let err = 'Ocurrió un error al remover usuario de una organización.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const createAdminController = async (req, res) => {
  const {
    name, lastName, email, phone, sex, password,
  } = req.body;

  try {
    const passwordHash = sha256(password);
    const userId = await createAdmin({
      name,
      lastName,
      email,
      phone,
      sex,
      passwordHash,
    });

    res.status(200).send({ id: userId });
  } catch (ex) {
    let err = 'Ocurrio un error al crear usuario admin';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
  return null;
};

const createOrganizationMemberController = async (req, res) => {
  const {
    name, lastName, email, phone, sex, idClientOrganization,
  } = req.body;

  try {
    await begin();

    const { id } = await createOrganizationMember({
      name,
      lastName,
      email,
      phone,
      sex,
      idClientOrganization,
    });

    // guardar token para completar registro
    const token = signRegisterToken({
      id,
      name,
      lastName,
      email,
    });
    await saveRegisterToken({ idUser: id, token });

    // enviar email de notificación
    const emailSender = new NewUserEmail({ addresseeEmail: email, name, registerToken: token });
    await emailSender.sendEmail();

    await commit();

    res.sendStatus(204);
  } catch (ex) {
    await rollback();

    let err = 'Ocurrio un error al crear nuevo usuario.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status ?? 500;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const validateRegisterTokenController = async (req, res) => {
  const token = req.headers?.authorization;
  const idUser = req.session?.id;

  try {
    await validateAlterUserToken({ idUser, token });
    res.sendStatus(204);
  } catch (ex) {
    let err = 'Ocurrio un error al validar token de registro.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status ?? 500;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

const finishRegistrationController = async (req, res) => {
  const { password } = req.body;
  const idUser = req.session.id;

  const passwordHash = sha256(password);

  try {
    await begin();

    await updateUserPassword({ idUser, passwordHash });

    // eliminar tokens para modificar usuario
    await deleteAllUserAlterTokens({ idUser });

    await commit();

    res.sendStatus(204);
  } catch (ex) {
    await rollback();

    let err = 'Ocurrio un error al crear nuevo usuario cliente.';
    let status = 500;
    if (ex instanceof CustomError) {
      err = ex.message;
      status = ex.status ?? 500;
    }
    res.statusMessage = err;
    res.status(status).send({ err, status });
  }
};

export {
  createAdminController,
  createOrganizationMemberController,
  finishRegistrationController,
  validateRegisterTokenController,
  removeOrganizationMemberController,
};

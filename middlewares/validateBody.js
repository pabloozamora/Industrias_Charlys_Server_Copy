import fs from 'fs';

/**
 * Middleware para realizar la validación del body.
 * @param schema schema con yup a validar.
 * @param role rol del usuario. Si el rol del usuario no coincide con el proporcionado, se omite
 * la validación.
 */
const validateBody = (schema, role) => async (req, res, next) => {
  try {
    if (role && req.session.role !== role) return next();
    await schema.validate(req.body);
    return next();
  } catch (err) {
    // Eliminar archivos cargados
    const { uploadedFiles } = req;
    if (uploadedFiles !== null && uploadedFiles !== undefined) {
      if (Array.isArray(uploadedFiles)) {
        uploadedFiles.forEach((file) => {
          fs.unlink(`${global.dirname}/files/${file.fileName}`, (error) => {
            // eslint-disable-next-line no-console
            console.log('🚀 ~ file: validateBody.js:15 ~ fs.unlink ~ error:', error);
          });
          return null;
        });
      } else {
        fs.unlink(`${global.dirname}/files/${uploadedFiles.fileName}`, (error) => {
        // eslint-disable-next-line no-console
          console.log('🚀 ~ file: validateBody.js:21 ~ error:', error);
        });
      }
    }
    res.statusMessage = err?.message;
    return res.status(400).send({ err: err?.message, status: 400, ok: false });
  }
};

export default validateBody;

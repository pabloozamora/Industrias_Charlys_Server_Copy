const parseObjectBodyProp = (key) => (req, res, next) => {
  try {
    req.body[key] = JSON.parse(req.body[key]);
  } catch (ex) {
    // Error al hacer el parseo
  }
  next();
};

export default parseObjectBodyProp;

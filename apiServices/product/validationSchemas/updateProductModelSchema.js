import yup from 'yup';

export default yup
  .object()
  .shape({
    // idProductModel, type, idClientOrganization, name, details,
    imagesToRemove: yup.array(yup.string()).nullable().typeError("El campo 'imagesToRemove' debe ser una lista."),
    type: yup.string().nullable(),
    idClientOrganization: yup.string().nullable(),
    name: yup.string().nullable(),
    details: yup.string().nullable(),
    idProductModel: yup.string().required("El campo 'idProductModel' es requerido."),
  });

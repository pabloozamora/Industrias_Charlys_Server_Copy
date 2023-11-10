import yup from 'yup';

export default yup
  .object()
  .shape({
    type: yup.string().required("El campo 'type' es obligatorio."),
    color: yup.array(yup.string()).typeError("El campo 'color' debe ser una lista de los id's de colores a utilizar."),
    idClientOrganization: yup.string().required("El campo 'idClientOrganization' es obligatorio."),
    details: yup.string(),
    name: yup.string().required("El campo 'name' es obligatorio."),
  });

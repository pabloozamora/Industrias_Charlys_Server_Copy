import yup from 'yup';

export default yup
  .object()
  .shape({
    sex: yup
      .string().matches(/^[MF]$/, "El campo 'sex' debe ser 'M' o 'F'.").required("El campo 'sex' es obligatorio."),
    phone: yup.string().required("El campo 'phone' es obligatorio."),
    email: yup
      .string()
      .nullable()
      .email("El valor de 'email' no posee el formato de una email válido.")
      .required("El campo 'email' es obligatorio."),
    lastName: yup.string().required("El campo 'lastName' es obligatorio."),
    name: yup.string().required("El campo 'name' es obligatorio."),
    idClientOrganization: yup.string().required("El campo 'idClientOrganization' es obligatorio."),
  });

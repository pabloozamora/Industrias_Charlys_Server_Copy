import yup from 'yup';

export default yup
  .object()
  .shape({
    name: yup.string().required("El campo 'name' es obligatorio."),
    email: yup
      .string()
      .nullable()
      .email("El valor de 'email' no posee el formato de una email válido.")
      .required("El campo 'email' es obligatorio."),
    phone: yup.string().required("El campo 'phone' es obligatorio."),
    address: yup.string().required("El campo 'address' es obligatorio."),
  });

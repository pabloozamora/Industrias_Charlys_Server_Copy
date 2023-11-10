import yup from 'yup';

export default yup
  .object()
  .shape({
    description: yup.string().required("El campo 'description' es obligatorio."),
    address: yup.string().required("El campo 'address' es obligatorio."),
    phone: yup.string().required("El campo 'phone' es obligatorio."),
    email: yup
      .string()
      .nullable()
      .email("El valor de 'email' no posee el formato de una email válido.")
      .required("El campo 'email' es obligatorio."),
    name: yup.string().required("El campo 'name' es obligatorio."),
  });

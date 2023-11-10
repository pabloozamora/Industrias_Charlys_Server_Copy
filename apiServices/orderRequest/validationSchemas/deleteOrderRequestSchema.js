import yup from 'yup';

export default yup
  .object()
  .shape({
    idOrderRequest: yup.string().required("El campo 'idOrderRequest' es requerido."),
  });

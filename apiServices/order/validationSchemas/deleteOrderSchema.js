import yup from 'yup';

export default yup
  .object()
  .shape({
    idOrder: yup.string().required("El campo 'idOrder' es obligatorio."),
  });

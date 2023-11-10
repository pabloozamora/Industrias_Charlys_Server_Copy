import yup from 'yup';

export default yup
  .object()
  .shape({
    idProduct: yup.string().required("El campo 'idProduct' es obligatorio."),
  });

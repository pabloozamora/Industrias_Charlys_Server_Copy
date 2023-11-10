import yup from 'yup';

export default yup
  .object()
  .shape({
    size: yup.string().required("El campo 'size' es obligatorio."),
  });

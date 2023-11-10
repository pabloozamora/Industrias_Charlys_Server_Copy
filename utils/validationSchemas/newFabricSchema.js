import yup from 'yup';

export default yup
  .object()
  .shape({
    fabric: yup.string().required("El campo 'fabric' es obligatorio."),
    color: yup.string().required("El campo 'color' es obligatorio."),
  });

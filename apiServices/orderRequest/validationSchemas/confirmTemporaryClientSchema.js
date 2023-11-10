import yup from 'yup';

export default yup
  .object()
  .shape({
    organizationId: yup.string().required("El campo 'organizationId' es obligatorio."),
  });

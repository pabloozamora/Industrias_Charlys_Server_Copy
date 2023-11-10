import yup from 'yup';
// type, client, color
export default yup
  .object()
  .shape({
    type: yup.string().required("El campo 'type' es obligatorio."),
    client: yup.string().required("El campo 'client' es obligatorio."),
    color: yup.string().required("El campo 'color' es obligatorio."),
  });

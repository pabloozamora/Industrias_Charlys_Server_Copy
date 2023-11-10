import yup from 'yup';
// type, client, color
export default yup.object().shape({
  size: yup.string().required("El campo 'size' es obligatorio."),
});

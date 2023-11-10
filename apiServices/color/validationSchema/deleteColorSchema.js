import yup from 'yup';
// type, client, color
export default yup.object().shape({
  id: yup.string().required("El campo 'id' es obligatorio."),
});

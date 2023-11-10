import yup from 'yup';
// type, client, color
export default yup.object().shape({
  quantity: yup.number().nullable()
    .integer("El campo 'quantity' debe ser un número entero.")
    .typeError("El campo 'quantity' debe ser un número.")
    .min(0, "El campo 'quantity' debe ser mayor o igual a cero.")
    .required("El campo 'quantity' es obligatorio."),
  size: yup.string().required("El campo 'size' es obligatorio."),
  idProduct: yup.string().required("El campo 'idProduct' es obligatorio."),
});

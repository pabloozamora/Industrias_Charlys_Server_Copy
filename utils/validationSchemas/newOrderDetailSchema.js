import yup from 'yup';

export default yup
  .object()
  .shape({
    noOrder: yup.string().required("El campo 'noOrer' es obligatorio."),
    product: yup.string().required("El campo 'product' es obligatorio."),
    size: yup.string().required("El campo 'size' es obligatorio."),
    quantity: yup.string().required("El campo 'quantity' es obligatorio."),
  });

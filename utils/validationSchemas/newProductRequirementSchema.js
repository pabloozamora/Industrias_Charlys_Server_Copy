import yup from 'yup';
// product, size, material, fabric, quantityPerUnit,
export default yup
  .object()
  .shape({
    product: yup.string().required("El campo 'product' es obligatorio."),
    size: yup.string().required("El campo 'size' es obligatorio."),
    material: yup.string().nullable(),
    fabric: yup.string().nullable(),
    quantityPerUnit: yup.number().required("El campo 'quantityPerUnit' es obligatorio."),
  });

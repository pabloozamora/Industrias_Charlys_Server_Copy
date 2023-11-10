import yup from 'yup';

export default yup
  .object()
  .shape({
    inventoryId: yup.string().nullable().required("El campo 'inventoryId' es obligatorio."),
    supplier: yup.string().nullable(),
    details: yup.string().nullable(),
    measurementUnit: yup.string().nullable().required("El campo 'measurementUnit' es obligatorio."),
    quantity: yup
      .number()
      .typeError("El campo 'quantity' debe ser un número.")
      .required("El campo 'quantity' es obligatorio."),
    type: yup.string().nullable().required("El campo 'type' es obligatorio."),
    name: yup.string().nullable().required("El campo 'name' es obligatorio."),
  });

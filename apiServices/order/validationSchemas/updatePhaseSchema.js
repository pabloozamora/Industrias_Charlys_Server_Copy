import yup from 'yup';

export default yup
  .object()
  .shape({
    idOrder: yup.string().required("El campo 'idOrder' es obligatorio."),
    phase: yup.number().nullable().typeError("El campo 'phase' debe ser un número.")
      .integer("El campo 'phase' debe ser un entero.")
      .min(0, "El campo 'phase' debe ser igual o mayor a cero.")
      .required("El campo 'phase' es obligatorio."),
  });

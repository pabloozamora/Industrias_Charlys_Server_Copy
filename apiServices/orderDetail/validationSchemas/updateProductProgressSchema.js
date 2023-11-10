import yup from 'yup';

export default yup.object().shape({
  idOrder: yup.string().required("El campo 'idOrder' es obligatorio."),
  idProduct: yup.string().required("El campo 'idProduct' es obligatorio."),
  completed: yup
    .array(
      yup.object().shape({
        size: yup
          .string()
          .required("Los objetos dentro de completed deben tener la propiedad 'size'."),
        quantity: yup
          .number()
          .nullable()
          .typeError("El campo 'quantity' debe ser un número.")
          .integer("El campo 'quantity' debe ser un número entero.")
          .min(0, "El campo 'quantity' debe ser mayor o igual a cero.")
          .required("Los objetos dentro de completed deben tener la propiedad 'quantity'."),
      }).typeError("Los elementos del campo 'completed' deben ser objetos."),
    )
    .min(1, "El campo 'completed' debe tener al menos un elemento.")
    .typeError("El campo 'completed' debe ser una lista.")
    .required("El campo 'completed' es obligatorio."),
});

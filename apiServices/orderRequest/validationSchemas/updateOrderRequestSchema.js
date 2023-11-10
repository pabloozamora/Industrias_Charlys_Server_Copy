import yup from 'yup';

export default yup
  .object()
  .shape({
    imagesToRemove: yup.array(yup.string()).nullable().typeError("El campo 'imagesToRemove' debe ser una lista."),
    description: yup.string().nullable(),
    deadline: yup.date().typeError("El campo 'deadline' debe esr una fecha."),
    cost: yup.number().typeError("El campo 'cost' debe ser un número."),
    details: yup.string().nullable(),
    idOrderRequest: yup.string().required("El campo 'idOrderRequest' es requerido."),
    products: yup
      .array(
        yup
          .object()
          .shape({
            price: yup
              .number()
              .nullable()
              .typeError("El campo 'price' debe ser un número.")
              .min(0, "El campo 'price' debe ser igual o mayor a cero.")
              .required("El campo 'price' es obligatorio para cada producto."),
            quantity: yup
              .number()
              .nullable()
              .typeError("El campo 'quantity' debe ser un número para cada producto.")
              .integer("El campo 'quantity' debe ser un número entero.")
              .min(1, 'La cantidad de productos debe ser mayor a cero.')
              .required("Se debe añadir el campo 'quantity' para cada producto."),
            size: yup.string().required("Se debe añadir el campo 'size' para cada producto."),
            idProductModel: yup
              .string()
              .required("Se debe añadir el campo 'idProductModel' para cada producto."),
          })
          .typeError("El campo 'products' debe contener objetos."),
      )
      .typeError("El campo 'products' debe ser una lista.")
      .nullable(),
  });

import yup from 'yup';

export default yup.object().shape({
  products: yup
    .array(
      yup
        .object()
        .shape({
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
    .required("El campo 'products' es obligatorio."),
  description: yup.string().required("El campo 'description' es obligatorio."),
  idClientOrganization: yup.string().required("El campo 'idClientOrganization' es obligatorio."),
});

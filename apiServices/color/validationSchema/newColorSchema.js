import yup from 'yup';
// type, client, color
export default yup.object().shape({
  name: yup.string().required("El campo 'name' es obligatorio."),
  red: yup
    .number()
    .nullable()
    .typeError("El campo 'red' debe ser un número.")
    .integer("El campo 'red' debe ser un número entero.")
    .min(0, "El campo 'red' debe ser mayor o igual a cero.")
    .max(255, "El campo 'red' debe ser menor o igual a 255.")
    .required("El campo 'red' es obligatorio."),
  green: yup.number().nullable()
    .typeError("El campo 'green' debe ser un número.")
    .integer("El campo 'green' debe ser un número entero.")
    .min(0, "El campo 'green' debe ser mayor o igual a cero.")
    .max(255, "El campo 'green' debe ser menor o igual a 255.")
    .required("El campo 'green' es obligatorio.")
    .required("El campo 'green' es obligatorio."),
  blue: yup.number().nullable()
    .typeError("El campo 'blue' debe ser un número.")
    .integer("El campo 'blue' debe ser un número entero.")
    .min(0, "El campo 'blue' debe ser mayor o igual a cero.")
    .max(255, "El campo 'blue' debe ser menor o igual a 255.")
    .required("El campo 'blue' es obligatorio.")
    .required("El campo 'blue' es obligatorio."),
});

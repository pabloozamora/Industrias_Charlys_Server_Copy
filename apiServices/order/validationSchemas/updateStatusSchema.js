import yup from 'yup';

export default yup
  .object()
  .shape({
    idOrder: yup.string().required("El campo 'idOrder' es obligatorio."),
    isFinished: yup.boolean().nullable().typeError("El campo 'isFinished' debe ser un booleano."),
  });

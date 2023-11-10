import * as yup from 'yup';

export default yup.object().shape({
  password: yup
    .string()
    .required("El campo 'password' es obligatorio.")
    .test('min-length', "El campo 'password' es obligatorio.", (value) => value?.length > 0),
});

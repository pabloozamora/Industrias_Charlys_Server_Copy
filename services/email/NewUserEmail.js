import config from 'config';
import Email from './Email.js';

const host = config.get('host');

export default class NewUserEmail extends Email {
  constructor({
    addresseeEmail, name, registerToken,
  }) {
    super({
      addresseeEmail, subject: "¡Bienvenido a Industrias Charly's!", name,
    });

    const registerLink = `${host}/registro?access=${registerToken}`;

    super.message = `
    
    ¡Nos complace darte la bienvenida a Industrias Charly's! Somos una empresa especializada en la fabricación 
    de uniformes de alta calidad. Nos complace informarte que se ha creado una cuenta para ti en nuestro sistema.

    Para completar el proceso de registro y acceder a tu cuenta, te pedimos que hagas clic en el siguiente enlace:
    <br>
    <br>
    <a href='${registerLink}'> ${registerLink} </a>
    <br>
    <br>
    Este enlace te dirigirá a una página donde podrás establecer tu contraseña personal y confirmar 
    algunos detalles adicionales. Una vez que hayas completado el registro, podrás acceder a tu cuenta 
    y aprovechar todos los beneficios que ofrecemos.
    <br>
    <br>
    En Charly's Industries, nos enorgullece brindar un servicio excepcional a nuestros clientes. Si tienes 
    alguna pregunta o necesitas ayuda en cualquier momento, no dudes en contactarnos a través de nuestro 
    servicio de atención al cliente.
    <br>
    <br>
    <br>
    ¡Esperamos que disfrutes de tu experiencia con nosotros!
    `;
  }
}

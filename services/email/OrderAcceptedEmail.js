import Email from './Email.js';

export default class OrderAcceptedEmail extends Email {
  constructor({
    addresseeEmail, name, idOrderRequest, idOrder, detail, total,
  }) {
    super({
      addresseeEmail, subject: `Confirmación de Pedido: Solicitud #${idOrderRequest}`, name,
    });

    super.message = `
    Es un placer confirmar que su pedido ha sido procesado con éxito.
    Agradecemos su elección y confianza en Industrias Charly's.
    <br>
    <br>
    Detalles de Pedido:
    <br>
    Número de Solicitud de Pedido: #${idOrderRequest}
    <br>
    Número de Pedido Resultante: #${idOrder}
    <br>
    <br>
    ${detail.map((product) => (`${product.name} | Talla: ${product.size} - ${product.quantity} ${product.quantity > 1 ? 'unidades' : 'unidad'}. ${product.unit_cost !== null ? `(Q${product.unit_cost.toFixed(2)})` : ''}`)).join('<br>')}
    <br>
    ${total !== null ? `Total del Pedido: Q${total.toFixed(2)}<br>` : ''}
    <br>
    Su pedido está en proceso y pronto estará listo para el envío.
    Nuestro equipo trabaja para brindarle la mejor experiencia de compra y asegurarse de que reciba sus productos de manera oportuna.
    <br>
    <br>
    Si tiene alguna pregunta o necesita asistencia adicional, no dude en ponerse en contacto con nuestro equipo de atención al cliente. Estamos aquí para ayudarle en cualquier momento.
    <br>
    <br>
    Gracias nuevamente por elegirnos. Esperamos que disfrute de sus productos y tenga una experiencia de compra satisfactoria.
    <br>
    <br>
    Atentamente,
    Servicio al Cliente
    <br>
    <br>
    Opciones de contacto:
    <br>
    Dirección: 6ta Av. 4-90 col. Linda Vista, zona 4 de Villa Nueva
    <br>
    Teléfono: 5334 - 4014 / 3005 - 1942
    <br>
    Correo electrónico: industriascharlys@gmail.com
    <br>
    `;
  }
}

import nodemailer from 'nodemailer';
import moment from 'moment';
import 'moment/locale/es.js';
import config from 'config';

const clientId = config.get('clientId');
const clientSecret = config.get('clientSecret');
const refreshToken = config.get('refreshToken');

export default class Email {
  constructor({
    addresseeEmail, subject, name, message, attachments,
  }) {
    this._transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'soporte.industrias.charlys@gmail.com',
        clientId,
        clientSecret,
        refreshToken,
      },
    });

    this.addresseeEmail = addresseeEmail || '';
    this.subject = subject || 'Industrias Charlys';
    this.name = name || 'Usuario';
    this._message = message || '';
    this.attachments = attachments;

    this.emailBody = this.getMessageBody();

    moment.locale('es');
  }

  getMessageBody() {
    return `
        <main>
            <div style='background:#0c4271; color:white; font-family:helvetica; font-size:30px;  width:100%;  text-align: center; padding: 15px 5px 15px 5px; box-sizing: border-box;'>
            Industrias Charlys
            </div>
            <div style='width:100%;  border: 1px solid #f0f0f0; border-bottom: 1px solid #c0c0c0; border-bottom-left-radius: 3px; border-bottom-right-radius: 3px; background: rgb(250,250,250);  padding: 25px 25px 35px 25px; font-family: helvetica; box-sizing: border-box;'>

                <center>
                    <h2 style="text-decoration: underline;">${this.subject}</h2>
                    
                </center>

                <div style="text-align: justify; font-size:16px;">
                    Estimado/a ${this.name},
                    <br>
                    <br>
                    ${this._message}
                    <br>
                    <br>
                    Gracias.
                
                </p>
                <span style="
                    float:right; 
                    font-size:12px; 
                    color:gray; 
                    ">Mensaje generado el ${moment().format('LLLL')}</span>
                    </br>
            </div>
        </main>
        `;
  }

  set message(message) {
    this._message = message;
    this.emailBody = this.getMessageBody();
  }

  sendEmail() {
    return new Promise((resolve, reject) => {
      const mailOptions = {
        from: 'Soporte Industrias Charlys',
        to: this.addresseeEmail,
        subject: this.subject,
        html: this.emailBody,
      };

      if (this.attachments) mailOptions.attachments = this.attachments;

      this._transporter.sendMail(mailOptions, (error, info) => {
        // enviar respuesta a promesa
        if (error) reject(error);
        else resolve(info);
      });
    });
  }
}

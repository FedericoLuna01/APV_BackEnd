import nodemailer from 'nodemailer';

const emailRegistro = async (datos) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    // enviar email
    const {nombre, email, token} = datos;
    const info = await transporter.sendMail({
        from: "APV - Administrador de pacientes de Veterinaria",
        to: email,
        subject: "Confirmación de registro - APV",
        text: "Comprueba tu cuenta en APV",
        html: `<p>Hola: ${nombre}, comprueba tu cuenta en APV.</p>
        <p>Para confirmar tu cuenta, haz click en el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Confirmar cuenta</a>
        <p>Si no has creado una cuenta en APV, ignora este email.</p>
        `
    })
    console.log('Mensaje enviado: %s', info.messageId)
}



export default emailRegistro;
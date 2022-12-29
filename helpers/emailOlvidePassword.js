import nodemailer from 'nodemailer';

const emailOlvidePassword = async (datos) => {
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
        subject: "Reestablecer contraseña - APV",
        text: "Reestablecer tu contraseña en APV",
        html: `<p>Hola: ${nombre}, has solicitado reestablecer tu contraseña.</p>
        <p>Para generar una nueva contraseña, haz click en el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer contraseña</a>
        <p>Si no has creado una cuenta en APV, ignora este email.</p>
        `
    })
    console.log('Mensaje enviado: %s', info.messageId)
}



export default emailOlvidePassword;
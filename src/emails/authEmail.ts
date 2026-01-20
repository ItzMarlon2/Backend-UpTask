import { transporter } from "../config/nodemailer"

interface IEmail {
    email: string,
    name: string,
    token: string
}

export class AuthEmail{
    static sendConfirmationEmail = async (user: IEmail) =>{
        const info =await transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: user.email,
            subject: 'UpTask - Confirma tu cuenta',
            text: 'UpTask - Confirma tu cuenta',
            html: `<p>Hola ${user.name}, bienvenido a UpTask</p>
            <p>Tu cuenta ya esta creada, solo debes confirmarla</p>
            <p>Visita el siguiente enlace:</p>
            <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
            <p>E ingresa el codigo: <b>${user.token}</b></p>
            <p>Este token expira en 10 minutos</p>
            `
        })
        console.log("mensaje enviado: ", info)
    }

    static sendForgotPasswordEmail = async (user: IEmail) =>{
        const info =await transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: user.email,
            subject: 'UpTask - Recupera tu contraseña',
            text: 'UpTask - Recupera tu contraseña',
            html: `<p>Hola ${user.name}, bienvenido a UpTask</p>
            <p>Has solicitado recuperar tu contraseña, para ello debes visitar el siguiente enlace:</p>
            <a href="${process.env.FRONTEND_URL}/auth/new-password">Recuperar Contraseña</a>
            <p>E ingresa el codigo: <b>${user.token}</b></p>
            <p>Este codigo expira en 10 minutos</p>
            `
        })
        console.log("mensaje enviado: ", info)
    }
}
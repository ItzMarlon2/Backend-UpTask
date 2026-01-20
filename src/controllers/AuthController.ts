import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from 'bcrypt'
import { checkPassword, hashPassword } from "../utils/auth";
import Token from "../models/Token";
import { generateToken } from "../utils/token";
import { transporter } from "../config/nodemailer";
import { AuthEmail } from "../emails/authEmail";
import { generateJWT } from "../utils/jwt";

export class AuthController{
    static createAccount = async (req: Request, res: Response) =>{
        try {

            const {password, email} = req.body

            //Prevenir duplicados
            const userExist = await User.findOne({email})
            if(userExist){
                const error = new Error('El usuario ya esta registrado')
                return res.status(409).json({error: error.message})
            }

            //Crea un usuario
            const user = new User(req.body)
            //Hash password
            user.password = await hashPassword(password)
            //Generar token
            const token = new Token()
            token.token = generateToken()
            token.user = user._id

            //Enviar Email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([token.save(), user.save()])
            res.send('Cuenta creada correctamente, revisa tu email para confirmala')
        } catch (error) {
            res.status(500).json({error: 'Hubo un Error'})
        }
    }

    static confirmAccount = async (req: Request, res: Response) =>{
        try {
            const {token} = req.body
            const tokenExist = await Token.findOne({token})

            if(!tokenExist){
                const error = new Error('Token no valido')
                return res.status(401).json({error: error.message})
            }
            
            const user = await User.findById(tokenExist.user)
            
            user.confirmed = true

            await Promise.allSettled([user.save(), tokenExist.deleteOne()])
            res.send('Cuenta confirmada correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un Error'})
        }
    }

    static login = async (req: Request, res: Response) =>{
        try {
            const {email, password} = req.body
            const user = await User.findOne({email})

            //Revisar si el usuario existe
            if(!user){
                const error = new Error('Usuario no encontrado')
                return res.status(404).json({error: error.message})
            }

            //Revisar si la cuenta esta confirmada
            if(!user.confirmed){
                const token = new Token()
                token.user = user._id
                token.token = generateToken()
                await token.save()
                //Enviar Email
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })
                const error = new Error('La cuenta no ha sido confirmada, revisa tu email para confirmarla')
                return res.status(401).json({error: error.message})
            }

            //Revisar password
            const isPasswordValid = await checkPassword(password, user.password)

            if(!isPasswordValid){
                const error = new Error('La contraseña es incorrecta')
                return res.status(401).json({error: error.message})
            }

            const token = generateJWT({id: user._id})
            
            res.send(token)

        } catch (error) {
            
            res.status(500).json({error: 'Hubo un Error'})
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) =>{
        try {

            const {email} = req.body

            //Usuario existe
            const userExist = await User.findOne({email})
            if(!userExist){
                const error = new Error('El usuario no está registrado')
                return res.status(404).json({error: error.message})
            }

            if(userExist.confirmed){
                const error = new Error('El usuario ya está confirmado')
                return res.status(403).json({error: error.message})
            }
            
            //Generar token
            const token = new Token()
            token.token = generateToken()
            token.user = userExist._id

            //Enviar Email
            AuthEmail.sendConfirmationEmail({
                email: userExist.email,
                name: userExist.name,
                token: token.token
            })

            await Promise.allSettled([token.save(), userExist.save()])
            res.send('Se envió un nuevo token')
        } catch (error) {
            res.status(500).json({error: 'Hubo un Error'})
        }
    }

    static forgotPassword = async (req: Request, res: Response) =>{
        try {

            const {email} = req.body

            //Usuario existe
            const userExist = await User.findOne({email})
            if(!userExist){
                const error = new Error('El usuario no está registrado')
                return res.status(404).json({error: error.message})
            }

            //Generar token
            const token = new Token()
            token.token = generateToken()
            token.user = userExist._id
            await token.save()

            //Enviar Email
            AuthEmail.sendForgotPasswordEmail({
                email: userExist.email,
                name: userExist.name,
                token: token.token
            })

            res.send('Revisa tu email para recuperar tu contraseña')
        } catch (error) {
            res.status(500).json({error: 'Hubo un Error'})
        }
    }

    static validateToken = async (req: Request, res: Response) =>{
        try {
            const {token} = req.body
            const tokenExist = await Token.findOne({token})

            if(!tokenExist){
                const error = new Error('Token no valido')
                return res.status(401).json({error: error.message})
            }
            res.send('Token válido, define tu nueva contraseña')
        } catch (error) {
            res.status(500).json({error: 'Hubo un Error'})
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) =>{
        try {
            const {token} = req.params
            const {password} = req.body
            const tokenExist = await Token.findOne({token})

            if(!tokenExist){
                const error = new Error('Token no valido')
                return res.status(401).json({error: error.message})
            }

            const user = await User.findById(tokenExist.user)
            user.password = await hashPassword(password)

            await Promise.allSettled([user.save(), tokenExist.deleteOne()])
            res.send('El password se modificó correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un Error'})
        }
    }

    static user = async (req: Request, res: Response) =>{
        return res.json(req.user)
    }

    static updateProfile = async (req: Request, res: Response) =>{
        const {name, email} = req.body
        const userExist = await User.findOne({email})
        if(userExist && userExist._id.toString() !== req.user._id.toString()){
            const error = new Error('El email ya está en uso')
            return res.status(409).json({error: error.message})
        }
        req.user.name = name
        req.user.email = email
        try {
            await req.user.save()
            res.send('Usuario actualizado correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un Error'})
        }
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) =>{
        const {current_password, password} = req.body
        const user = await User.findById(req.user._id)
        const isPasswordCorrect = await checkPassword(current_password, user.password)
        if(!isPasswordCorrect){
            const error = new Error('La contraseña actual es incorrecta')
            return res.status(401).json({error: error.message})
        }
        try {
            user.password = await hashPassword(password)
            await user.save()
            res.send('La contraseña se modificó correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un Error'})
        }
    }

    static checkPassword = async (req: Request, res: Response) =>{
        const {password} = req.body
        const user = await User.findById(req.user._id)
        const isPasswordCorrect = await checkPassword(password, user.password)
        if(!isPasswordCorrect){
            const error = new Error('La contraseña actual es incorrecta')
            return res.status(401).json({error: error.message})
        }
        res.send('La contraseña es correcta')
    }
}
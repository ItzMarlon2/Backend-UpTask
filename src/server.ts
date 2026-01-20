import express from 'express'
import dotenv from 'dotenv'
import projectRoutes from './routes/projectRoutes'
import { connectDb } from './config/db'
import cors from 'cors'
import { corsConfig } from './config/cors'
import morgan from 'morgan'
import authRoutes from './routes/authRoutes'

dotenv.config()
connectDb()

const server = express()
server.use(cors(corsConfig))

//logging
server.use(morgan('dev'))

//Leer datos del body
server.use(express.json())

//Routes
server.use('/api/projects', projectRoutes)
server.use('/api/auth', authRoutes)

export default server
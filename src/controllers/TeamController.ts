import { Request, Response } from "express";
import User from "../models/User";
import Project from "../models/Project";

export class TeamController{
    static findMemberByEmail = async (req: Request, res: Response) =>{
        const {email} = req.body
        const user = await User.findOne({email}).select('id email name')
        if(!user){
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({error: error.message})
        }

        res.json(user)

    }

    static getProjectTeam = async (req: Request, res: Response) =>{
        const {team} = await Project.findById(req.project._id).populate({
            path: 'team',
            select: 'id email name'
        })
        res.json(team)
    }

    static addUserById = async (req: Request, res: Response) =>{
        const {id} = req.body
        const user = await User.findById(id).select('id')
        if(!user){
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({error: error.message})
        }

        if(req.project.team.some(teamMember => teamMember.toString() === user._id.toString())){
            const error = new Error('Usuario ya agregado')
            return res.status(409).json({error: error.message})
        }

        req.project.team.push(user._id)
        await req.project.save()
        res.send('Usuario agregado correctamente')
    }

    static deleteUserById = async (req: Request, res: Response) =>{
        const {userId} = req.params

        if(!req.project.team.some(teamMember => teamMember.toString() === userId)){
            const error = new Error('Usuario no encontrado')
            return res.status(404).json({error: error.message})
        }

        req.project.team = req.project.team.filter(teamMember => teamMember.toString() !== userId)

        await req.project.save()
        res.send('Usuario eliminado correctamente')
    }
}
import { Request, Response } from "express";
import Project from "../models/Project";

export class ProjectController{

    static createProject = async (req: Request, res: Response) =>{
        const project = new Project(req.body)

        //Asignar Manager
        project.manager = req.user._id
        try {
            await project.save()
            res.send('Proyecto creado correctamente')
        } catch (error) {
            console.log(error);
            
        }
    }

    static getAllProjects = async (req: Request, res: Response) =>{
        try {
            const projects = await Project.find({
                $or:[
                    {manager: {$in: req.user._id}},
                    {team: {$in: [req.user._id]}}
                ]
            })
            res.json(projects)
        } catch (error) {
            console.log(error);
            
        }
    }

    static getProjectById = async (req: Request, res: Response) =>{
        const {id} = req.params

        try {
            const project = await Project.findById(id).populate('tasks')
            if(!project){
                const error = new Error('Proyecto no encontrado')
                return res.status(404).json({error: error.message})
            }
            if(project.manager.toString() !== req.user._id.toString() && 
            !project.team.includes(req.user._id)){
                const error = new Error('Accion no valida')
                return res.status(404).json({error: error.message})
            }
            res.json(project)
        } catch (error) {
            console.log(error);
            
        }
    }

    static updateProject = async (req: Request, res: Response) =>{

        try {
            req.project.projectName = req.body.projectName
            req.project.clientName = req.body.clientName
            req.project.description = req.body.description
            await req.project.save()
            res.json('Proyecto actualizado')
        } catch (error) {
            console.log(error);
            
        }
    }

    static deleteProject = async (req: Request, res: Response) =>{

        try {
            await req.project.deleteOne()
            res.json('Proyecto eliminado')
        } catch (error) {
            console.log(error);
            
        }
    }
    
}
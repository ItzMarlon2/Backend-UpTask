import { Request, Response } from "express";
import Project from "../models/Project";
import Task from "../models/Task";

export class TaskController{
    static createTask = async (req: Request, res: Response) =>{
        
        try {
            const task = new Task(req.body)
            task.project = req.project._id
            req.project.tasks.push(task._id)
            await Promise.allSettled([task.save(), req.project.save()])
            res.send('Tarea creada correctamente')
        } catch (error) {
            console.log(error);
            
        }
    }

    static getTasksByProject = async (req: Request, res: Response) =>{
        try {
            const tasks = await Task.find({project: req.project._id}).populate('project')
            res.json(tasks)
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})

            
        }
    }

    static getTaskById = async (req: Request, res: Response) =>{
        try {
            const task = await Task.findById(req.task._id)
                                    .populate({path: 'completedBy.user', select: 'id name email'})
                                    .populate({path: 'notes', populate: {path: 'createdBy', select: 'id name email'}})

            res.json(task)
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updateTask = async (req: Request, res: Response) =>{
        try {
            
            req.task.name = req.body.name
            req.task.description = req.body.description

            await req.task.save()
            res.send('Tarea actualizada Correctamente')
        } catch (error) {
            console.log(error.message);

            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static deleteTask = async (req: Request, res: Response) =>{
        try {

            req.project.tasks = req.project.tasks.filter(task => task.toString() !== req.task._id.toString())

            await Promise.allSettled([req.task.deleteOne(), req.project.save()])
            res.send('Tarea eliminada correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updateTaskStatus = async (req: Request, res: Response) =>{
        try {
            req.task.status = req.body.status
            const data = {
                user: req.user._id,
                status: req.body.status
            }
            req.task.completedBy.push(data)
            await req.task.save()
            res.send('Estado de la tarea actualizado correctamente')
        } catch (error) {
            
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}
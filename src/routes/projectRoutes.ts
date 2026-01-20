import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { validateProject } from "../middleware/project";
import { hasAuthorization, taskBelongsToProject, validateTask } from "../middleware/tasks";
import { authenticate } from "../middleware/auth";
import { TeamController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

const router = Router()

router.use(authenticate)

router.post('/', 
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto no puede ir vacio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente no puede ir vacio'),
    body('description')
        .notEmpty().withMessage('La descripcion del proyecto no puede ir vacío'),
    handleInputErrors,
    ProjectController.createProject
)

router.get('/', ProjectController.getAllProjects)
router.get('/:id', 
    param('id')
        .isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    ProjectController.getProjectById
)

router.param('projectId', validateProject)
router.put('/:projectId', 
    param('projectId')
        .isMongoId().withMessage('Id no valido'),
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto no puede ir vacio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente no puede ir vacio'),
    body('description')
        .notEmpty().withMessage('La descripcion del proyecto no puede ir vacío'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.updateProject
)

router.delete('/:projectId', 
    param('projectId')
        .isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.deleteProject
)

// Routes for tasks

router.post('/:projectId/tasks', 
    hasAuthorization,
    body('name')
        .notEmpty().withMessage('El nombre de la tarea no puede ir vacio'),
    body('description')
        .notEmpty().withMessage('La descripcion de la tarea no puede ir vacío'),
    handleInputErrors,
    TaskController.createTask
)

router.get('/:projectId/tasks', 
    TaskController.getTasksByProject
)

router.get('/:projectId/tasks/:taskId', 
    param('taskId')
        .isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    TaskController.getTaskById
)

router.param('taskId', validateTask)
router.param('taskId', taskBelongsToProject)

router.put('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId')
        .isMongoId().withMessage('Id no valido'),
    body('name')
        .notEmpty().withMessage('El nombre de la tarea no puede ir vacio'),
    body('description')
        .notEmpty().withMessage('La descripcion de la tarea no puede ir vacío'),
    handleInputErrors,
    TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('taskId')
        .isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    TaskController.deleteTask
)

router.post('/:projectId/tasks/:taskId/status', 
    param('taskId')
        .isMongoId().withMessage('Id no valido'),
    body('status')
        .notEmpty().withMessage('El estado de la tarea no puede ir vacio'),
    handleInputErrors,
    TaskController.updateTaskStatus
)

// Routes for teams
router.post('/:projectId/team/find',
    body('email')
        .notEmpty().isEmail().toLowerCase().withMessage('Email no valido'),
    handleInputErrors,
    TeamController.findMemberByEmail
)

router.get('/:projectId/team',
    TeamController.getProjectTeam
)

router.post('/:projectId/team',
    body('id')
        .isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    TeamController.addUserById
)

router.delete('/:projectId/team/:userId',
    param('userId')
        .isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    TeamController.deleteUserById
)

// Routes for Notes
router.post('/:projectId/tasks/:taskId/notes',
    body('content')
        .notEmpty().withMessage('El contenido de la nota no puede ir vacio'),
    handleInputErrors,
    NoteController.createNote
)

router.get('/:projectId/tasks/:taskId/notes',
    handleInputErrors,
    NoteController.getTaskNotes
)

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId')
        .isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    NoteController.deleteNote
)

export default router
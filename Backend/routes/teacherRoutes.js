import express from 'express';
import teacherController from '../controllers/teacherController.js';

const teacherRoutes = express.Router();

// Define routes for all services used in the controller
teacherRoutes.get("", teacherController.getAllTeachers);

//Requires just the id as path parameter
teacherRoutes.get("/:id", teacherController.getTeacherById);

//Requires just the name as request body
teacherRoutes.post("", teacherController.createTeacher);

//Requires the id as path parameter and the name as request body
teacherRoutes.put("/update/:id", teacherController.updateTeacher);

//Requires just the id as path parameter
teacherRoutes.delete("/delete/:id", teacherController.deleteTeacher);

export default teacherRoutes;
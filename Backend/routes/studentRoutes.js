import express from 'express'
import studentController from '../controllers/studentController.js';
import { authenticateToken } from '../middleware/auth.js';

const studentRoutes = express.Router();

// Routes d'authentification (publiques)
studentRoutes.post("/register", studentController.registerStudent);
studentRoutes.post("/login", studentController.loginStudent);
studentRoutes.post("/login/card", studentController.loginWithCard);
studentRoutes.get("/verify-email", studentController.verifyEmail);

// Routes protégées (nécessitent authentification)
studentRoutes.put("/change-class", authenticateToken, studentController.changeClassForNextYear);

// Routes administratives (peuvent nécessiter authentification selon vos besoins)
studentRoutes.get("", studentController.getAllStudents);
studentRoutes.post("", studentController.createStudent); // Alias pour register

//Requires a path parameter 'matricule' to identify the student and a body
studentRoutes.post("/:matricule", studentController.findStudentByMatricule);

//Requires a path parameter 'matricule' to identify the student and a body
studentRoutes.put("/update/:matricule", studentController.updateStudent);

//Requires only a path parameter 'matricule' to identify the student
studentRoutes.delete("/delete/:matricule", studentController.deleteStudent);

export default studentRoutes;
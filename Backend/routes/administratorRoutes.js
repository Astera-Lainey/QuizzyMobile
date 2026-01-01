import express from 'express';
import administratorController from '../controllers/administratorController.js';

const administratorRoutes = express.Router();

// Define routes for all services used in the controller
administratorRoutes.post("", administratorController.createAdmin);
administratorRoutes.put("/update/:adminId", administratorController.updateAdmin);

export default administratorRoutes;
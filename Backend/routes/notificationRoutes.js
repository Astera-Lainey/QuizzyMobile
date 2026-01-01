import express from 'express';
import notificationController from '../controllers/notificationController.js';

const notificationRoutes = express.Router();

// Define routes for all services used in the controller
notificationRoutes.get("", notificationController.getAllNotifications);

notificationRoutes.post("", notificationController.createNotification);
// notificationRoutes.get("/:id", notificationController.getNotificationById);
// notificationRoutes.put("/update/:id", notificationController.updateNotification);
// notificationRoutes.delete("/delete/:id", notificationController.deleteNotification);

export default notificationRoutes;
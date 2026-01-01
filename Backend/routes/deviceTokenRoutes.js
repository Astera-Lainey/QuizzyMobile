import express from 'express';
import deviceTokenController from '../controllers/deviceTokenController.js';
import { authenticateToken } from '../middleware/auth.js';

const deviceTokenRoutes = express.Router();

// Toutes les routes nécessitent une authentification
deviceTokenRoutes.post('/register', authenticateToken, deviceTokenController.registerToken);
deviceTokenRoutes.post('/unregister', authenticateToken, deviceTokenController.unregisterToken);
deviceTokenRoutes.get('/my-tokens', authenticateToken, deviceTokenController.getMyTokens);
deviceTokenRoutes.put('/update-last-used', authenticateToken, deviceTokenController.updateTokenLastUsed);

export default deviceTokenRoutes;


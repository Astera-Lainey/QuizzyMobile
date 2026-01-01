import jwt from 'jsonwebtoken';
import Student from '../models/student.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware pour vérifier le token JWT
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Vérifier que l'étudiant existe toujours
        const student = await Student.findByPk(decoded.matricule);
        if (!student) {
            return res.status(401).json({ error: 'Student not found' });
        }

        // Ajouter les informations de l'étudiant à la requête
        req.student = student;
        req.matricule = decoded.matricule;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ error: 'Token expired' });
        }
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Authentication error' });
    }
};

// Middleware pour vérifier que l'email est vérifié
export const requireEmailVerification = (req, res, next) => {
    if (!req.student.emailVerified) {
        return res.status(403).json({ error: 'Email verification required' });
    }
    next();
};

export { JWT_SECRET };


import { registerDeviceToken, unregisterDeviceToken, getStudentDeviceTokens } from '../services/pushNotificationService.js';
import DeviceToken from '../models/deviceToken.js';
import { authenticateToken } from '../middleware/auth.js';

/**
 * Enregistrer ou mettre à jour un token d'appareil pour l'étudiant connecté
 */
async function registerToken(req, res) {
    try {
        const { matricule } = req.student; // Depuis le middleware d'authentification
        const { token, deviceType, deviceId } = req.body;

        if (!token || !deviceType) {
            return res.status(400).json({ 
                error: 'Token et type d\'appareil sont requis' 
            });
        }

        if (!['ios', 'android', 'web'].includes(deviceType)) {
            return res.status(400).json({ 
                error: 'Type d\'appareil invalide. Doit être: ios, android, ou web' 
            });
        }

        const deviceToken = await registerDeviceToken(matricule, token, deviceType, deviceId);

        res.status(200).json({
            message: 'Token enregistré avec succès',
            deviceToken: {
                deviceTokenId: deviceToken.deviceTokenId,
                deviceType: deviceToken.deviceType,
                isActive: deviceToken.isActive
            }
        });
    } catch (error) {
        console.error('Error registering device token:', error);
        res.status(500).json({ error: 'Erreur lors de l\'enregistrement du token' });
    }
}

/**
 * Désactiver un token d'appareil
 */
async function unregisterToken(req, res) {
    try {
        const { matricule } = req.student;
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token requis' });
        }

        // Vérifier que le token appartient à l'étudiant
        const deviceToken = await DeviceToken.findOne({
            where: { token, matricule }
        });

        if (!deviceToken) {
            return res.status(404).json({ error: 'Token non trouvé' });
        }

        await unregisterDeviceToken(token);

        res.status(200).json({ message: 'Token désactivé avec succès' });
    } catch (error) {
        console.error('Error unregistering device token:', error);
        res.status(500).json({ error: 'Erreur lors de la désactivation du token' });
    }
}

/**
 * Obtenir tous les tokens actifs de l'étudiant connecté
 */
async function getMyTokens(req, res) {
    try {
        const { matricule } = req.student;

        const tokens = await DeviceToken.findAll({
            where: {
                matricule,
                isActive: true
            },
            attributes: ['deviceTokenId', 'deviceType', 'deviceId', 'lastUsedAt', 'createdAt']
        });

        res.status(200).json({ tokens });
    } catch (error) {
        console.error('Error getting device tokens:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des tokens' });
    }
}

/**
 * Mettre à jour le timestamp lastUsedAt d'un token
 */
async function updateTokenLastUsed(req, res) {
    try {
        const { matricule } = req.student;
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token requis' });
        }

        const deviceToken = await DeviceToken.findOne({
            where: { token, matricule }
        });

        if (!deviceToken) {
            return res.status(404).json({ error: 'Token non trouvé' });
        }

        deviceToken.lastUsedAt = new Date();
        await deviceToken.save();

        res.status(200).json({ message: 'Timestamp mis à jour' });
    } catch (error) {
        console.error('Error updating token last used:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
}

export default {
    registerToken,
    unregisterToken,
    getMyTokens,
    updateTokenLastUsed
};


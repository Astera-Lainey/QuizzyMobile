import admin from 'firebase-admin';
import DeviceToken from '../models/deviceToken.js';
import Student from '../models/student.js';
import Course from '../models/course.js';
import Evaluation from '../models/evaluation.js';
import Class from '../models/class.js';
import { Op } from 'sequelize';

// Initialiser Firebase Admin SDK
let firebaseInitialized = false;

export const initializeFirebase = () => {
    if (firebaseInitialized) {
        return;
    }

    try {
        // Option 1: Utiliser un fichier de service account JSON
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } 
        // Option 2: Utiliser un chemin vers le fichier JSON (nécessite import dynamique)
        else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
            // Pour ES modules, vous devrez utiliser createRequire ou importer le fichier directement
            // Pour l'instant, on suggère d'utiliser les autres options
            console.warn('FIREBASE_SERVICE_ACCOUNT_PATH requires dynamic import. Please use FIREBASE_SERVICE_ACCOUNT_KEY or individual env variables instead.');
        }
        // Option 3: Utiliser les variables d'environnement individuelles
        else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                })
            });
        }
        else {
            console.warn('Firebase Admin SDK not initialized. Push notifications will not work.');
            console.warn('Please configure FIREBASE_SERVICE_ACCOUNT_KEY, FIREBASE_SERVICE_ACCOUNT_PATH, or individual Firebase env variables.');
            return;
        }

        firebaseInitialized = true;
        console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
        console.error('Error initializing Firebase Admin SDK:', error);
    }
};

// Initialiser au chargement du module
initializeFirebase();

/**
 * Enregistrer ou mettre à jour un token d'appareil
 */
export const registerDeviceToken = async (matricule, token, deviceType, deviceId = null) => {
    try {
        if (!token || !deviceType) {
            throw new Error('Token and device type are required');
        }

        // Vérifier si le token existe déjà
        const existingToken = await DeviceToken.findOne({
            where: { token },
            paranoid: false
        });

        if (existingToken) {
            // Mettre à jour le token existant
            existingToken.matricule = matricule;
            existingToken.deviceType = deviceType;
            existingToken.deviceId = deviceId || existingToken.deviceId;
            existingToken.isActive = true;
            existingToken.lastUsedAt = new Date();
            if (existingToken.deletedAt) {
                await existingToken.restore();
            }
            await existingToken.save();
            return existingToken;
        } else {
            // Créer un nouveau token
            const deviceToken = await DeviceToken.create({
                matricule,
                token,
                deviceType,
                deviceId,
                isActive: true,
                lastUsedAt: new Date()
            });
            return deviceToken;
        }
    } catch (error) {
        console.error('Error registering device token:', error);
        throw error;
    }
};

/**
 * Désactiver un token d'appareil
 */
export const unregisterDeviceToken = async (token) => {
    try {
        const deviceToken = await DeviceToken.findOne({ where: { token } });
        if (deviceToken) {
            deviceToken.isActive = false;
            await deviceToken.save();
        }
    } catch (error) {
        console.error('Error unregistering device token:', error);
        throw error;
    }
};

/**
 * Obtenir tous les tokens actifs d'un étudiant
 */
export const getStudentDeviceTokens = async (matricule) => {
    try {
        const tokens = await DeviceToken.findAll({
            where: {
                matricule,
                isActive: true
            }
        });
        return tokens.map(t => t.token);
    } catch (error) {
        console.error('Error getting student device tokens:', error);
        return [];
    }
};

/**
 * Obtenir les étudiants concernés par une évaluation (basé sur le cours)
 * Inclut les étudiants directement inscrits au cours ET ceux des classes associées au cours
 */
export const getStudentsForEvaluation = async (evaluationId) => {
    try {
        const evaluation = await Evaluation.findByPk(evaluationId, {
            include: [{
                model: Course,
                attributes: ['courseCode', 'courseName'],
                include: [
                    {
                        model: Student,
                        attributes: ['matricule', 'firstName', 'lastName', 'email'],
                        through: {
                            attributes: []
                        }
                    },
                    {
                        model: Class,
                        attributes: ['classId', 'level', 'department'],
                        through: {
                            attributes: []
                        },
                        include: [{
                            model: Student,
                            attributes: ['matricule', 'firstName', 'lastName', 'email']
                        }]
                    }
                ]
            }]
        });

        if (!evaluation || !evaluation.Course) {
            return [];
        }

        const studentsSet = new Map();

        // Ajouter les étudiants directement inscrits au cours
        if (evaluation.Course.Students) {
            evaluation.Course.Students.forEach(student => {
                studentsSet.set(student.matricule, student);
            });
        }

        // Ajouter les étudiants des classes associées au cours
        if (evaluation.Course.Classes) {
            evaluation.Course.Classes.forEach(classItem => {
                if (classItem.Students) {
                    classItem.Students.forEach(student => {
                        studentsSet.set(student.matricule, student);
                    });
                }
            });
        }

        // Retourner un tableau unique d'étudiants
        return Array.from(studentsSet.values());
    } catch (error) {
        console.error('Error getting students for evaluation:', error);
        return [];
    }
};

/**
 * Envoyer une notification push à un étudiant
 */
export const sendPushNotification = async (matricule, title, body, data = {}) => {
    try {
        if (!firebaseInitialized) {
            console.warn('Firebase not initialized. Cannot send push notification.');
            return { success: false, error: 'Firebase not initialized' };
        }

        const tokens = await getStudentDeviceTokens(matricule);
        
        if (tokens.length === 0) {
            return { success: false, error: 'No device tokens found for student' };
        }

        const message = {
            notification: {
                title,
                body,
            },
            data: {
                ...data,
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
            },
            tokens: tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        // Gérer les tokens invalides
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]);
                }
            });

            // Désactiver les tokens invalides
            for (const token of failedTokens) {
                await unregisterDeviceToken(token);
            }
        }

        return {
            success: response.successCount > 0,
            successCount: response.successCount,
            failureCount: response.failureCount,
        };
    } catch (error) {
        console.error('Error sending push notification:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Envoyer une notification push à plusieurs étudiants
 */
export const sendBulkPushNotifications = async (matricules, title, body, data = {}) => {
    try {
        if (!firebaseInitialized) {
            console.warn('Firebase not initialized. Cannot send push notifications.');
            return { success: false, error: 'Firebase not initialized' };
        }

        // Collecter tous les tokens
        const allTokens = [];
        const tokenToMatricule = new Map();

        for (const matricule of matricules) {
            const tokens = await getStudentDeviceTokens(matricule);
            tokens.forEach(token => {
                allTokens.push(token);
                tokenToMatricule.set(token, matricule);
            });
        }

        if (allTokens.length === 0) {
            return { success: false, error: 'No device tokens found' };
        }

        // Diviser en lots de 500 (limite FCM)
        const batchSize = 500;
        let totalSuccess = 0;
        let totalFailure = 0;

        for (let i = 0; i < allTokens.length; i += batchSize) {
            const batch = allTokens.slice(i, i + batchSize);
            
            const message = {
                notification: {
                    title,
                    body,
                },
                data: {
                    ...data,
                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                },
                tokens: batch,
            };

            const response = await admin.messaging().sendEachForMulticast(message);

            totalSuccess += response.successCount;
            totalFailure += response.failureCount;

            // Gérer les tokens invalides
            if (response.failureCount > 0) {
                const failedTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        failedTokens.push(batch[idx]);
                    }
                });

                // Désactiver les tokens invalides
                for (const token of failedTokens) {
                    await unregisterDeviceToken(token);
                }
            }
        }

        return {
            success: totalSuccess > 0,
            successCount: totalSuccess,
            failureCount: totalFailure,
        };
    } catch (error) {
        console.error('Error sending bulk push notifications:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Envoyer une notification lors de la publication d'une évaluation
 */
export const notifyEvaluationPublished = async (evaluationId) => {
    try {
        const evaluation = await Evaluation.findByPk(evaluationId, {
            include: [{
                model: Course,
                attributes: ['courseCode', 'courseName']
            }]
        });

        if (!evaluation || !evaluation.Course) {
            console.error('Evaluation or Course not found');
            return { success: false, error: 'Evaluation or Course not found' };
        }

        // Obtenir les étudiants concernés
        const students = await getStudentsForEvaluation(evaluationId);
        
        if (students.length === 0) {
            console.warn(`No students found for evaluation ${evaluationId}`);
            return { success: false, error: 'No students found' };
        }

        const matricules = students.map(s => s.matricule);

        // Déterminer le type d'évaluation en français
        const evaluationTypeMap = {
            'Mid Term': 'Mi-parcours',
            'CC': 'Contrôle Continu',
            'Final Exam': 'Examen Final',
            'TP': 'Travaux Pratiques',
            'Resit': 'Rattrapage',
            'TD': 'Travaux Dirigés',
            'Other': 'Autre'
        };

        const evaluationType = evaluationTypeMap[evaluation.type] || evaluation.type;
        const courseName = evaluation.Course.courseName;

        const title = `Nouveau Quiz disponible - ${courseName}`;
        const body = `Une évaluation ${evaluationType} pour le cours ${courseName} est maintenant disponible.`;

        const data = {
            type: 'evaluation_published',
            evaluationId: evaluationId.toString(),
            courseCode: evaluation.Course.courseCode,
            courseName: courseName,
            evaluationType: evaluation.type,
        };

        return await sendBulkPushNotifications(matricules, title, body, data);
    } catch (error) {
        console.error('Error notifying evaluation published:', error);
        return { success: false, error: error.message };
    }
};


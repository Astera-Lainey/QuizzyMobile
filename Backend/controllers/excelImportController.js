import multer from 'multer';
import path from 'path';
import fs from 'fs';
import XLSX from 'xlsx';
import { parseExcelFile, validateQuestions } from '../services/excelImportService.js';
import questionService from './questionService.js';
import choiceService from './choiceService.js';
import Course from '../models/course.js';

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads');
        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Générer un nom de fichier unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'questions-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtrer les fichiers (seulement Excel)
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'application/vnd.oasis.opendocument.spreadsheet' // .ods
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format de fichier non supporté. Veuillez uploader un fichier Excel (.xlsx, .xls, .ods)'), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    }
});

/**
 * Importer des questions depuis un fichier Excel
 */
async function importQuestionsFromExcel(req, res) {
    let filePath = null;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier fourni' });
        }

        filePath = req.file.path;
        const { courseCode } = req.body;

        // Vérifier que le cours existe si fourni
        if (courseCode) {
            const course = await Course.findByPk(courseCode);
            if (!course) {
                // Nettoyer le fichier
                fs.unlinkSync(filePath);
                return res.status(404).json({ error: `Cours avec le code "${courseCode}" non trouvé` });
            }
        }

        // Parser le fichier Excel
        const { questions, errors: parseErrors } = parseExcelFile(filePath);

        if (parseErrors && parseErrors.length > 0) {
            // Nettoyer le fichier
            fs.unlinkSync(filePath);
            return res.status(400).json({
                error: 'Erreurs lors du parsing du fichier',
                details: parseErrors
            });
        }

        // Valider les questions
        const validation = validateQuestions(questions);
        if (!validation.valid) {
            // Nettoyer le fichier
            fs.unlinkSync(filePath);
            return res.status(400).json({
                error: 'Erreurs de validation',
                errors: validation.errors,
                warnings: validation.warnings
            });
        }

        // Créer les questions et choix dans la base de données
        const results = {
            success: [],
            errors: [],
            warnings: validation.warnings || []
        };

        for (const questionData of questions) {
            try {
                // Créer la question
                const question = await questionService.createQuestion(
                    questionData.text,
                    questionData.type,
                    questionData.order
                );

                // Créer les choix si nécessaire
                if ((questionData.type === 'MCQ' || questionData.type === 'CLOSE') && questionData.choices) {
                    for (const choiceData of questionData.choices) {
                        try {
                            await choiceService.createChoice(
                                choiceData.text,
                                choiceData.order,
                                choiceData.isCorrect,
                                question.questionId
                            );
                        } catch (error) {
                            results.errors.push(`Erreur lors de la création du choix pour la question "${questionData.text}": ${error.message}`);
                        }
                    }
                }

                results.success.push({
                    questionId: question.questionId,
                    text: question.text,
                    type: question.type,
                    order: question.order
                });
            } catch (error) {
                results.errors.push(`Erreur lors de la création de la question "${questionData.text}": ${error.message}`);
            }
        }

        // Nettoyer le fichier après traitement
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Retourner les résultats
        if (results.errors.length > 0 && results.success.length === 0) {
            return res.status(500).json({
                error: 'Aucune question n\'a pu être importée',
                details: results.errors,
                warnings: results.warnings
            });
        }

        const statusCode = results.errors.length > 0 ? 207 : 201; // 207 = Multi-Status (partiellement réussi)

        res.status(statusCode).json({
            message: `${results.success.length} question(s) importée(s) avec succès`,
            imported: results.success.length,
            failed: results.errors.length,
            success: results.success,
            errors: results.errors.length > 0 ? results.errors : undefined,
            warnings: results.warnings.length > 0 ? results.warnings : undefined
        });

    } catch (error) {
        // Nettoyer le fichier en cas d'erreur
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }

        console.error('Error importing questions from Excel:', error);
        res.status(500).json({
            error: 'Erreur lors de l\'importation',
            message: error.message
        });
    }
}

/**
 * Télécharger un template Excel pour l'import
 */
async function downloadTemplate(req, res) {
    try {
        // Créer un workbook
        const workbook = XLSX.utils.book_new();

        // Créer les données d'exemple
        const exampleData = [
            {
                'Question Text': 'Quelle est la capitale du Cameroun?',
                'Type': 'MCQ',
                'Order': 1,
                'Choice 1': 'Yaoundé',
                'Choice 1 Correct': 'X',
                'Choice 2': 'Douala',
                'Choice 2 Correct': '',
                'Choice 3': 'Bafoussam',
                'Choice 3 Correct': '',
                'Choice 4': 'Garoua',
                'Choice 4 Correct': '',
                'Points': 5
            },
            {
                'Question Text': 'Expliquez brièvement le concept de programmation orientée objet.',
                'Type': 'Open',
                'Order': 2,
                'Choice 1': '',
                'Choice 1 Correct': '',
                'Choice 2': '',
                'Choice 2 Correct': '',
                'Points': 10
            },
            {
                'Question Text': 'Le JavaScript est un langage compilé.',
                'Type': 'Close',
                'Order': 3,
                'Choice 1': 'Vrai',
                'Choice 1 Correct': '',
                'Choice 2': 'Faux',
                'Choice 2 Correct': 'X',
                'Points': 3
            }
        ];

        // Créer une feuille de calcul
        const worksheet = XLSX.utils.json_to_sheet(exampleData);

        // Ajouter la feuille au workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');

        // Générer le buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Envoyer le fichier
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=template-questions.xlsx');
        res.send(buffer);

    } catch (error) {
        console.error('Error generating template:', error);
        res.status(500).json({ error: 'Erreur lors de la génération du template' });
    }
}

export default {
    importQuestionsFromExcel,
    downloadTemplate,
    upload
};


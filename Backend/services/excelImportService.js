import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parser un fichier Excel et extraire les questions
 * Format attendu :
 * - Ligne 1 : En-têtes
 * - Colonnes : Question Text | Type | Order | Choice 1 | Choice 1 Correct | Choice 2 | Choice 2 Correct | ... | Points
 * 
 * Ou format alternatif avec une ligne par choix :
 * - Question Text | Type | Order | Choice Text | Is Correct | Points
 */
export const parseExcelFile = (filePath) => {
    try {
        // Lire le fichier Excel
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Prendre la première feuille
        const worksheet = workbook.Sheets[sheetName];
        
        // Convertir en JSON
        const data = XLSX.utils.sheet_to_json(worksheet, { 
            defval: null, // Valeurs par défaut null pour les cellules vides
            raw: false // Convertir les nombres en strings
        });

        if (!data || data.length === 0) {
            throw new Error('Le fichier Excel est vide');
        }

        // Détecter le format du fichier
        const firstRow = data[0];
        const headers = Object.keys(firstRow);

        // Format 1: Une ligne par question avec choix multiples dans des colonnes
        if (headers.some(h => h.toLowerCase().includes('choice') && h.toLowerCase().includes('1'))) {
            return parseFormat1(data);
        }
        // Format 2: Une ligne par choix (plusieurs lignes pour une même question)
        else if (headers.some(h => h.toLowerCase().includes('choice text') || h.toLowerCase().includes('choix'))) {
            return parseFormat2(data);
        }
        // Format 3: Format simple avec colonnes fixes
        else {
            return parseFormat3(data, headers);
        }
    } catch (error) {
        console.error('Error parsing Excel file:', error);
        throw new Error(`Erreur lors de la lecture du fichier Excel: ${error.message}`);
    }
};

/**
 * Format 1: Une ligne par question, choix dans des colonnes multiples
 * Colonnes: Question Text | Type | Order | Choice 1 | Choice 1 Correct | Choice 2 | Choice 2 Correct | ...
 */
function parseFormat1(data) {
    const questions = [];
    const errors = [];

    data.forEach((row, index) => {
        try {
            const rowNum = index + 2; // +2 car index commence à 0 et on compte l'en-tête

            // Extraire les colonnes de base
            const questionText = getValue(row, ['Question Text', 'Question', 'Texte', 'question', 'texte']);
            const type = getValue(row, ['Type', 'type', 'TYPE']);
            const order = getValue(row, ['Order', 'order', 'Ordre', 'ordre', 'Order Number']);
            const points = getValue(row, ['Points', 'points', 'Point', 'point']);

            if (!questionText) {
                errors.push(`Ligne ${rowNum}: Le texte de la question est requis`);
                return;
            }

            if (!type || !['MCQ', 'Open', 'Close'].includes(type.toUpperCase())) {
                errors.push(`Ligne ${rowNum}: Le type doit être MCQ, Open ou Close`);
                return;
            }

            const questionType = type.toUpperCase();
            const questionOrder = parseInt(order) || index + 1;

            const question = {
                text: String(questionText).trim(),
                type: questionType,
                order: questionOrder,
                points: points ? parseFloat(points) : null,
                choices: []
            };

            // Extraire les choix (format: Choice 1, Choice 1 Correct, Choice 2, Choice 2 Correct, ...)
            if (questionType === 'MCQ' || questionType === 'CLOSE') {
                let choiceIndex = 1;
                while (true) {
                    const choiceTextKey = `Choice ${choiceIndex}`;
                    const choiceCorrectKey = `Choice ${choiceIndex} Correct`;
                    
                    // Essayer aussi les variantes
                    const choiceText = getValue(row, [
                        choiceTextKey,
                        `Choix ${choiceIndex}`,
                        `Option ${choiceIndex}`,
                        `Réponse ${choiceIndex}`
                    ]);

                    if (!choiceText) {
                        break; // Plus de choix
                    }

                    const isCorrect = getValue(row, [
                        choiceCorrectKey,
                        `Choice ${choiceIndex} Correct`,
                        `Choix ${choiceIndex} Correct`,
                        `Option ${choiceIndex} Correct`,
                        `Réponse ${choiceIndex} Correct`
                    ]);

                    // Convertir isCorrect en boolean
                    let correct = false;
                    if (isCorrect !== null && isCorrect !== undefined) {
                        const correctStr = String(isCorrect).toLowerCase().trim();
                        correct = correctStr === 'true' || correctStr === '1' || correctStr === 'oui' || correctStr === 'yes' || correctStr === 'vrai' || correctStr === 'x';
                    }

                    question.choices.push({
                        text: String(choiceText).trim(),
                        isCorrect: correct,
                        order: choiceIndex
                    });

                    choiceIndex++;
                }

                if (question.choices.length < 2) {
                    errors.push(`Ligne ${rowNum}: Les questions MCQ/Close doivent avoir au moins 2 choix`);
                    return;
                }

                // Vérifier qu'au moins un choix est correct
                const hasCorrect = question.choices.some(c => c.isCorrect);
                if (!hasCorrect) {
                    errors.push(`Ligne ${rowNum}: Au moins un choix doit être marqué comme correct`);
                    return;
                }
            }

            questions.push(question);
        } catch (error) {
            errors.push(`Ligne ${index + 2}: ${error.message}`);
        }
    });

    return { questions, errors };
}

/**
 * Format 2: Une ligne par choix (plusieurs lignes pour une même question)
 * Colonnes: Question Text | Type | Order | Choice Text | Is Correct | Points
 */
function parseFormat2(data) {
    const questionsMap = new Map();
    const errors = [];

    data.forEach((row, index) => {
        try {
            const rowNum = index + 2;

            const questionText = getValue(row, ['Question Text', 'Question', 'Texte', 'question', 'texte']);
            const type = getValue(row, ['Type', 'type', 'TYPE']);
            const order = getValue(row, ['Order', 'order', 'Ordre', 'ordre']);
            const choiceText = getValue(row, ['Choice Text', 'Choix', 'Option', 'Réponse', 'choice text', 'choix']);
            const isCorrect = getValue(row, ['Is Correct', 'Correct', 'isCorrect', 'correct', 'Correct?']);
            const points = getValue(row, ['Points', 'points', 'Point', 'point']);

            if (!questionText) {
                errors.push(`Ligne ${rowNum}: Le texte de la question est requis`);
                return;
            }

            if (!type || !['MCQ', 'Open', 'Close'].includes(type.toUpperCase())) {
                errors.push(`Ligne ${rowNum}: Le type doit être MCQ, Open ou Close`);
                return;
            }

            const questionType = type.toUpperCase();
            const questionOrder = parseInt(order) || 1;
            const questionKey = `${questionText}_${questionOrder}`;

            // Créer ou récupérer la question
            if (!questionsMap.has(questionKey)) {
                questionsMap.set(questionKey, {
                    text: String(questionText).trim(),
                    type: questionType,
                    order: questionOrder,
                    points: points ? parseFloat(points) : null,
                    choices: []
                });
            }

            const question = questionsMap.get(questionKey);

            // Ajouter le choix si c'est MCQ ou Close
            if ((questionType === 'MCQ' || questionType === 'CLOSE') && choiceText) {
                let correct = false;
                if (isCorrect !== null && isCorrect !== undefined) {
                    const correctStr = String(isCorrect).toLowerCase().trim();
                    correct = correctStr === 'true' || correctStr === '1' || correctStr === 'oui' || correctStr === 'yes' || correctStr === 'vrai' || correctStr === 'x';
                }

                question.choices.push({
                    text: String(choiceText).trim(),
                    isCorrect: correct,
                    order: question.choices.length + 1
                });
            }
        } catch (error) {
            errors.push(`Ligne ${index + 2}: ${error.message}`);
        }
    });

    // Valider les questions
    const questions = Array.from(questionsMap.values());
    questions.forEach((question, index) => {
        if ((question.type === 'MCQ' || question.type === 'CLOSE') && question.choices.length < 2) {
            errors.push(`Question "${question.text}": Les questions MCQ/Close doivent avoir au moins 2 choix`);
        }
        if ((question.type === 'MCQ' || question.type === 'CLOSE')) {
            const hasCorrect = question.choices.some(c => c.isCorrect);
            if (!hasCorrect) {
                errors.push(`Question "${question.text}": Au moins un choix doit être marqué comme correct`);
            }
        }
    });

    return { questions, errors };
}

/**
 * Format 3: Format simple avec colonnes fixes détectées automatiquement
 */
function parseFormat3(data, headers) {
    const questions = [];
    const errors = [];

    // Trouver les indices des colonnes
    const questionTextCol = findColumnIndex(headers, ['Question Text', 'Question', 'Texte', 'question', 'texte']);
    const typeCol = findColumnIndex(headers, ['Type', 'type', 'TYPE']);
    const orderCol = findColumnIndex(headers, ['Order', 'order', 'Ordre', 'ordre', 'Order Number']);

    if (questionTextCol === -1) {
        throw new Error('Colonne "Question Text" ou "Question" introuvable');
    }

    data.forEach((row, index) => {
        try {
            const rowNum = index + 2;
            const rowArray = Object.values(row);

            const questionText = rowArray[questionTextCol];
            const type = typeCol !== -1 ? rowArray[typeCol] : 'MCQ';
            const order = orderCol !== -1 ? rowArray[orderCol] : index + 1;

            if (!questionText) {
                errors.push(`Ligne ${rowNum}: Le texte de la question est requis`);
                return;
            }

            const questionType = (type && ['MCQ', 'Open', 'Close'].includes(type.toUpperCase())) 
                ? type.toUpperCase() 
                : 'MCQ';

            const question = {
                text: String(questionText).trim(),
                type: questionType,
                order: parseInt(order) || index + 1,
                choices: []
            };

            // Essayer d'extraire les choix des autres colonnes
            if (questionType === 'MCQ' || questionType === 'CLOSE') {
                headers.forEach((header, colIndex) => {
                    if (colIndex !== questionTextCol && colIndex !== typeCol && colIndex !== orderCol) {
                        const value = rowArray[colIndex];
                        if (value && String(value).trim()) {
                            // Vérifier si c'est un choix (pas un autre champ)
                            const headerLower = header.toLowerCase();
                            if (headerLower.includes('choice') || headerLower.includes('choix') || 
                                headerLower.includes('option') || headerLower.includes('réponse') ||
                                headerLower.includes('answer')) {
                                question.choices.push({
                                    text: String(value).trim(),
                                    isCorrect: false, // Par défaut, à ajuster manuellement
                                    order: question.choices.length + 1
                                });
                            }
                        }
                    }
                });

                if (question.choices.length < 2) {
                    errors.push(`Ligne ${rowNum}: Les questions MCQ/Close doivent avoir au moins 2 choix`);
                }
            }

            questions.push(question);
        } catch (error) {
            errors.push(`Ligne ${index + 2}: ${error.message}`);
        }
    });

    return { questions, errors };
}

/**
 * Helper: Obtenir une valeur d'une ligne en essayant plusieurs clés possibles
 */
function getValue(row, possibleKeys) {
    for (const key of possibleKeys) {
        if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
            return row[key];
        }
    }
    return null;
}

/**
 * Helper: Trouver l'index d'une colonne
 */
function findColumnIndex(headers, possibleNames) {
    for (const name of possibleNames) {
        const index = headers.findIndex(h => 
            h.toLowerCase().trim() === name.toLowerCase().trim()
        );
        if (index !== -1) return index;
    }
    return -1;
}

/**
 * Valider les questions parsées
 */
export const validateQuestions = (questions) => {
    const errors = [];
    const warnings = [];

    if (!questions || questions.length === 0) {
        errors.push('Aucune question trouvée dans le fichier');
        return { valid: false, errors, warnings };
    }

    questions.forEach((question, index) => {
        // Valider le texte
        if (!question.text || question.text.trim().length === 0) {
            errors.push(`Question ${index + 1}: Le texte est requis`);
        }

        // Valider le type
        if (!['MCQ', 'Open', 'Close'].includes(question.type)) {
            errors.push(`Question ${index + 1}: Type invalide (doit être MCQ, Open ou Close)`);
        }

        // Valider les choix pour MCQ/Close
        if (question.type === 'MCQ' || question.type === 'CLOSE') {
            if (!question.choices || question.choices.length < 2) {
                errors.push(`Question "${question.text}": Les questions MCQ/Close doivent avoir au moins 2 choix`);
            } else {
                // Vérifier qu'au moins un choix est correct
                const hasCorrect = question.choices.some(c => c.isCorrect);
                if (!hasCorrect) {
                    errors.push(`Question "${question.text}": Au moins un choix doit être marqué comme correct`);
                }

                // Vérifier les doublons
                const choiceTexts = question.choices.map(c => c.text.toLowerCase().trim());
                const uniqueTexts = new Set(choiceTexts);
                if (choiceTexts.length !== uniqueTexts.size) {
                    warnings.push(`Question "${question.text}": Des choix en double ont été détectés`);
                }
            }
        }

        // Valider l'ordre
        if (!question.order || question.order < 1) {
            warnings.push(`Question "${question.text}": L'ordre n'est pas valide, utilisation de l'ordre par défaut`);
            question.order = index + 1;
        }
    });

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
};


import express from 'express';
import excelImportController from '../controllers/excelImportController.js';

const excelImportRoutes = express.Router();

// Télécharger un template Excel
excelImportRoutes.get('/template', excelImportController.downloadTemplate);

// Importer des questions depuis Excel
excelImportRoutes.post('/import', 
    excelImportController.upload.single('file'), 
    excelImportController.importQuestionsFromExcel
);

export default excelImportRoutes;


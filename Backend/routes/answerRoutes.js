import express from 'express';
import answerController from '../controllers/answerController.js';

const answerRoutes = express.Router();

// Define routes for answer services
answerRoutes.get("/", answerController.getAllAnswers);
answerRoutes.get("/responseSheet/:responseSheetId", answerController.getAnswersByResponseSheetId);
answerRoutes.post("/", answerController.createAnswer);
answerRoutes.put("/update/:answerId", answerController.updateAnswer);

export default answerRoutes;

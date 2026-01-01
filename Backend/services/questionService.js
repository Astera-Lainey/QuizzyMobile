import Choice from "../models/choice.js";
import Evaluation from "../models/evaluation.js";
import Question from "../models/question.js";

async function getAllQuestions() {
    try {
        const questions = await Question.findAll();
        return questions;
    } catch (error) {
        console.log("Error Fetching Questions: ", error);
        throw new Error("Could not get all questions");
    }
}

async function getQuestionsByEvaluationId(evaluationId) {
    try {
        const questions = await Question.findAll({
            include: [
                {
                    model: Evaluation,
                    where: { evaluationId: evaluationId },
                    attributes: [],
                    through: {
                        attributes: ["points"]
                    }
                },{
                   model: Choice,
                   required: false
                },
            ],
            order: [['order', 'ASC']]
        });

        //use the dto
        if (questions) {
            return questions;
        } else {
            return [];
        }
    } catch (error) {
        console.log("Error Fetching Questions by Evaluation: ", error);
        throw error;
    }
}

async function createQuestion(text, type, order) {
    try {
        const question = await Question.findOne({ where: { text: text } });
        if (question) {
            return question;
        } else {
            const newQuestion = await Question.create({
                text: text,
                type: type,
                order: order,
            });

            return newQuestion;
        }
    } catch (error) {
        console.log("Error Creating Question: ", error);
        throw new Error("Internal Server Error")
    }
}

async function updateQuestion(questionId, text, type, order) {
    try {
        const question = await Question.findByPk(questionId);
        if (question) {
            question.text = text || question.text;
            question.type = type || question.type;
            question.order = order || question.order;

            await question.save();
            return question;
        } else {
            const newQuestion = await createQuestion(text, type, order)
            return newQuestion;
        }
    } catch (error) {
        console.log("Error Updating Question: ", error);
        throw new Error("Internal Server Error");
    }
}

async function deleteQuestion(questionId) {
    try {
        const affectedRows = await Question.destroy({
            where: {
                questionId: questionId
            }
        });
        if (affectedRows > 0) {
            return {status: "DELETED", message: "Successfully soft deleted question"};
        } else {
            return {status : "NOT FOUND", message: "Question Not found"};
        }
    } catch (error) {
        console.log("Error Deleting Question: ", error);
        throw new Error("Could not delete question");
    }
}

export default {
    getAllQuestions,
    getQuestionsByEvaluationId,
    createQuestion,
    updateQuestion,
    deleteQuestion,
};

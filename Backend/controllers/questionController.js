import Question from "../models/question.js";

async function getAllQuestions(req, res) {
    try {
        const questions = await Question.findAll();
        return res.status(200).json(questions);
    } catch (error) {
        console.log("Error Fetching Questions: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getQuestionsByEvaluationId(req, res) {
    try {
        const questions = await Question.findAll({
            include: [
                {
                    model: Evaluation,
                    attributes: [],
                    where: { id: req.params.evaluationId },
                    through: {
                        attributes: ["points"],
                    },
                },
            ],
        });

        if (questions) {
            return res.status(200).json(questions);
        } else {
            return res.status(404).json({ error: "No Questions Found" });
        }
    } catch (error) {
        console.log("Error Fetching Questions by Evaluation: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function createQuestion(req, res) {
    try {
        const question = await Question.findOne({ where: { text: req.body.text } });
        if (question) {
            return res.status(400).json({ error: "Question Already Exists" });
        } else {
            const newQuestion = await Question.create({
                text: req.body.text,
                type: req.body.type,
                order: req.body.order,
            });
            return res.status(201).json(newQuestion);
        }
    } catch (error) {
        console.log("Error Creating Question: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function updateQuestion(req, res) {
    try {
        const question = await Question.findByPk(req.params.questionId);
        if (question) {
            question.text = req.body.text || question.text;
            question.type = req.body.type || question.type;
            question.order = req.body.order || question.order;

            await question.save();
            return res.status(200).json(question);
        } else {
            return res.status(404).json({ error: "Question Not Found" });
        }
    } catch (error) {
        console.log("Error Updating Question: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function deleteQuestion(req, res) {
    try {
        const affectedRows = await Question.destroy({
            where: {
                questionId: req.params.questionId
            }
        });
        if (affectedRows > 0) {
            return res.status(200).json("Successfully soft deleted question");
        } else {
            return res.status(404).json("No question found");
        }
    } catch (error) {
        console.log("Error Deleting Question: ", error);
        return res.status(500).json("Internal Server Error");
    }
}

export default {
    getAllQuestions,
    getQuestionsByEvaluationId,
    createQuestion,
    updateQuestion,
    deleteQuestion,
};

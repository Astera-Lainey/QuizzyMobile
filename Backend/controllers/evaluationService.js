import Choice from "../models/choice.js";
import Evaluation from "../models/evaluation.js";
import Question from "../models/question.js";

async function getAllEvaluations() {
    try {
        const evaluations = await Evaluation.findAll({
            include: [
                {
                    model: Question,
                    through: {
                        attributes: ["points"]
                    },
                    include: [
                        {
                            model: Choice
                        }
                    ]
                }
            ]
        });

        // if (evaluations.length === 0) {
        //     return res.status(404).json("No Evaluations Found");
        // }

        return evaluations;
    } catch (error) {
        console.log("Error Fetching Evaluations: ", error);
        throw new Error("Could not get all Evaluations");
    }
}

async function getAllPublishedEvaluations() {
    try {
        const evaluations = await Evaluation.findAll({
            where: {
                status: ["Published", "Completed"]
            },
            include: [
                {
                    model: Question,
                    through: {
                        attributes: ["points"]
                    },
                    include: [
                        {
                            model: Choice
                        }
                    ]
                }
            ]
        });

        return evaluations;
    }catch (error){
        console.log("Error Fetching Published Evaluations: ", error);
        throw new Error("Could not get all Published Evaluations")
    }

}

async function getEvaluationByCourseCode(courseCode) {
    try {
        const evaluations = await Evaluation.findAll({
            where: {
                courseCode: courseCode
            },
            include: {
                model: Question,
                through: {
                    attributes: ["marks"],
                },
            },
        });
        if (evaluations) {
            return evaluations;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Unable to get Evaluations: ", error);
        throw error;
    }

}

async function createEvaluation(publishedDate, type, startTime, endTime, courseCode) {
    try {
        const evaluation = await Evaluation.findOne({
            where: {
                courseCode,
                type,
            }, paranoid: false
        });
        if (evaluation) {
            if (evaluation.deletedAt !== null) {
                await evaluation.restore();

                updateEvaluation(evaluation.evaluationId, publishedDate, type, startTime, endTime);

                return {
                    status: 'RESTORED',
                    evaluation: evaluation
                };
            }

            return {
                status: 'EXISTS',
                message: 'Evaluation already exists for this course and type'
            };
        } else {

            const newEvaluation = Evaluation.build({
                publishedDate,
                uploadDate: new Date(),
                type,
                startTime,
                endTime,
                courseCode,
                status: "Draft",
            });
            await newEvaluation.save();
            return {
                status: 'CREATED',
                evaluation: newEvaluation
            };
        }
    } catch (error) {
        console.error("Error Creating Evaluation: ", error);
        // res.status(500).json("Internal Server Error");
        throw error;
    }
}

async function updateEvaluation(evaluationId, publishedDate, type, startTime, endTime) {
    try {
        const evaluation = await Evaluation.findByPk(evaluationId);

        if (evaluation) {
            evaluation.publishedDate = publishedDate || evaluation.publishedDate;
            evaluation.type = type || evaluation.type;
            evaluation.startTime = startTime || evaluation.startTime;
            evaluation.endTime = endTime || evaluation.endTime;

            // Update questions and their points if provided
            // if(req.body.questions && Array.isArray(req.body.questions)){
            //     await evaluation.setQuestions([]); // Clear existing associations
            //     for(const q of req.body.questions){
            //         const question = await Question.findByPk(q.id);
            //         if(question){
            //             await evaluation.addQuestion(question, { through: { points: q.points } });

            //             if((question.type === 'MCQ'|| question.type === 'Close') && q.choices ){
            //                 // Update choices if provided
            //                 for(const choiceData of q.choices){
            //                     const choice = await Choice.findByPk(choiceData.id);
            //                     if(choice){
            //                         choice.text = choiceData.text || choice.text;
            //                         choice.isCorrect = choiceData.isCorrect !== undefined ? choiceData.isCorrect : choice.isCorrect;
            //                         await choice.save();
            //                     }
            //                 }
            //             }
            //         }
            //     }
            // }

            await evaluation.save();
            return { status: "UPDATED", evaluation: evaluation };
        } else {
            return { status: "NOT FOUND", evaluation: [] };
        }
    } catch (error) {
        console.error("Error Updating Evaluation: ", error);
        throw new Error("Could not update Evaluation");
    }
}

async function deleteEvaluation(evaluationId) {
    try {
        const deletedEvaluation = await Evaluation.destroy({
            where: {
                evaluationId: evaluationId
            }
        });
        if (deletedEvaluation > 0) {
            return { status: "DELETED" };
        } else {
            res.status(404).json("Evaluation Not Found");
        }

    } catch (error) {
        console.error("Error Deleting Evaluation: ", error);
        res.status(500).json("Internal Server Error");
    }
}

export default {
    getAllEvaluations,
    getEvaluationByCourseCode,
    createEvaluation,
    updateEvaluation,
    deleteEvaluation,
    getAllPublishedEvaluations
};
import nodeCron from "node-cron";
import Evaluation from "../models/evaluation.js";
import ResponseSheet from "../models/responseSheet.js";
import Answer from "../models/answer.js"
import Question from "../models/question.js";
import EvaluationQuestion from "../models/evaluationQuestion.js";
import Choice from "../models/choice.js";
import { notifyEvaluationPublished } from "../services/pushNotificationService.js";
import Notification from "../models/notification.js";

function combineDateAndTime(date, time) {
    const [hours, minutes, seconds] = time.split(':');
    const d = new Date(date);
    d.setHours(hours, minutes, seconds || 0, 0);
    return d;
}
async function autoGrade(responseSheetId) {
    const answers = await Answer.findAll({
        where: { id: responseSheetId },
        include: [
            {
                model: Question,
                include: [
                    {
                        model: Evaluation,
                        attributes:["evaluationId"],
                        through:{
                            model: EvaluationQuestion,
                            attributes: ["points"]
                        },
                        required: true

                    },
                    {
                        model: Choice,
                        required: false
                    }
                ]
            }
        ]
    });

    const responseSheet = await ResponseSheet.findByPk(responseSheetId);

    if(!responseSheet){
        throw new Error("Response Sheet not found");
    }

    const evaluationId = responseSheet.evaluationId;


    let totalScore = 0;

    for (const answer of answers) {
        const question = answer.Question;

        const evaluationEntry = question.Evaluations.find(
            e => e.evaluationId === evaluationId
        );

        const points = evaluationEntry?.EvaluationQuestion?.points || 0;

        let score = 0;

       if (question.type === 'MCQ' || question.type === "Close") {
            const selected = question.Choices.find(
                c => c.choiceId === answer.selectedOption
            );

            if (selected && selected.isCorrect) {
                score = points;
            }
        }
        answer.score = score;
        await answer.save();

        totalScore += score;
    }

   responseSheet.score = totalScore;

    await responseSheet.save();
}

async function autoSubmitResponseSheet(responseSheet) {
    responseSheet.submittedAt = new Date();
    responseSheet.serverSubmitTime = new Date();
    await responseSheet.save();

    await autoGrade(responseSheet.responseSheetId);
}


nodeCron.schedule('* * * * *', async () => {
    try {
        const now = new Date();

        const evaluations = await Evaluation.findAll({
            where: { status: "Draft" }
        });

        for (const evaluation of evaluations) {
            const publishedDateTime = combineDateAndTime(evaluation.publishedDate, evaluation.startTime);

            if (now >= publishedDateTime) {
                evaluation.status = "Published";
                await evaluation.save();

                console.log(`Evaluation ${evaluation.evaluationId} published`);

                // Envoyer les push notifications aux étudiants concernés
                try {
                    const notificationResult = await notifyEvaluationPublished(evaluation.evaluationId);

                    if (notificationResult.success) {
                        console.log(`Push notifications sent for evaluation ${evaluation.evaluationId}: ${notificationResult.successCount} sent, ${notificationResult.failureCount} failed`);
                    } else {
                        console.warn(`Failed to send push notifications for evaluation ${evaluation.evaluationId}:`, notificationResult.error);
                    }
                } catch (error) {
                    console.error(`Error sending push notifications for evaluation ${evaluation.evaluationId}:`, error);
                }
            }
        }
    } catch (error) {
        console.error("Cron publish error: ", error);
    }
});


nodeCron.schedule("* * * * *", async () => {
    try {
        const now = new Date();

        const publishedEvaluations = await Evaluation.findAll({
            where: { status: "Published" }
        });
        if (publishedEvaluations) {
            for (const evaluation of publishedEvaluations) {
                const endDateTime = combineDateAndTime(evaluation.publishedDate, evaluation.endTime);
                console.log("UploadDate: ", evaluation.uploadDate);
                console.log("StartTime: ", evaluation.startTime);
                console.log("PublishedDate: ", evaluation.publishedDate);
                console.log("End Time: ", evaluation.endTime);
                console.log("now: ", now)
                console.log("endDateTime: ", endDateTime);

                if (now >= endDateTime) {
                    evaluation.status = "Completed";
                    await evaluation.save();

                    //auto-submit open Response sheets

                    const openSheets = await ResponseSheet.findAll({
                        where: {
                            evaluationId: evaluation.evaluationId,
                            submittedAt: null
                        }
                    });

                    for (const sheet of openSheets) {
                        await autoSubmitResponseSheet(sheet);
                    }

                    console.log(`Evaluation ${evaluation.evaluationId} completed`);


                }
            }
        } else {
            console.log("No published Evaluations")
        }

    } catch (error) {
        console.error("Cron close error: ", error);
    }
});
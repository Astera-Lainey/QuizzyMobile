import Choice from "../models/choice.js";

async function getAllChoices(){
    try{
        const choices = await Choice.findAll();
        return choices;
    }catch(error){
        console.log("Error Fetching Choices: ", error);
        throw new Error("Could not get all choices");
    }
}

async function getChoicesByQuestionId(questionId){
    try{
        const choices = await Choice.findAll({
        where: {
            questionId: questionId
        }
     });
        if (choices) {
            return choices;
        } else {
            return [];
        }
    }catch(error){
        console.log("Error Fetching Choices by Question: ", error);
        throw Error("Could not get choices by  specified question")
    }
}

async function createChoice(text, order, isCorrect, questionId){
    try{
        const choice = await Choice.findOne({
            where: {
                order: order,
                questionId: questionId
            }, paranoid: false
        });
        if (choice) {
            if (choice.deletedAt !== null) {
                // return res.status(200).json("Choice Restored Successfully");
                return await choice.restore();
            } else {
                // return res.status(200).json("Choice Already Exists");
                return choice;
            }
        } else {
        const newChoice = await Choice.create({
            text: text,
            isCorrect: isCorrect,
            order: order,
            questionId: questionId,
        });
        // return res.status(201).json(newChoice);
        return newChoice;
        }
    }catch(error){
        console.log("Error Creating Choice: ", error);
        throw new Error("Internal Server Error");
    }
}

async function updateChoice(choiceId, text, order, isCorrect, questionId){
    try{
        const choice = await Choice.findByPk(choiceId);
        if(choice){
            const existingChoice = await Choice.findOne({
                where: {
                    order: order,
                    questionId: questionId,
                }
            });
            if(existingChoice && existingChoice.choiceId !== choice.choiceId){
                return existingChoice;
            }
            choice.text = req.body.text || choice.text;
            choice.isCorrect = req.body.isCorrect !== undefined ? req.body.isCorrect : choice.isCorrect;
            choice.order = req.body.order || choice.order;

            await choice.save();
            return choice;
        }else{
            const newChoice = await createChoice(text, order, isCorrect ,questionId);
            return newChoice;
        }
    }catch(error){
        console.log("Error Updating Choice: ", error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

async function deleteChoice(choiceId){
    try{
        const affectedRows = await Choice.destroy({
            where: {
                choiceId: choiceId
            }
        });
        if(affectedRows > 0){
            return {status: "DELETED", message: "Successfully soft deleted choice"};
        }else{
            return {status : "NOT FOUND", message: "Choice Not found"};
        }
    }catch(error){
        console.log("Error Deleting Choice: ", error);
        throw new Error("Could not delete Choice");
    }
}

export default {
    getAllChoices,
    getChoicesByQuestionId,
    createChoice,
    updateChoice,
    deleteChoice
};
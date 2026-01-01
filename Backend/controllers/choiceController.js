import Choice from "../models/choice.js";

async function getAllChoices(req, res){
    try{
        const choices = await Choice.findAll();
        return res.status(200).json(choices);
    }catch(error){
        console.log("Error Fetching Choices: ", error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

async function getChoicesByQuestionId(req, res){
    try{
        const choices = await Choice.findAll({
        where: {
            questionId: req.params.questionId
        }
     });
        if (choices) {
            return res.status(200).json(choices);
        } else {
            return res.status(404).json({ error: "No Choices Found" });
        }
    }catch(error){
        console.log("Error Fetching Choices by Question: ", error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

async function createChoice(req, res){
    try{
        const choice = await Choice.findOne({
            where: {
                order: req.body.order,
                questionId: req.body.questionId
            }, paranoid: false
        });
        if (choice) {
            const affectedRows = await Choice.restore({
                where: {
                    choiceId: choice.choiceId
                }
            });
            if (affectedRows > 0) {
                return res.status(200).json("Choice Restored Successfully");
            } else {
                return res.status(200).json("Choice Already Exists");
            }
        } else {
        const newChoice = await Choice.create({
            text: req.body.text,
            isCorrect: req.body.isCorrect,
            order: req.body.order,
            questionId: req.body.questionId,
        });
        return res.status(201).json(newChoice);
        }
    }catch(error){
        console.log("Error Creating Choice: ", error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

async function updateChoice(req, res){
    try{
        const choice = await Choice.findByPk(req.params.choiceId);
        if(choice){
            const existingChoice = await Choice.findOne({
                where: {
                    order: req.body.order,
                    questionId: req.body.questionId,
                }
            });
            if(existingChoice && existingChoice.choiceId !== choice.choiceId){
                return res.status(400).json("A choice with the same order already exists for this question.");
            }
            choice.text = req.body.text || choice.text;
            choice.isCorrect = req.body.isCorrect !== undefined ? req.body.isCorrect : choice.isCorrect;
            choice.order = req.body.order || choice.order;

            await choice.save();
            return res.status(200).json(choice);
        }else{
            return res.status(404).json({ error: "Choice Not Found" });
        }
    }catch(error){
        console.log("Error Updating Choice: ", error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

async function deleteChoice(req, res){
    try{
        const affectedRows = await Choice.destroy({
            where: {
                choiceId: req.params.choiceId
            }
        });
        if(affectedRows > 0){
            return res.status(200).json("Choice Deleted Successfully");
        }else{
            return res.status(404).json("Choice Not Found");
        }
    }catch(error){
        console.log("Error Deleting Choice: ", error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

export default {
    getAllChoices,
    getChoicesByQuestionId,
    createChoice,
    updateChoice,
    deleteChoice
};
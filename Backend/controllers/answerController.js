import Answer from "../models/answer.js";

async function getAllAnswers(req, res){
    try{
        const answers = await Answer.findAll();
        return res.status(200).json(answers);
    }catch(error){
        console.log("Error Fetching Answers: ", error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

async function getAnswersByResponseSheetId(req, res){
    try{
        const answers = await Answer.findAll({
        include: [{
            model: ResponseSheet,
            attributes: [],
            where: { id: req.params.responseSheetId },
        }]
     });

        if (answers) {
            return res.status(200).json(answers);
        } else {
            return res.status(404).json("No Answers Found");
        }
    }catch(error){
        console.log("Error Fetching Answers by Response Sheet: ", error);
        return res.status(500).json("Internal Server Error");
    }
}

async function createAnswer(req, res){
    try{
        const answer = await Answer.findOne({
            where: {
                questionId: req.body.questionId,
                id: req.body.responseSheetId,
            }
        });
        if (answer) {
            return res.status(400).json("Answer already exists for this question in the response sheet" );
        }else{
            const newAnswer = await Answer.create({
                selectedOption: req.body.selectedOption || null,
                openTextResponse: req.body.openTextResponse || null,
                questionId: req.body.questionId,
                isCorrect: req.body.isCorrect || false,
                id: req.body.responseSheetId,
            });
            return res.status(201).json(newAnswer);
        }
    }catch(error){
        console.log("Error Creating Answer: ", error);
        return res.status(500).json("Internal Server Error");
    }
}

async function updateAnswer(req, res){
    try{
        const answer = await Answer.findByPk(req.params.answerId);
        if(answer){
            answer.selectedOption = req.body.selectedOption !== undefined ? req.body.selectedOption : answer.selectedOption;
            answer.openTextResponse = req.body.openTextResponse !== undefined ? req.body.openTextResponse :  answer.openTextResponse;
            answer.isCorrect = req.body.isCorrect !== undefined ? req.body.isCorrect : answer.isCorrect;

            await answer.save();
            return res.status(200).json(answer);
        }else{
            return res.status(404).json("Answer Not Found" );
        }
    }catch(error){
        console.log("Error Updating Answer: ", error);
        return res.status(500).json("Internal Server Error");
    }
}

async function updateMCQAnswer(req, res){
    try{
        const answer = await Answer.findByPk(req.params.answerId);
        if(answer){
            answer.selectedOption = req.body.selectedOption !== undefined ? req.body.selectedOption : answer.selectedOption;
            await answer.save();
            return res.status(200).json(answer);
        }else{
            return res.status(404).json("Answer Not Found" );
        }
    }catch(error){
        console.log("Error Updating MCQ Answer: ", error);
        return res.status(500).json("Internal Server Error");
    }
}

async function updateOpenEndedAnswer(req, res){
    try{
        const answer = await Answer.findByPk(req.params.answerId);
        if(answer){
            answer.openTextResponse = req.body.openTextResponse !== undefined ? req.body.openTextResponse :  answer.openTextResponse;
            await answer.save();
            return res.status(200).json(answer);
        }else{
            return res.status(404).json("Answer Not Found" );
        }
    }catch(error){
        console.log("Error Updating Open-Ended Answer: ", error);
        return res.status(500).json("Internal Server Error");
    }
}

export default {
    getAllAnswers,
    getAnswersByResponseSheetId,
    createAnswer,
    updateAnswer,
};
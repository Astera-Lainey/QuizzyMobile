import Evaluation from "../models/evaluation.js";
import ResponseSheet from "../models/responseSheet.js";

async function getAllResponseSheets(){
    try{
        const responseSheets = await ResponseSheet.findAll();
        return responseSheets;
    }catch(error){
        console.log("Error Fetching Response Sheets: ", error);
        throw error;
    }
}

async function getResponseSheetsByEvaluationId(evaluationId){
    try{
        const responseSheets = await ResponseSheet.findAll({
        include: [{
            model: Evaluation,
            attributes: [],
            where: { id: evaluationId },
        }]
     });
        if (responseSheets) {
            return responseSheets;
        } else {
            return [];
        }
    }catch(error){
        console.log("Error Fetching Response Sheets by Evaluation: ", error);
        throw error;
    }
}

async function findResponseSheetByMatriculeAndEvaluationId(matricule, evaluationId){
    try{
        const responseSheet = await ResponseSheet.findOne({
            where: {
                evaluationId: evaluationId,
                matricule: matricule
            }
        });
        if (!responseSheet) {
            return {};
        }
        return responseSheet;
    } catch (error){
        console.error(`Error getting the response sheet for matricule ${req.params.matricule} and evaluation ${req.params.evaluationId}`, error);
        throw error;
    }
}

async function createResponseSheet(evaluationId, matricule, serverStartTime, clientStartTime, submittedAt, score){
    try{
        const responseSheet = await ResponseSheet.findOne({
            where: {
                evaluationId: evaluationId,
                matricule: matricule
            }
        });
        if (responseSheet) {
            // return res.status(400).json("Response Sheet Already Exists for this Student and Evaluation");
            return responseSheet;
        }else{
        const newResponseSheet = await ResponseSheet.create({
            evaluationId: evaluationId,
            matricule: matricule,
            submittedAt: submittedAt || null,
            serverStartTime: serverStartTime,
            // serverSubmitTime: serverSubmitTime || null,
            clientStartTime: clientStartTime || null,
            // clientSubmitTime: clientSubmitTime || null,
            score: score || 0,
        });
        return newResponseSheet;
        }
    }catch(error){
        console.log("Error Creating Response Sheet: ", error);
        throw new Error("Could not create ResponseSheet");
    }
}

async function updateResponseSheet(req, res){
    try{
        const responseSheet = await ResponseSheet.findByPk(req.params.responseSheetId);
        if(responseSheet){
            responseSheet.submittedAt = req.body.submittedAt !== undefined ? req.body.submittedAt : responseSheet.submittedAt;
            responseSheet.serverStartTime = req.body.serverStartTime !== undefined ? req.body.serverStartTime : responseSheet.serverStartTime;
            responseSheet.serverSubmitTime = req.body.serverSubmitTime !== undefined ? req.body.serverSubmitTime : responseSheet.serverSubmitTime;
            responseSheet.clientStartTime = req.body.clientStartTime !== undefined ? req.body.clientStartTime : responseSheet.clientStartTime;
            responseSheet.clientSubmitTime = req.body.clientSubmitTime !== undefined ? req.body.clientSubmitTime : responseSheet.clientSubmitTime;
            responseSheet.score = req.body.score !== undefined ? req.body.score : responseSheet.score;

            await responseSheet.save();
            return res.status(200).json(responseSheet);
        }else{
            return res.status(404).json({ error: "Response Sheet Not Found" });
        }
    }catch(error){
        console.log("Error Updating Response Sheet: ", error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

export default{
    getAllResponseSheets,
    getResponseSheetsByEvaluationId,
    createResponseSheet,
    updateResponseSheet,
    findResponseSheetByMatriculeAndEvaluationId
};
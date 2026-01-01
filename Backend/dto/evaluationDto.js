import QuestionDto from "./questionDto.js";

export default class EvaluationDto {
    constructor(evaluation) {
        this.publishedDate = evaluation.publishedDate;
        this.type = evaluation.type;
        this.startTime = evaluation.startTime;
        this.endTime = evaluation.endTime;
        this.status = evaluation.status;
        this.courseCode = evaluation.courseCode;

        this.questions = evaluation.Questions ? evaluation.Questions.map(q => new QuestionDto(q, q.EvaluationQuestion)) : [];
    }
}


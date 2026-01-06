import studentQuestionDto from "./studentQuestionDto.js";

export default class studentEvaluationDto {
    constructor(evaluation) {
        this.evaluationId = evaluation.evaluationId;
        this.publishedDate = evaluation.publishedDate;
        this.type = evaluation.type;
        this.startTime = evaluation.startTime;
        this.endTime = evaluation.endTime;
        this.status = evaluation.status;
        this.courseCode = evaluation.courseCode;

        this.courseName = evaluation.Course?.courseName ?? null;

        this.questions = evaluation.Questions
            ? evaluation.Questions.map(q => new studentQuestionDto(q))
            : [];
    }
}
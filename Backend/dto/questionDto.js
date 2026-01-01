import ChoiceDto from "./choiceDto.js";

export default class QuestionDto {
    constructor(question, evaluationQuestion) {
        this.questionId = question.questionId;
        this.text = question.text;
        this.type = question.type;
        this.order = evaluationQuestion?.order;
        this.points = evaluationQuestion?.points;

        this.choices = question.Choices? question.Choices.map(choice => new ChoiceDto(choice)): []

    }
}
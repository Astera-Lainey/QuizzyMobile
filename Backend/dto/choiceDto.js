// function choiceDto(choice) {
//     return {
//         choiceId: choice.choiceId,
//         text: choice.text,
//         order: choice.order,
//         isCorrect: choice.isCorrect,
//     };
// }

// export default choiceDto;

export default class ChoiceDto {
    constructor(choice){
        this.choiceId = choice.choiceId;
        this.text = choice.text;
        this.order = choice.order;
        this.isCorrect = choice.isCorrect;
    }
}
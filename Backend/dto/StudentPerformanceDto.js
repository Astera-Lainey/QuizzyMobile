export default class StudentPerformanceDto {
  constructor(responseSheet, totalPossibleScore, passMarkPercentage = 50) {
    const student = responseSheet.Student;

    this.matricule = student.matricule;
    this.name = `${student.firstName} ${student.lastName}`;
    this.score = responseSheet.score ?? 0;

    this.percentage =
      totalPossibleScore > 0
        ? Number(((this.score / totalPossibleScore) * 100).toFixed(2))
        : 0;

    this.status =
      this.percentage >= passMarkPercentage ? 'Passed' : 'Failed';

    this.timeTaken = this.calculateTimeTaken(
      responseSheet.serverStartTime,
      responseSheet.submittedAt
    );
  }

  calculateTimeTaken(startTime, submittedAt) {
    if (!startTime || !submittedAt) return 0;

    const start = new Date(`1970-01-01T${startTime}Z`);
    const end = new Date(submittedAt);

    return Math.max(0, Math.round((end - start) / 60000)); // minutes
  }
}

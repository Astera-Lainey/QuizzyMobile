import ClassCourse from './classCourse.js';
import EvaluationQuestion from './evaluationQuestion.js';
import Administrator from './administrator.js';
import Student from './student.js'
import Notification from './notification.js';
import Class from './class.js';
import AcademicYear from './academicYear.js';
import Semester from './semester.js';
import Course from './course.js';
import Evaluation from './evaluation.js'
import Question from './question.js';
import Choice from './choice.js';
import Answer from './answer.js';
import ResponseSheet from './responseSheet.js';
import Teacher from './teacher.js';
import DeviceToken from './deviceToken.js';


Student.hasMany(Notification, { foreignKey: 'matricule' });
Notification.belongsTo(Student, { foreignKey: 'matricule' });

Student.belongsToMany(Course, { through: 'StudentCourse' });
Course.belongsToMany(Student, { through: 'StudentCourse' });

Student.belongsTo(Class, { foreignKey: 'classId' });
Class.hasMany(Student, { foreignKey: 'classId' });

Student.hasMany(ResponseSheet, { foreignKey: 'matricule' });
ResponseSheet.belongsTo(Student, { foreignKey: 'matricule' });

AcademicYear.hasMany(Semester, { foreignKey: 'yearId' });
Semester.belongsTo(AcademicYear, { foreignKey: 'yearId' });

Semester.hasMany(Course, { foreignKey: 'semesterId' });
Course.belongsTo(Semester, { foreignKey: 'semesterId' });

Course.belongsToMany(Class, { through: ClassCourse });
Class.belongsToMany(Course, { through: ClassCourse});

Course.hasMany(Evaluation, { foreignKey: 'courseCode' });
Evaluation.belongsTo(Course, { foreignKey: 'courseCode' });

Course.belongsToMany(Teacher, { through: 'TeacherCourse' });
Teacher.belongsToMany(Course, { through: 'TeacherCourse' });

Evaluation.belongsToMany(Question, { through: EvaluationQuestion });
Question.belongsToMany(Evaluation, { through: EvaluationQuestion });

Evaluation.hasMany(ResponseSheet, { foreignKey: 'evaluationId' });
ResponseSheet.belongsTo(Evaluation, { foreignKey: 'evaluationId' });

ResponseSheet.hasMany(Answer, { foreignKey: 'id' });
Answer.belongsTo(ResponseSheet, { foreignKey: 'id' });

Question.hasMany(Choice, { foreignKey: 'questionId' });
Choice.belongsTo(Question, { foreignKey: 'questionId' });

Question.hasMany(Answer, { foreignKey: 'questionId' });
Answer.belongsTo(Question, { foreignKey: 'questionId' });

Administrator.hasMany(Notification, { foreignKey: 'adminId' });
Notification.belongsTo(Administrator, { foreignKey: 'adminId' });

Student.hasMany(DeviceToken, { foreignKey: 'matricule' });
DeviceToken.belongsTo(Student, { foreignKey: 'matricule' });

export default {
    Student,
    Notification,
    AcademicYear,
    Administrator,
    Answer,
    Choice,
    Class,
    DeviceToken,
    Evaluation,
    Question,
    ResponseSheet,
    Semester,
    Teacher,
}
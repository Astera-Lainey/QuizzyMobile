export default class CourseDto {
    constructor(course){
        this.courseCode = course.courseCode;
        this.courseName = course.courseName;
        this.semesterId = course.semesterId;

        this.credit = course.Classes?.ClassCourse?.credit;
    }
}
import e from "express";
import Teacher from "../models/teacher.js";

async function getAllTeachers(req, res) {
    try {
        const teachers = await Teacher.findAll();
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json( 'Failed to retrieve teachers');
    }
}

async function getTeacherById(req, res) {
    const { id } = req.params;
    try {
        const teacher = await Teacher.findByPk(id);
        if (teacher) {
            res.status(200).json(teacher);
        } else {
            res.status(404).json('Teacher not found' );
        }
    } catch (error) {
        res.status(500).json('Failed to retrieve teacher');
    }
}

async function createTeacher(req, res) {
    const { firstName, lastName, email, phoneNumber } = req.body;
    try {
        const teacher = await Teacher.findOne({ where: { email }, paranoid: false });
        if (teacher) {
            const affectedRows = await Teacher.restore({
                where: {
                    email: email
                }
            });
            if (affectedRows > 0) {
                console.log("Teacher with email restored successfully.");
                res.status(200).json("Teacher Restored Successfully")
            }else{
                res.status(200).json("Teacher Already Exists");
            }

        }else {
            const newTeacher = await Teacher.create({
                firstName,
                lastName,
                email,
                phoneNumber
            });
            res.status(201).json(newTeacher);
        }

    } catch (error) {
        res.status(500).json('Failed to create teacher');
    }
}

async function updateTeacher(req, res) {
    const { id } = req.params;
    const { firstName, lastName, email, phoneNumber } = req.body;
    try {
        const teacher = await Teacher.findByPk(id);
        if (teacher) {
            teacher.firstName = firstName || teacher.firstName;
            teacher.lastName = lastName || teacher.lastName;
            teacher.email = email || teacher.email;
            teacher.phoneNumber = phoneNumber || teacher.phoneNumber;
            await teacher.save();
            res.status(200).json(teacher);
        } else {
            res.status(404).json('Teacher not found' );
        }
    } catch (error) {
        res.status(500).json('Failed to update teacher');
    }
}

async function deleteTeacher(req, res) {
    const { id } = req.params;
    try {
        const teacher = await Teacher.findByPk(id);
        if (teacher) {
            await teacher.destroy();
            res.status(200).json('Teacher deleted successfully' );
        } else {
            res.status(404).json('Teacher not found' );
        }
    } catch (error) {
        res.status(500).json('Failed to delete teacher');
    }
}

export default {
    getAllTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    deleteTeacher
};
import { Op } from "sequelize";
import AcademicYear from "../models/academicYear.js";

async function getCurrentYear(req, res) {
    try {
        const academicYears = await AcademicYear.findAll();

        const currentYear = academicYears.find((year) => year.isPresent == true);

        if (currentYear) {
            return res.status(200).json(currentYear);
        } else {
            return res.status(200).json("No Active Academic Year");
        }
    } catch (error) {
        console.error("Error Fetching Academic Year: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getAllYears(req, res) {
    try {
        const years = await AcademicYear.findAll();
        return res.status(200).json(years);
    } catch (error) {
        console.error("Error Fetching All the Years: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function createYear(req, res) {
    try {
        const year = await AcademicYear.findOne({
            where: {
                startDate: req.body.startDate,
            },
        });
        if (year) {
            return res
                .status(400)
                .json("Academic Year with this start date already exists");
        } else {
            const newYear = AcademicYear.build({
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                isPresent: false,
            });

            await newYear.save();
            res.status(201).json(newYear);
        }
    } catch (error) {
        console.error("Error Creating Year", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function updateAcademicYear(req, res) {
    try {
        const academicYear = await AcademicYear.findByPk(req.params.yearId);

        console.log("Updating Academic Year ID: ", req.params.yearId);

        if (academicYear) {
            const year = await AcademicYear.findOne({
                where: {
                    startDate: req.body.startDate,
                },
            });
            if (year && year.yearId !== academicYear.yearId) {
                return res
                    .status(400)
                    .json("Another Academic Year with this start date already exists");
            } else {
                academicYear.startDate = req.body.startDate || academicYear.startDate;
                academicYear.endDate = req.body.endDate || academicYear.endDate;
            }

            await academicYear.save();
            return res.status(200).json(academicYear);
        } else {
            return res.status(404).json("Academic Year not found");
        }
    } catch (error) {
        console.error("Error Updating Academic Year", error);
        return res.status(500).json("Internal Server Error");
    }
}

async function updateCurrentAcademicYear() {
    console.log("Running scheduled task: updateCurrentAcademicYear");
    const today = new Date();

    try {
        // 1. Find the academic year that contains today's date
        const currentYearRecord = await AcademicYear.findOne({
            where: {
                startDate: {
                    [Op.lte]: today, // Start date is less than or equal to today
                },
                endDate: {
                    [Op.gte]: today, // End date is greater than or equal to today
                },
            },
        });

        if (currentYearRecord) {
            // 2. Set the found year's isPresent to true (if not already)
            if (!currentYearRecord.isPresent) {
                await currentYearRecord.update({ isPresent: true });
                console.log(
                    `Updated academic year ID ${currentYearRecord.yearId} to isPresent: true`
                );
            }

            // 3. Set all other academic years' isPresent to false
            // Find all years EXCEPT the current one and update them
            await AcademicYear.update(
                { isPresent: false },
                {
                    where: {
                        yearId: {
                            [Op.ne]: currentYearRecord.yearId, // ID is NOT equal to the current one
                        },
                        isPresent: true, // Only update those that are currently true
                    },
                }
            );
            console.log("All other academic years set to isPresent: false");
        } else {
            console.warn("No academic year found for the current date.");
            // Optionally set all to false if no match is found for the current date
            await AcademicYear.update(
                { isPresent: false },
                { where: { isPresent: true } }
            );
        }
    } catch (error) {
        console.error("Error in updateCurrentAcademicYear scheduled task:", error);
    }
}

export default {
    getCurrentYear,
    createYear,
    updateCurrentAcademicYear,
    updateAcademicYear,
    getAllYears,
};

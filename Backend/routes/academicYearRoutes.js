import express from "express";
import academicYearController from "../controllers/academicYearController.js";

const academicYearRoutes = express.Router();

//requires nothing
academicYearRoutes.get("", academicYearController.getAllYears);

//requires body: {startDate: DATE, endDate: DATE (optional)}
academicYearRoutes.post("", academicYearController.createYear);

//requires just the yearId as param and body with any of the fields to update
academicYearRoutes.put("/update/:yearId", academicYearController.updateAcademicYear);

//requires nothing
academicYearRoutes.get("/current", academicYearController.getCurrentYear);

export default academicYearRoutes;
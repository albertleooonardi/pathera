import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./Database.js";
import Route from "./Route.js";

// Import models
import Users from "./model/Users.js";
import Companies from "./model/Companies.js";
import JobMatches from "./model/JobMatches.js";
import Jobs from "./model/Jobs.js";
import JobSkills from "./model/JobSkills.js";
import MatchedSkills from "./model/MatchedSkills.js";
import Skills from "./model/Skills.js";
import UserSkills from "./model/UserSkills.js";
import UserTitles from "./model/UserTitles.js";
import SavedJobs from "./model/SavedJobs.js";
import Questions from "./model/Questions.js";
import AnswerKey from "./model/AnswerKey.js";
import PracticeSession from "./model/PracticeSession.js";
import AnswerDetails, {
  initAssociations as initAnswerDetailsAssociations,
} from "./model/AnswerDetails.js";

dotenv.config();
const app = express();

// Middleware setup
const allowedOrigin = "http://localhost:5173";
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// Initialize database and sync models
(async () => {
  try {
    console.log("Connecting to the database...");
    await db.authenticate();
    console.log("Database connected!");

    // Sync models
    await Users.sync();
    await Skills.sync();
    await Companies.sync();
    await Jobs.sync();
    await JobMatches.sync();
    await JobSkills.sync();
    await MatchedSkills.sync();
    await UserSkills.sync();
    await UserTitles.sync();
    await SavedJobs.sync();
    await Questions.sync();
    await AnswerKey.sync();
    await PracticeSession.sync();
    await AnswerDetails.sync();

    // Initialize associations
    initAnswerDetailsAssociations(PracticeSession, Questions);

    console.log("Models synced and associations initialized.");
  } catch (error) {
    console.error("Error initializing the database:", error);
    process.exit(1); // Exit the process if database initialization fails
  }
})();

// Define routes
app.use(Route);

// Start the server
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./Database.js";
import { migrate } from "./migrate.js";
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
app.disable("x-powered-by");

// Middleware setup
const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
// 10mb comfortably fits a base64-encoded 60 second recording for /transcribe
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// Initialize database and apply migrations
(async () => {
  try {
    console.log("Connecting to the database...");
    await db.authenticate();
    console.log("Database connected!");

    // Schema lives in supabase/migrations (instead of Model.sync()) so RLS is applied
    await migrate();

    // Initialize associations
    initAnswerDetailsAssociations(PracticeSession, Questions);

    console.log("Migrations applied and associations initialized.");
  } catch (error) {
    console.error("Error initializing the database:", error);
    process.exit(1); // Exit the process if database initialization fails
  }
})();

// Define routes
app.use(Route);

// Malformed JSON, oversized bodies and other errors: answer with JSON, never a stack trace
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error("Unhandled error:", err);
  res.status(status).json({
    error: status >= 500 ? "Internal Server Error" : err.message || "Bad Request",
  });
});

// Start the server
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

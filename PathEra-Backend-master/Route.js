import express from "express";
import UserController from "./controller/UserController.js";
import checkToken from "./middleware/CheckToken.js";
import {
  getFeaturedJobs,
  getRecommendations,
  recommendJobs,
  showAllJobs,
  showJobDetail,
} from "./controller/JobController.js";
import {
  saveJob,
  showSavedJobs,
  showWishlistedJobs,
  removeSavedJob,
} from "./controller/SavedJobsController.js";
import { showSkills } from "./controller/SkillsController.js";
import authenticateToken from "./middleware/AuthToken.js";
import { getQuestions } from "./controller/QuestionsController.js";
import process from "process";
import { Buffer } from "buffer";
import {
  saveSession,
  getSession,
  getAllSession,
} from "./controller/PracticeSessionController.js";

const router = express.Router();

router.get("/auth", UserController.auth);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/logout", checkToken, UserController.logout);
router.post("/recommend", recommendJobs);
router.get("/featured", getFeaturedJobs);
router.get("/jobs", showAllJobs);
router.post("/save-job", saveJob);
router.get("/skills", showSkills);
router.get("/questions/:jobTitle", getQuestions);
router.get("/saved-jobs", authenticateToken, showSavedJobs);
router.get("/wishlisted-jobs/:userId", authenticateToken, showWishlistedJobs);
router.delete("/remove-job", authenticateToken, removeSavedJob);
router.post("/save-session", saveSession);
router.get("/get-session/:sessionId", getSession);
router.get("/history", getAllSession);
router.get("/jobs/:id", showJobDetail);
router.get("/get-recommendations", getRecommendations);
router.post("/transcribe", async (req, res) => {
  try {
    const { audioData } = req.body;

    if (!audioData) {
      console.error("No audio data received");
      return res.status(400).json({ error: "No audio data provided" });
    }

    const base64Data = audioData.includes(",")
      ? audioData.split(",")[1]
      : audioData;

    if (!base64Data || base64Data.trim() === "") {
      console.error("Base64 data extraction failed");
      return res.status(400).json({ error: "Invalid base64 data" });
    }

    const buffer = Buffer.from(base64Data, "base64");

    const response = await fetch(
      "https://api-inference.huggingface.co/models/openai/whisper-small",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: buffer.toString("base64"),
          options: {
            task: "transcribe",
            language: "en",
          },
        }),
      }
    );

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error during transcription:", error);
    return res.status(500).json({ error: "Transcription failed" });
  }
});

export default router;

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
import { getQuestions } from "./controller/QuestionsController.js";
import process from "process";
import { Buffer } from "buffer";
import {
  saveSession,
  getSession,
  getAllSession,
} from "./controller/PracticeSessionController.js";

const router = express.Router();

router.get("/auth", checkToken, UserController.auth);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.post("/logout", checkToken, UserController.logout);
router.post("/recommend", recommendJobs);
router.get("/featured", getFeaturedJobs);
router.get("/jobs", showAllJobs);
router.post("/save-job", checkToken, saveJob);
router.get("/skills", showSkills);
router.get("/questions/:jobTitle", getQuestions);
router.get("/saved-jobs", checkToken, showSavedJobs);
router.get("/wishlisted-jobs/:userId", checkToken, showWishlistedJobs);
router.delete("/remove-job", checkToken, removeSavedJob);
router.post("/save-session", checkToken, saveSession);
router.get("/get-session/:sessionId", checkToken, getSession);
router.get("/history", checkToken, getAllSession);
router.get("/jobs/:id", showJobDetail);
router.get("/get-recommendations", getRecommendations);
// The old api-inference.huggingface.co host was retired; Inference Providers serve it now
const TRANSCRIBE_URL =
  "https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3";

// Signed-in users only, so the Hugging Face quota can't be spent anonymously
router.post("/transcribe", checkToken, async (req, res) => {
  try {
    const { audioData } = req.body;

    if (typeof audioData !== "string" || !audioData) {
      return res.status(400).json({ error: "No audio data provided" });
    }

    // audioData is a data URL such as "data:audio/webm;codecs=opus;base64,...."
    const [header, base64Data] = audioData.includes(",")
      ? audioData.split(",", 2)
      : ["", audioData];
    const contentType =
      header.match(/^data:(audio\/[\w.+-]+)/)?.[1] || "audio/webm";

    if (!base64Data || base64Data.trim() === "") {
      return res.status(400).json({ error: "Invalid base64 data" });
    }

    const response = await fetch(TRANSCRIBE_URL, {
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": contentType,
      },
      method: "POST",
      body: Buffer.from(base64Data, "base64"),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || typeof result.text !== "string") {
      console.error("Transcription service error:", response.status, result);
      return res.status(502).json({ error: "Transcription failed" });
    }

    return res.status(200).json({ text: result.text });
  } catch (error) {
    console.error("Error during transcription:", error);
    return res.status(500).json({ error: "Transcription failed" });
  }
});

export default router;

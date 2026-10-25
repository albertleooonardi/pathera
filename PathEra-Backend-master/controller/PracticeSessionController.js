import jwt from "jsonwebtoken";
import PracticeSession from "../model/PracticeSession.js";
import AnswerDetails from "../model/AnswerDetails.js";
import Questions from "../model/Questions.js";
import { Sequelize } from "sequelize";

export const saveSession = async (req, res) => {
  try {
    const {
      userId,
      jobTitle,
      answers,
      scores,
      feedback,
      questions,
      sample_answers,
    } = req.body;

    // Validate inputs
    if (
      !answers ||
      !Array.isArray(answers) ||
      !scores ||
      !Array.isArray(scores) ||
      !feedback ||
      !Array.isArray(feedback) ||
      !questions ||
      !Array.isArray(questions) ||
      !sample_answers ||
      !Array.isArray(sample_answers) ||
      answers.length !== scores.length ||
      answers.length !== feedback.length ||
      answers.length !== questions.length ||
      answers.length !== sample_answers.length
    ) {
      return res.status(400).json({
        error:
          "Invalid input: Ensure all arrays are present and have the same length.",
      });
    }

    // Validate question IDs against the database
    const validQuestionIds = await Questions.findAll({
      where: {
        id: questions.map((q) => q.id),
      },
      attributes: ["id"],
    });

    if (validQuestionIds.length !== questions.length) {
      return res.status(400).json({
        error: "One or more question IDs do not exist in the database.",
      });
    }

    // Create new session
    const newSession = await PracticeSession.create({
      user_id: userId,
      job_title: jobTitle,
    });

    const sessionId = newSession.dataValues.id;

    // Create answer details
    const answerDetails = answers.map((answer, index) => ({
      practice_session_id: sessionId,
      question_id: questions[index].id,
      answer,
      score: scores[index],
      feedback: feedback[index],
      sample_answer: sample_answers[index],
    }));

    try {
      // Save answer details in bulk
      await AnswerDetails.bulkCreate(answerDetails);
    } catch (error) {
      console.error("Error saving answer details:", error);
      return res.status(500).json({ error: "Error saving answer details." });
    }

    return res
      .status(200)
      .json({ message: "Session saved successfully", id: sessionId });
  } catch (error) {
    console.error("Error saving practice session:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getAllSession = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }
    const token = authHeader.split(" ")[1];

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const authenticatedUserId = decodedToken.id;

    const sessions = await PracticeSession.findAll({
      where: { user_id: authenticatedUserId },
      attributes: {
        include: [
          [
            Sequelize.fn("AVG", Sequelize.col("answerDetails.score")),
            "average_score",
          ],
        ],
      },
      include: {
        model: AnswerDetails,
        as: "answerDetails",
        attributes: [],
        include: {
          model: Questions,
          as: "question",
          attributes: ["question"],
        },
      },
      order: [["createdAt", "DESC"]],
      group: ["practice_sessions.id"],
    });

    return res.status(200).json(sessions);
  } catch (error) {
    console.error("Error fetching all sessions:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }
    console.log("Authorization Header:", authHeader);
    const token = authHeader.split(" ")[1];

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const authenticatedUserId = decodedToken.id;

    const session = await PracticeSession.findOne({
      where: { id: sessionId },
      include: {
        model: AnswerDetails,
        as: "answerDetails",
        include: {
          model: Questions,
          as: "question",
          attributes: ["question"],
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.user_id !== authenticatedUserId) {
      return res.status(403).json({
        error:
          "Access forbidden: You do not have permission to access this session.",
      });
    }

    const sessionDetails = {
      userId: session.user_id,
      jobTitle: session.job_title,
      answers: session.answerDetails.map((answer) => ({
        question: answer.question.question,
        answer: answer.answer,
        score: answer.score,
        feedback: answer.feedback,
        sampleAnswer: answer.sample_answer,
      })),
    };

    return res.status(200).json(sessionDetails);
  } catch (error) {
    console.error("Error fetching practice session:", error);
    return res.status(500).json({ error: error.message });
  }
};

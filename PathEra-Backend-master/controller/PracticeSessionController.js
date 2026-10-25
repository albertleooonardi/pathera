import PracticeSession from "../model/PracticeSession.js";
import AnswerDetails from "../model/AnswerDetails.js";
import Questions from "../model/Questions.js";
import { Sequelize } from "sequelize";

export const saveSession = async (req, res) => {
  try {
    const {
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
      answers.length !== sample_answers.length ||
      answers.length === 0 ||
      typeof jobTitle !== "string" ||
      !jobTitle.trim() ||
      !answers.every((answer) => typeof answer === "string") ||
      !feedback.every((item) => typeof item === "string") ||
      !scores.every(
        (score) => typeof score === "number" && score >= 0 && score <= 100
      ) ||
      !questions.every((q) => q && Number.isSafeInteger(Number(q.id)))
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

    // Create new session, owned by the signed-in user rather than a client-supplied id
    const newSession = await PracticeSession.create({
      user_id: req.user.id,
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
      // answer_details.sample_answer is NOT NULL, but some questions have no answer key
      sample_answer: sample_answers[index] ?? "",
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
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllSession = async (req, res) => {
  try {
    const authenticatedUserId = req.user.id;

    const sessions = await PracticeSession.findAll({
      where: { user_id: authenticatedUserId },
      // Subquery instead of JOIN + GROUP BY: Postgres rejects ungrouped joined columns
      attributes: {
        include: [
          [
            Sequelize.literal(
              `(SELECT AVG("score") FROM "answer_details" WHERE "answer_details"."practice_session_id" = "practice_sessions"."id")`
            ),
            "average_score",
          ],
        ],
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(sessions);
  } catch (error) {
    console.error("Error fetching all sessions:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const authenticatedUserId = req.user.id;

    if (!/^\d+$/.test(sessionId)) {
      return res.status(404).json({ error: "Session not found" });
    }

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
      // keep answers in the order they were given
      order: [[{ model: AnswerDetails, as: "answerDetails" }, "id", "ASC"]],
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

    // Postgres returns DECIMAL columns as strings
    const scores = session.answerDetails.map((answer) => Number(answer.score));
    const sessionDetails = {
      userId: session.user_id,
      jobTitle: session.job_title,
      // Results.tsx reads these two
      averageScore: scores.length
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0,
      createdAt: session.createdAt,
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
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

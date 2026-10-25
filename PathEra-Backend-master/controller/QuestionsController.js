import Questions from "../model/Questions.js";
import AnswerKey from "../model/AnswerKey.js";
import { Sequelize } from "sequelize";

export const getQuestions = async (req, res) => {
  try {
    const jobTitle = req.params.jobTitle;

    const questions = await Questions.findAll({
      where: { job_title: jobTitle },
      attributes: ["id", "question"],
      include: [
        {
          model: AnswerKey,
          as: "answerKey", 
          attributes: ["answer"],
          limit: 1,
        },
      ],
      order: Sequelize.literal("RAND()"), 
      limit: 10,
    });

    const formattedQuestions = questions.map((question) => {
      return {
        id: question.id,
        question: question.question,
        sample_answer:
          question.answerKey.length > 0 ? question.answerKey[0].answer : null,
      };
    });

    return res.status(200).json(formattedQuestions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return res.status(500).json({ error: error.message });
  }
};

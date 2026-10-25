import Skills from "../model/Skills.js";

export const showSkills = async (req, res) => {
  try {
    const skills = await Skills.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    return res.status(200).json(skills);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

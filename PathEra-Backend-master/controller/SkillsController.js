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
    console.error("Error fetching skills:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

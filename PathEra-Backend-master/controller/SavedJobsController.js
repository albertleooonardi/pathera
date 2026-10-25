import SavedJobs from "../model/SavedJobs.js";
import Jobs from "../model/Jobs.js";
import Companies from "../model/Companies.js";

export const saveJob = async (req, res) => {
  try {
    const { job_id } = req.body;
    // the owner is the signed-in user, never a user_id sent by the client
    const user_id = req.user.id;

    if (!Number.isSafeInteger(Number(job_id)) || Number(job_id) <= 0) {
      return res.status(400).json({ error: "A valid job_id is required" });
    }

    if (!(await Jobs.findByPk(job_id, { attributes: ["id"] }))) {
      return res.status(404).json({ error: "Job not found" });
    }

    const existingSave = await SavedJobs.findOne({
      where: { job_id, user_id },
    });

    if (existingSave) {
      return res
        .status(400)
        .json({ error: "Job is already saved by this user." });
    }

    const savedJob = await SavedJobs.create({ job_id, user_id });

    res.status(201).json(savedJob);
  } catch (error) {
    console.error("Error saving job:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const showSavedJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ error: "Invalid or missing user ID" });
    }

    const savedJobs = await SavedJobs.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Jobs,
          as: "job",
          attributes: ["id", "job_title", "job_description", "date_posted"],
          include: [
            {
              model: Companies,
              as: "companyId",
              attributes: ["id", "company_name"],
            },
          ],
        },
      ],
    });

    // an empty list is a normal state, not an error, so the page can show its empty state
    return res.status(200).json(savedJobs);
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const showWishlistedJobs = async (req, res) => {
  const { userId } = req.params;

  if (Number(userId) !== req.user.id) {
    return res.status(403).json({ error: "You can only view your own saved jobs." });
  }

  try {
    // Fetch all jobs
    const allJobs = await Jobs.findAll({
      include: [
        {
          model: Companies,
          as: "companyId",
          attributes: ["id", "company_name"],
        },
      ],
    });

    const savedJobs = await SavedJobs.findAll({
      where: { user_id: userId },
      attributes: ["job_id"],
    });

    const savedJobIds = new Set(savedJobs.map((job) => job.job_id));

    const jobsWithSavedStatus = allJobs.map((job) => ({
      ...job.toJSON(),
      isSaved: savedJobIds.has(job.id),
    }));

    return res.status(200).json(jobsWithSavedStatus);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


export const removeSavedJob = async (req, res) => {
  const { job_id } = req.body;
  const user_id = req.user.id;

  if (!Number.isSafeInteger(Number(job_id)) || Number(job_id) <= 0) {
    return res.status(400).json({ error: "A valid job_id is required" });
  }

  try {
    const result = await SavedJobs.destroy({
      where: { job_id, user_id },
    });

    if (result === 0) {
      return res
        .status(404)
        .json({ message: "Job not found or not saved by this user." });
    }

    return res.status(200).json({ message: "Job removed from saved list." });
  } catch (error) {
    console.error("Error removing job:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

import axios from "axios";
import JobSkills from "../model/JobSkills.js";
import Jobs from "../model/Jobs.js";
import Companies from "../model/Companies.js";
import Skills from "../model/Skills.js";
import SavedJobs from "../model/SavedJobs.js";
import { getAuthenticatedUserId } from "../middleware/CheckToken.js";
import db from "../Database.js";

export const getFeaturedJobs = async (req, res) => {
  try {
    const featuredJobs = await Jobs.findAll({
      order: db.random(),
      limit: 9,
      include: [
        {
          model: Companies,
          as: "companyId",
          attributes: ["id", "company_name", "company_image"],
        },
      ],
      attributes: {
        exclude: [
          "company_id",
          "min_experience",
          "degree",
          "job_link",
          "updatedAt",
        ],
      },
    });

    res.status(200).json(featuredJobs);
  } catch (error) {
    console.error("Error fetching featured jobs:", error.message);
    res.status(500).json({ error: "Error fetching featured jobs" });
  }
};

export const recommendJobs = async (req, res) => {
  try {
    const userData = req.body;

    const aiResponse = await axios.post(
      "http://localhost:5020/recommend",
      userData
    );

    if (aiResponse.data.success) {
      const jobRecommendations = aiResponse.data.result;

      // the AI service returns each job's id as `id`
      const jobIds = jobRecommendations.map((job) => job.id);

      const jobs = await Jobs.findAll({
        where: { id: jobIds },
        include: {
          model: Companies,
          as: "companyId",
          attributes: ["company_name"],
        },
      });

      const jobDetails = jobs.reduce((acc, job) => {
        acc[job.id] = {
          jobTitle: job.job_title,
          companyName: job.companyId.company_name,
        };
        return acc;
      }, {});

      const enrichedRecommendations = jobRecommendations.map((job) => ({
        job_id: job.id,
        companyName: jobDetails[job.id]?.companyName || "Unknown",
        jobTitle: jobDetails[job.id]?.jobTitle || "Unknown",
        similarity: job.similarity || 0,
      }));

      res
        .status(200)
        .json({ success: true, jobRecommendations: enrichedRecommendations });
    } else {
      res.status(500).json({
        success: false,
        error: "AI service failed to provide recommendations",
      });
    }
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const showAllJobs = async (req, res) => {
  try {
    const jobs = await Jobs.findAll({
      include: [
        {
          model: Companies,
          as: "companyId",
          attributes: ["id", "company_name", "company_image"],
        },
      ],
      attributes: {
        exclude: [
          "company_id",
          "min_experience",
          "degree",
          "job_link",
          "updatedAt",
        ],
      },
    });

    return res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const showJobDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Job details are public; a signed-in user additionally gets their saved state
    const authenticatedUserId = await getAuthenticatedUserId(req);

    const savedJob = authenticatedUserId
      ? await SavedJobs.findOne({
          where: { job_id: id, user_id: authenticatedUserId },
        })
      : null;

    const job = await Jobs.findOne({
      where: { id },
      include: [
        {
          model: Companies,
          as: "companyId",
          attributes: ["company_name", "company_image"],
        },
        {
          model: JobSkills,
          as: "jobSkills",
          include: [
            {
              model: Skills,
              as: "skill",
              attributes: ["skill_name"],
            },
          ],
        },
      ],
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const jobDetails = {
      id: job.id,
      jobTitle: job.job_title,
      jobModel: job.job_model,
      jobLevel: job.job_level,
      jobType: job.job_type,
      companyImage: job.companyId.company_image,
      companyName: job.companyId.company_name,
      location: job.location,
      industry: job.job_industry,
      degree: job.degree,
      // null when the source listing had no posting date (createdAt is only the import time)
      datePosted: job.date_posted,
      minExperience: job.min_experience,
      isSaved: !!savedJob,
      skillsRequired: job.jobSkills.map(
        (jobSkill) => jobSkill.skill?.skill_name || "Unknown"
      ),
      jobDescription: job.job_description,
    };

    res.status(200).json(jobDetails);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while retrieving job details" });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({ error: "No job IDs provided" });
    }

    const jobIdsArray = (Array.isArray(ids) ? ids : String(ids).split(",")).map(
      (id) => String(id).trim()
    );

    if (!jobIdsArray.length || !jobIdsArray.every((id) => /^\d+$/.test(id))) {
      return res.status(400).json({ error: "Job IDs must be numeric" });
    }

    const jobs = await Jobs.findAll({
      where: {
        id: jobIdsArray,
      },
      include: [
        {
          model: Companies,
          as: "companyId",
          attributes: ["id", "company_name", "company_image"],
        },
      ],
      attributes: {
        exclude: [
          "company_id",
          "min_experience",
          "degree",
          "job_link",
          "updatedAt",
        ],
      },
    });

    return res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

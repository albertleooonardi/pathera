import React, { useState, ChangeEvent, useEffect, FormEvent } from "react";
import { ArrowRight, Check, Info, Plus, Search, X } from "lucide-react";
import MainLayout from "./layout/MainLayout";
import axios from "axios";
import { BASE_URL, FLASK_URL } from "./config/settings";
import { SkillType } from "./types/SkillType";
import useSmoothScroll from "./hooks/useSmoothScroll";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
import LoadingIcon from "./components/LoadingIcon";
import { useNavigate } from "react-router-dom";
import { useUser } from "./context/UserContext";
import { Button } from "./components/ui/button";
import { useToaster } from "./context/ToastContext";
import { Input } from "./components/ui/input";
import PageHeader from "./components/PageHeader";

const Assessment: React.FC = () => {
  useSmoothScroll();
  const [user] = useUser();
  const [skills, setSkills] = useState<SkillType[]>([]);
  const [selectedJobTitles, setSelectedJobTitles] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [inputValueJobTitles, setInputValueJobTitles] = useState<string>("");
  const [inputValueSkills, setInputValueSkills] = useState<string>("");
  const [degree, setDegree] = useState<string>("No Degree");
  const [suggestionsSkills, setSuggestionsSkills] = useState<SkillType[]>([]);
  const [experience, setExperience] = useState<string>("0");
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionComplete, setSubmissionComplete] = useState<boolean>(false);
  const [errorJobTitle, setErrorJobTitle] = useState<string | null>(null);
  const [errorSkills, setErrorSkills] = useState<string | null>(null);
  const [, setAbortController] = useState<AbortController | null>(null);
  const navigate = useNavigate();
  const { toastError } = useToaster();

  const handleInputChangeJobTitles = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValueJobTitles(e.target.value);
  };

  const handleInputChangeSkills = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValueSkills(value);
    setActiveSuggestion(0);
    if (value.trim().length >= 1) {
      const query = value.trim().toLowerCase();
      const filteredSuggestions = skills
        .filter(
          (skill) =>
            skill.skill_name.toLowerCase().includes(query) &&
            !selectedSkills.includes(skill.skill_name)
        )
        // Prefix matches first, so "py" suggests Python before "numpy".
        .sort(
          (a, b) =>
            Number(!a.skill_name.toLowerCase().startsWith(query)) -
            Number(!b.skill_name.toLowerCase().startsWith(query))
        )
        .slice(0, 8);
      setSuggestionsSkills(filteredSuggestions);
    } else {
      setSuggestionsSkills([]);
    }
  };

  const handleAddJobTitle = () => {
    if (errorJobTitle) {
      setErrorJobTitle(null);
    }
    const title = inputValueJobTitles.trim();
    if (title.length === 0) return;
    if (title.length < 3) {
      setErrorJobTitle("Job titles need at least 3 characters.");
      return;
    }
    if (
      selectedJobTitles.some((t) => t.toLowerCase() === title.toLowerCase())
    ) {
      setErrorJobTitle(`"${title}" is already added.`);
      return;
    }
    setSelectedJobTitles((prev) => [...prev, title]);
    setInputValueJobTitles("");
  };

  const handleAddSkill = (skill: string) => {
    if (errorSkills) {
      setErrorSkills(null);
    }
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills((prev) => [...prev, skill]);
      setInputValueSkills("");
      setSuggestionsSkills([]);
    }
  };

  const handleRemoveTitleJobTitles = (title: string) => {
    setSelectedJobTitles(
      selectedJobTitles.filter((jobTitle) => jobTitle !== title)
    );
  };

  const handleRemoveTitleSkills = (skill: string) => {
    setSelectedSkills(
      selectedSkills.filter((skillTitle) => skillTitle !== skill)
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/skills`);
        setSkills(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorJobTitle(null);
    setErrorSkills(null);

    const controller = new AbortController();
    setAbortController(controller);
    // A title typed but not yet added still counts.
    const pendingTitle = inputValueJobTitles.trim();
    const jobTitles =
      pendingTitle.length >= 3 &&
      !selectedJobTitles.some((t) => t.toLowerCase() === pendingTitle.toLowerCase())
        ? [...selectedJobTitles, pendingTitle]
        : selectedJobTitles;
    if (jobTitles.length === 0) {
      setErrorJobTitle("Please add at least one job title.");
      document.getElementById("job-title-input")?.focus();
      return;
    }
    if (selectedSkills.length === 0) {
      // the matcher scores jobs on skills, so it rejects an assessment without any
      setErrorSkills("Please add at least one skill.");
      document.getElementById("skills-input")?.focus();
      return;
    }
    if (jobTitles !== selectedJobTitles) {
      setSelectedJobTitles(jobTitles);
      setInputValueJobTitles("");
    }
    setIsSubmitting(true);
    setSubmissionComplete(false);
    try {
      const response = await axios.post(
        `${FLASK_URL}/recommend`,
        {
          user_id: user?.id,
          job_title: jobTitles.join(","),
          years_of_experience: Math.max(0, Number(experience) || 0),
          skills: selectedSkills.join(","),
          degree,
        },
        {
          signal: controller.signal,
        }
      );
      const matches = response.data.result.slice(0, 15);
      localStorage.setItem("recommendations", JSON.stringify(matches));
      localStorage.setItem(
        "skill_matches",
        JSON.stringify(response.data.skill_matches.slice(0, 15))
      );
      sessionStorage.setItem("animate", "true");
      setSubmissionComplete(true);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Submission canceled");
      } else {
        console.error("Submission error:", error);
        toastError("We couldn't get your matches. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = () => {
    navigate("/recommendations");
  };

  const DEGREES = ["No Degree", "Bachelor", "Master", "MBA", "PhD"];

  return (
    <MainLayout title="Assessment" size="narrow">
      <div className="container-page">
        <PageHeader
          eyebrow="Assessment"
          title="Find the jobs that fit you"
          description="Answer a few questions so our model can match you with the most relevant roles."
        />

        <form
          onSubmit={handleSubmit}
          className="surface animate-fade-up divide-y divide-border"
        >
          <section className="p-5 sm:p-8">
            <StepLabel index={1} title="Your job titles" hint="Current or target roles. Press Enter to add." required />
            <div className="flex gap-2">
              <Input
                id="job-title-input"
                aria-label="Job title"
                aria-invalid={!!errorJobTitle}
                type="text"
                value={inputValueJobTitles}
                onChange={(e) => {
                  handleInputChangeJobTitles(e);
                  if (errorJobTitle) setErrorJobTitle(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddJobTitle();
                  }
                }}
                placeholder="e.g. Data Analyst"
              />
              <Button
                type="button"
                variant="outline"
                className="h-11 shrink-0"
                onClick={handleAddJobTitle}
              >
                <Plus />
                Add
              </Button>
            </div>
            {errorJobTitle && (
              <p className="mt-2 text-sm text-destructive">{errorJobTitle}</p>
            )}
            <TagList items={selectedJobTitles} onRemove={handleRemoveTitleJobTitles} />
          </section>

          <section className="p-5 sm:p-8">
            <StepLabel index={2} title="Years of experience" />
            <div className="relative w-40">
              <Input
                aria-label="Years of experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
                onBlur={() => setExperience(String(Number(experience) || 0))}
                type="text"
                inputMode="numeric"
                placeholder="5"
                className="pr-14 font-mono"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                years
              </span>
            </div>
          </section>

          <section className="p-5 sm:p-8">
            <StepLabel index={3} title="Your skills" hint="Add at least one. The more you add, the better the matches." required />
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="skills-input"
                aria-invalid={!!errorSkills}
                type="text"
                value={inputValueSkills}
                onChange={(e) => {
                  handleInputChangeSkills(e);
                  if (errorSkills) setErrorSkills(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (suggestionsSkills.length > 0) {
                      handleAddSkill(suggestionsSkills[activeSuggestion].skill_name);
                    }
                  } else if (e.key === "ArrowDown" && suggestionsSkills.length) {
                    e.preventDefault();
                    setActiveSuggestion((i) => (i + 1) % suggestionsSkills.length);
                  } else if (e.key === "ArrowUp" && suggestionsSkills.length) {
                    e.preventDefault();
                    setActiveSuggestion(
                      (i) => (i - 1 + suggestionsSkills.length) % suggestionsSkills.length
                    );
                  } else if (e.key === "Escape") {
                    setSuggestionsSkills([]);
                  }
                }}
                onBlur={() => setTimeout(() => setSuggestionsSkills([]), 150)}
                role="combobox"
                aria-label="Skills"
                aria-expanded={suggestionsSkills.length > 0}
                aria-controls="skill-suggestions"
                aria-autocomplete="list"
                autoComplete="off"
                placeholder="Start typing your skills"
                className="pl-10"
              />
              {suggestionsSkills.length > 0 && (
                <ul id="skill-suggestions" role="listbox" className="absolute inset-x-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-xl border border-border bg-popover/95 p-1.5 shadow-2xl shadow-mariner-950/10 backdrop-blur-xl">
                  {suggestionsSkills.map((skill, index) => (
                    <li
                      key={skill.id}
                      role="option"
                      aria-selected={index === activeSuggestion}
                      onMouseDown={(e) => e.preventDefault()}
                      // onMouseMove, not onMouseEnter: the list can open under a resting
                      // cursor, which would otherwise make Enter pick the hovered skill
                      onMouseMove={() => setActiveSuggestion(index)}
                      onClick={() => handleAddSkill(skill.skill_name)}
                      className={`cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors ${
                        index === activeSuggestion
                          ? "bg-mariner-50 text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {skill.skill_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {errorSkills && (
              <p className="mt-2 text-sm text-destructive">{errorSkills}</p>
            )}
            <TagList items={selectedSkills} onRemove={handleRemoveTitleSkills} />
          </section>

          <section className="p-5 sm:p-8">
            <StepLabel index={4} title="Highest degree" />
            <RadioGroup
              className="flex flex-wrap gap-2"
              value={degree}
              onValueChange={setDegree}
            >
              {DEGREES.map((value) => {
                const id = value.toLowerCase().replace(/\s+/g, "-");
                return (
                  <label
                    key={value}
                    htmlFor={id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-input bg-white px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground has-[[data-state=checked]]:border-primary/50 has-[[data-state=checked]]:bg-primary/[0.08] has-[[data-state=checked]]:text-foreground"
                  >
                    <RadioGroupItem value={value} id={id} />
                    {value}
                  </label>
                );
              })}
            </RadioGroup>
          </section>

          <div className="flex flex-col-reverse gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              Only job titles are required. More detail gives better matches.
            </p>
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Get my matches
              <ArrowRight />
            </Button>
          </div>
        </form>

        <AlertDialog open={isSubmitting || submissionComplete}>
          <AlertDialogContent className="max-w-sm">
            <AlertDialogHeader className="items-center text-center sm:text-center">
              {submissionComplete ? (
                <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-success/15 text-success">
                  <Check size={22} />
                </span>
              ) : (
                <div className="mb-4 mt-2">
                  <LoadingIcon />
                </div>
              )}
              <AlertDialogTitle>
                {submissionComplete ? "Your matches are ready" : "Analysing your profile"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                {submissionComplete
                  ? "Your submission was successful. Click continue to proceed."
                  : "Hold on… this might take a while."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {submissionComplete && (
              <AlertDialogFooter>
                <AlertDialogAction onClick={handleContinue} className="w-full">
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            )}
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

const StepLabel = ({
  index,
  title,
  hint,
  required = false,
}: {
  index: number;
  title: string;
  hint?: string;
  required?: boolean;
}) => (
  <div className="mb-4 flex items-start gap-3">
    <span className="mt-0.5 font-mono text-xs text-primary">0{index}</span>
    <div>
      <p className="font-medium">
        {title}
        {required && (
          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            Required
          </span>
        )}
      </p>
      {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
    </div>
  </div>
);

const TagList = ({
  items,
  onRemove,
}: {
  items: string[];
  onRemove: (item: string) => void;
}) =>
  items.length > 0 ? (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/[0.08] py-1 pl-3 pr-1 text-sm"
        >
          {item}
          <button
            type="button"
            onClick={() => onRemove(item)}
            className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Remove ${item}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  ) : null;

export default Assessment;

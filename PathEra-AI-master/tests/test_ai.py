"""Tests for the interview answer evaluator, the job recommender and the Flask API.

The evaluator runs against an in-memory SQLite copy of InterviewSimulation/questions.csv and answer_key.csv,
so no Supabase connection is needed. Run with: .venv/bin/python -m pytest tests -q
"""
import json
import os
import sys

import pandas as pd
import pytest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
DATA = os.path.join(ROOT, "InterviewSimulation")

os.environ["DATABASE_URL"] = "sqlite://"

import app as flask_app  # noqa: E402  (needs DATABASE_URL set first; also downloads the NLTK data)
from InterviewSimulation.evaluator import Evaluator  # noqa: E402

STRONG = ("Feature engineering is the process of using domain knowledge to create, select and transform variables "
          "from raw data so that machine learning models can learn better and become more accurate.")
PARTIAL = "It's about preparing the columns of the data so the model works better."
OFF_TOPIC = "Sentiment analysis classifies a piece of text as positive, negative or neutral."
JUNK = "I like pizza and going to the beach on weekends."


def load_answer_key(engine):
    questions = pd.read_csv(os.path.join(DATA, "questions.csv")).rename(
        columns={"Question": "question", "Topic": "topic", "JobTitle": "job_title"})
    answers = pd.read_csv(os.path.join(DATA, "answer_key.csv")).rename(columns={"Answer": "answer"})
    questions.to_sql("questions", engine, index=False, if_exists="replace")
    answers.to_sql("answer_key", engine, index=False, if_exists="replace")


@pytest.fixture(scope="module")
def evaluator():
    load_answer_key(flask_app.evaluator.engine)
    return flask_app.evaluator


@pytest.fixture(scope="module")
def client(evaluator):
    return flask_app.app.test_client()


def user(**overrides):
    data = {
        "user_id": 1,
        "job_title": "Data Scientist,Data Analyst",
        "skills": "Python,Machine Learning,SQL,Data Analysis",
        "degree": "Bachelor",
        "years_of_experience": 1,
    }
    data.update(overrides)
    return data


# --- evaluator -----------------------------------------------------------------------------------------------

@pytest.mark.parametrize("url", ["postgres://u:p@localhost:5432/db", "postgresql://u:p@localhost:5432/db"])
def test_postgres_urls_use_installed_psycopg2_driver(url):
    # SQLAlchemy 2.1 defaults postgresql:// to psycopg 3, which isn't installed; create_engine doesn't connect
    assert Evaluator(url).engine.dialect.driver == "psycopg2"


def test_score_is_json_serializable_float_in_range(evaluator):
    score = evaluator.evaluate(1, STRONG)
    assert type(score) is float
    assert 0 <= score <= 100
    json.dumps({"score": score})


def test_scores_rank_answers_by_quality(evaluator):
    strong = evaluator.evaluate(1, STRONG)
    partial = evaluator.evaluate(1, PARTIAL)
    off_topic = evaluator.evaluate(1, OFF_TOPIC)
    junk = evaluator.evaluate(1, JUNK)
    assert strong > partial > off_topic >= junk
    assert strong >= 75
    assert off_topic <= 30
    assert junk <= 10


def test_reference_answer_scores_high_against_the_rest(evaluator):
    answers = pd.read_csv(os.path.join(DATA, "answer_key.csv"))
    held_out = answers[answers.question_id == 3].Answer.iloc[0]
    assert evaluator.evaluate(3, held_out) >= 80


def test_question_without_topic_is_scored(evaluator):
    # questions 34, 37 and 41 have no topic in the dataset; this used to raise AttributeError
    assert 0 <= evaluator.evaluate(34, "Cross validation splits the data into folds to estimate how a model generalizes.") <= 100


def test_missing_reference_answers_raise_lookup_error(evaluator):
    with pytest.raises(LookupError):
        evaluator.evaluate(999999, STRONG)


def test_question_id_is_not_interpolated_into_sql(evaluator):
    assert evaluator.check_question_exists("1 OR 1=1") is False


# --- recommender ---------------------------------------------------------------------------------------------

def test_overall_score_never_negative_and_uses_title():
    model = flask_app.model
    assert model.calculate_overall_score(80, 60, -1, -1) == pytest.approx(70)
    assert model.calculate_overall_score(80, 60, 100, -1) == pytest.approx(0.45 * 80 + 0.45 * 60 + 10)


def test_unrecognised_degree_is_unknown_not_above_phd():
    model = flask_app.model
    assert model.get_degree_value("Not Specified") is None
    assert model.get_degree_value("Bachelor") == 1
    assert model.calculate_degree_similarity("phd", "Not Specified") == 0


def test_exact_skill_match_ignores_order():
    score, matches = flask_app.model.calculate_skill_similarity("sql,python", "python,sql")
    assert score == pytest.approx(100)
    assert all(m["similarity"] == 100 for m in json.loads(matches))


def test_recommendations_cover_all_jobs_and_rank_relevant_titles_first():
    model = flask_app.model
    result, skill_matches = model.recommend_jobs(pd.DataFrame([user()]))
    assert len(result) == len(model.data)
    assert result.similarity.min() >= 0
    assert result.similarity.max() <= 100
    top_titles = model.data.set_index("job_id").loc[result.head(10).id, "job_title"].str.lower()
    assert top_titles.str.contains("data|analyst|scien|machine learning|bi |intelligence").sum() >= 6
    assert list(skill_matches.id) == list(result.id)


# --- API -----------------------------------------------------------------------------------------------------

def test_evaluate_endpoint_returns_score(client):
    response = client.post("/evaluate", json={"question_id": 1, "user_answer": STRONG})
    assert response.status_code == 200
    body = response.get_json()
    assert body["success"] is True
    assert isinstance(body["score"], float)
    # PracticeSessionController.saveSession rejects a session without one feedback string per answer
    assert isinstance(body["feedback"], str) and body["feedback"]


def test_feedback_names_missing_key_points_for_weak_answers(evaluator):
    weak = evaluator.evaluate_with_feedback(1, PARTIAL)
    assert "Consider mentioning:" in weak["feedback"]
    strong = evaluator.evaluate_with_feedback(1, STRONG)
    assert strong["feedback"].startswith("Strong answer")


@pytest.mark.parametrize("payload,status", [
    ({"question_id": 1}, 400),
    ({"question_id": 1, "user_answer": "   "}, 400),
    ({"question_id": "abc", "user_answer": "x"}, 400),
    ({"question_id": 999999, "user_answer": "x"}, 400),
])
def test_evaluate_endpoint_rejects_bad_input(client, payload, status):
    assert client.post("/evaluate", json=payload).status_code == status


def test_recommend_endpoint_matches_frontend_contract(client):
    response = client.post("/recommend", json=user())
    assert response.status_code == 200
    body = response.get_json()
    assert body["success"] is True
    first = body["result"][0]
    assert {"id", "similarity", "title_score", "skill_score"} <= first.keys()
    # JobDetail.tsx looks skill matches up by `id`
    assert {"id", "skill_matches"} <= body["skill_matches"][0].keys()


def test_recommend_endpoint_requires_skills(client):
    response = client.post("/recommend", json=user(skills=""))
    assert response.status_code == 400
